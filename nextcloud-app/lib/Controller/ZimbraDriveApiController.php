<?php
/**
 * Copyright (C) 2017 ZeXtras S.r.l.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, version 2 of
 * the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License.
 * If not, see <http://www.gnu.org/licenses/>.
 */

namespace OCA\ZimbraDrive\Controller;


use OCA\ZimbraDrive\Response\EmptyResponse;
use OCA\ZimbraDrive\Service\ResponseVarName;
use OCA\ZimbraDrive\Service\SearchService;
use OCA\ZimbraDrive\Service\StorageService;
use OCA\ZimbraDrive\Service\LogService;
use OCA\ZimbraDrive\Service\BadRequestException;
use OCP\AppFramework\ApiController;
use OCP\IRequest;
use OCP\AppFramework\Http\JSONResponse;
use OCA\ZimbraDrive\Service\LoginService;
use OCA\ZimbraDrive\Service\UnauthorizedException;
use OCP\AppFramework\Http;
use OCA\ZimbraDrive\Service\MethodNotAllowedException;
use \Exception;
use OCP\Files\NotPermittedException;
use OCA\ZimbraDrive\Response\NodeResponse;
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

    public function __construct(
        $appName,
        IRequest $request,
        LoginService $loginService,
        StorageService $storageService,
        SearchService $searchService,
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

        $results = $this->filterTypes($wantedFiles, $types);
        $resultsNoShares = $this->filterShareNodes($results);
        return new JSONResponse($resultsNoShares);
    }

    /**
     * @param $mapsToBeFilter array
     * @param $types array of string
     * @return array
     */
    private function filterTypes($mapsToBeFilter, $types)
    {
        $results = array();
        foreach($mapsToBeFilter as $mapToBeFilter)
        {
            if($this->isAValidType($mapToBeFilter, $types))
            {
                $results[] = $mapToBeFilter;
            }
        }
        return $results;

    }

    /**
     * @param $mapToBeFilter string
     * @param $types array
     * @return bool
     */
    private function isAValidType($mapToBeFilter, $types)
    {
        return in_array($mapToBeFilter[ResponseVarName::NODE_TYPE_VAR_NAME], $types, true);
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
     * @return \OCP\AppFramework\Http\Response
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

        return new NodeResponse($path);
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
            $this->storageService->safeDelete($nodeToDelete);
        }
        catch (MethodNotAllowedException $exception)
        {
            $this->logger->info($exception->getMessage());
            return new EmptyResponse(Http::STATUS_METHOD_NOT_ALLOWED);
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
     * @param $source_path
     * @param $target_path
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
        $this->logger->debug($username . ' call newDirectory.');
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

            if($tempFilePath == "" or $fileName == "")
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