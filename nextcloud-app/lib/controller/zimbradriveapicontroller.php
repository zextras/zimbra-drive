<?php
/**
 * Zimbra Drive App
 * Copyright (C) 2017  Zextras Srl
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * If you require any further information, feel free to contact legal@zextras.com.
 */

namespace OCA\ZimbraDrive\Controller;

use OCA\ZimbraDrive\Response\DownloadNodeResponseFactory;
use OCA\ZimbraDrive\Response\EmptyResponse;
use OCA\ZimbraDrive\Service\ResponseVarName;
use OCA\ZimbraDrive\Service\SearchService;
use OCA\ZimbraDrive\Service\StorageService;
use OCA\ZimbraDrive\Service\LogService;
use OCA\ZimbraDrive\Service\BadRequestException;
use OCP\AppFramework\ApiController;
use OCP\Files\Node;
use OCP\IRequest;
use OCP\AppFramework\Http\JSONResponse;
use OCA\ZimbraDrive\Service\LoginService;
use OCA\ZimbraDrive\Service\UnauthorizedException;
use OCP\AppFramework\Http;
use OCA\ZimbraDrive\Service\MethodNotAllowedException;
use \Exception;
use OCP\Files\NotPermittedException;
use OCP\AppFramework\Http\Response;

class ZimbraDriveApiController extends ApiController
{
    const OK_STATUS_CODE = 0;
    const FILE_ALREADY_EXISTS_STATUS_CODE = 1;
    const NOT_PERMITTED_EXCEPTION_STATUS_CODE = 2;
    const NO_FILE_IN_THE_REQUEST = 3;

    private $logger;
    private $loginService;
    private $storageService;
    private $searchService;
    private $downloadNodeResponseFactory;

    public function __construct(
        $appName,
        IRequest $request,
        LoginService $loginService,
        StorageService $storageService,
        SearchService $searchService,
        DownloadNodeResponseFactory $downloadNodeResponseFactory,
        LogService $logger
    )
    {
        parent::__construct(
            $appName,
            $request,
            'POST'
        );

        $this->logger = $logger;
        $this->loginService = $loginService;
        $this->storageService = $storageService;
        $this->searchService = $searchService;
        $this->downloadNodeResponseFactory = $downloadNodeResponseFactory;
    }

    /**
     * @CORS
     * @NoCSRFRequired
     * @PublicPage
     * @param $username
     * @param $token
     * @param $query
     * @param $types
     * @param $caseSensitive bool
     * @return Response
     */
    public function searchRequest($username, $token, $query, $types, $caseSensitive)
    {
        $this->logger->debug($username . ' call searchRequest.');
        try {
            $this->loginService->login($username, $token);
        } catch (UnauthorizedException $unauthorizedException) {
            $this->logUnauthorizedLogin($unauthorizedException);
            return new EmptyResponse(Http::STATUS_UNAUTHORIZED);
        }

        $types = json_decode($types, false);
        if($types === array('document'))
        {
            $types = array('file');
        }
        $caseSensitive = $caseSensitive === "true";

        try {
            $wantedFiles =  $this->searchService->search($query, $caseSensitive);
        } catch (BadRequestException $badRequestException) {
            $this->logger->info($badRequestException->getMessage());
            return new EmptyResponse(Http::STATUS_BAD_REQUEST);
        }
        catch (MethodNotAllowedException $methodNotAllowedException) {
            $this->logger->info($methodNotAllowedException->getMessage());
            return new EmptyResponse(Http::STATUS_METHOD_NOT_ALLOWED);
        }

        $results = $this->filterNodesByType($wantedFiles, $types);
        $resultsNoShares = $this->filterShareNodes($results);
        return new JSONResponse($resultsNoShares);
    }

    /**
     * @param $nodes array
     * @param $allowedTypes array of string
     * @return array
     */
    private function filterNodesByType($nodes, $allowedTypes)
    {
        $results = array();
        foreach($nodes as $node)
        {
            if($this->nodeHasAValidType($node, $allowedTypes))
            {
                $results[] = $node;
            }
        }
        return $results;

    }

    /**
     * @param $node Node
     * @param $validTypes array
     * @return bool
     */
    private function nodeHasAValidType($node, $validTypes)
    {
        return in_array($node[ResponseVarName::NODE_TYPE_VAR_NAME], $validTypes, true);
    }

    /**
     * @CORS
     * @NoCSRFRequired
     * @PublicPage
     * @param $username
     * @param $token
     * @return \OCP\AppFramework\Http\Response
     */
    public function getAllFolders($username, $token)
    {
        $this->logger->debug($username . ' call getAllFolders.');
        try {
            $this->loginService->login($username, $token);
        } catch (UnauthorizedException $unauthorizedException) {
            $this->logUnauthorizedLogin($unauthorizedException);
            return new EmptyResponse(Http::STATUS_UNAUTHORIZED);
        }

        try {
            $searchedFolder = $this->storageService->getFolder(StorageService::ROOT);
        } catch (Exception $exception) {
            $this->logger->info($exception->getMessage());
            return new EmptyResponse(Http::STATUS_FORBIDDEN);
        }
        $folderTree = $this->storageService->getFolderTreeAttributes($searchedFolder);
        $folderTreeNoShare = $this->filterShareTreeNodes($folderTree);
        return new JSONResponse($folderTreeNoShare);
    }

    /**
     * @CORS
     * @NoCSRFRequired
     * @PublicPage
     * @param $username
     * @param $token
     * @param $path
     * @return Response
     */
    public function getFile($username, $token, $path)

    {
        $this->logger->debug($username . ' call getFile.');
        try {
            $this->loginService->login($username, $token);
        } catch (UnauthorizedException $unauthorizedException) {
            $this->logUnauthorizedLogin($unauthorizedException);
            return new EmptyResponse(Http::STATUS_UNAUTHORIZED);
        }

        $node = $this->storageService->getNode($path);
        return $this->downloadNodeResponseFactory->makeDownloadNodeResponse($node);
    }

    /**
     * @CORS
     * @NoCSRFRequired
     * @PublicPage
     * @param $username
     * @param $token
     * @param $path
     * @return \OCP\AppFramework\Http\Response
     */
    public function delete($username, $token, $path)
    {
        $this->logger->debug($username . ' call delete.');
        try {
            $this->loginService->login($username, $token);
        } catch (UnauthorizedException $unauthorizedException) {
            $this->logUnauthorizedLogin($unauthorizedException);
            return new EmptyResponse(Http::STATUS_UNAUTHORIZED);
        }

        try {
            $nodeToDelete = $this->storageService->getNode($path);
        }
        catch (MethodNotAllowedException $methodNotAllowedException) {
            $this->logger->info($methodNotAllowedException->getMessage());
            return new EmptyResponse(Http::STATUS_METHOD_NOT_ALLOWED);
        } catch (Exception $exception) {
            $this->logger->info($exception->getMessage());
            return new EmptyResponse(Http::STATUS_FORBIDDEN);
        }

        try
        {
            $nodeToDelete->delete();
        }
        catch (NotPermittedException $exception)
        {
            $this->logger->info($exception->getMessage());
            return new EmptyResponse(Http::STATUS_METHOD_NOT_ALLOWED);
        }

        return new JSONResponse(array());

    }

    /**
     * @CORS
     * @NoCSRFRequired
     * @PublicPage
     * @param $username
     * @param $token
     * @param $source_path string
     * @param $target_path string
     * @return \OCP\AppFramework\Http\Response
     */
    public function move($username, $token, $source_path, $target_path)
    {
        $this->logger->debug($username . ' call move.');
        try {
            $this->loginService->login($username, $token);
        } catch (UnauthorizedException $unauthorizedException) {
            $this->logUnauthorizedLogin($unauthorizedException);
            return new EmptyResponse(Http::STATUS_UNAUTHORIZED);
        }

        try {
            $this->storageService->move($source_path, $target_path);
        }
        catch (MethodNotAllowedException $methodNotAllowedException) {
            $this->logger->info($methodNotAllowedException->getMessage());
            return new EmptyResponse(Http::STATUS_METHOD_NOT_ALLOWED);
        }
        catch (NotPermittedException $exception)
        {
            $this->logger->info($exception->getMessage());
            return new EmptyResponse(Http::STATUS_METHOD_NOT_ALLOWED);
        }
//        catch (Exception $exception) {
//            $this->logger->info($exception->getMessage());
//            return new EmptyResponse(Http::STATUS_METHOD_NOT_ALLOWED);
//        }

        return new JSONResponse(array());

    }

    /**
     * @CORS
     * @NoCSRFRequired
     * @PublicPage
     * @param $username
     * @param $token
     * @param $path
     * @return \OCP\AppFramework\Http\Response
     */
    public function newDirectory($username, $token, $path)
    {
        $this->logger->debug($username . ' call newDirectory with path = "'. $path . '"" .');
        try {
            $this->loginService->login($username, $token);
        } catch (UnauthorizedException $unauthorizedException) {
            $this->logUnauthorizedLogin($unauthorizedException);
            return new EmptyResponse(Http::STATUS_UNAUTHORIZED);
        }

        $newFolder = null;
        try
        {
            $newFolder = $this->storageService->newDirectory($path);
        }
        catch (NotPermittedException $exception)
        {
            $this->logger->info($exception->getMessage());
            return new EmptyResponse(Http::STATUS_METHOD_NOT_ALLOWED);
        }
        catch (MethodNotAllowedException $methodNotAllowedException) {
            $this->logger->info($methodNotAllowedException->getMessage());
            return new EmptyResponse(Http::STATUS_METHOD_NOT_ALLOWED);
        }
        $newFolderAttributes = $this->storageService->getFolderTreeAttributes($newFolder);
        return new JSONResponse($newFolderAttributes);
    }

    /**
     * @CORS
     * @NoCSRFRequired
     * @PublicPage
     * @param $username
     * @param $token
     * @param $path
     * @return \OCP\AppFramework\Http\Response
     */
    public function uploadFile($username, $token, $path)
    {
        $this->logger->debug($username . ' call uploadFile.');

        try {
            $this->loginService->login($username, $token);
        } catch (UnauthorizedException $unauthorizedException) {
            $this->logUnauthorizedLogin($unauthorizedException);
            return new EmptyResponse(Http::STATUS_UNAUTHORIZED);
        }

        $resultResponse = array();

        $files = $_FILES;
        foreach($files as $fileFieldName => $fileFieldValue)
        {
            $this->logger->info($fileFieldName . ' is loading');
            $tempFilePath = $fileFieldValue['tmp_name'];
            $fileName = basename($fileFieldValue['name']);

            if($tempFilePath === "" or $fileName === "")
            {
                $resultResponse[$fileFieldName] = $this->createFileStatusResponse(self::NO_FILE_IN_THE_REQUEST);
            }

            try
            {
                $this->storageService->uploadFile($fileName, $path, $tempFilePath);
                $resultResponse[$fileFieldName] = $this->createFileStatusResponse(self::OK_STATUS_CODE);
            }
            catch (NotPermittedException $notPermittedException)
            {
                $this->logger->info($notPermittedException->getMessage());
                $resultResponse[$fileFieldName] = $this->createFileStatusResponse(self::NOT_PERMITTED_EXCEPTION_STATUS_CODE);
            }
            catch (MethodNotAllowedException $methodNotAllowedException) {
                $this->logger->info($methodNotAllowedException->getMessage());
                $resultResponse[$fileFieldName] = $this->createFileStatusResponse(self::FILE_ALREADY_EXISTS_STATUS_CODE);
            }
        }

        return new JSONResponse($resultResponse);
    }

    /**
     * @param $statusCode
     * @return array
     */
    private function createFileStatusResponse($statusCode)
    {
        return array("statusCode" => $statusCode);
    }

    /**
     * @param $nodes array
     * @return array
     */
    private function filterShareNodes($nodes)
    {
        $results = array();
        foreach ($nodes as $node)
        {
            if($node[ResponseVarName::SHARED_VAR_NAME] === false)
            {
                $results[] = $node;
            }
        }
        return $results;
    }

    /**
     * @param $nodeTree
     * @return array
     */
    private function filterShareTreeNodes($nodeTree)
    {
        $filterTree = $nodeTree;
        if($nodeTree[ResponseVarName::SHARED_VAR_NAME] === true)
        {
            return array();
        }

        $filterChildren = array();
        $children = $nodeTree[ResponseVarName::CHILDREN_VAR_NAME];
        foreach ($children as $child)
        {
            $filterChild = self::filterShareTreeNodes($child);
            if(!empty($filterChild))
            {
                $filterChildren[] = $filterChild;
            }
        }
        $filterTree[ResponseVarName::CHILDREN_VAR_NAME] = $filterChildren;
        return $filterTree;

    }

    /**
     * @param $exception Exception
     */
    private function logUnauthorizedLogin($exception)
    {
        $this->logger->info($exception->getMessage());
    }
}