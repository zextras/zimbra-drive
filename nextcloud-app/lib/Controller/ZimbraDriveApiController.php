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

use OCA\ZimbraDrive\Service\StorageService;
use OCA\ZimbraDrive\Service\LogService;
use OCA\ZimbraDrive\Service\QueryService;
use OCA\ZimbraDrive\Service\BadRequestException;

use OCA\ZimbraDrive\Service\UserService;
use OCP\AppFramework\ApiController;
use OCP\Http\Client\IResponse;
use OCP\IRequest;
use OCP\AppFramework\Http\JSONResponse;

use OCA\ZimbraDrive\Service\LoginService;

use OCA\ZimbraDrive\Service\UnauthorizedException;
use OCP\AppFramework\Http;


use OCA\ZimbraDrive\Service\MethodNotAllowedException;
use \Exception;

use \OC\Files\Filesystem;
use \OCP\Response;

use OCP\AppFramework\Http\StreamResponse;

use OCP\Files\NotPermittedException;

use OCA\ZimbraDrive\Controller\EmptyResponse;


class ZimbraDriveApiController extends ApiController
{
    const OK_STATUS_CODE = 0;
    const FILE_ALREADY_EXISTS_STATUS_CODE = 1;
    const NOT_PERMITTED_EXCEPTION_STATUS_CODE = 2;
    const NO_FILE_IN_THE_REQUEST = 3;

    private $logger;
    private $loginService;
    private $storageService;
    private $queryService;

    public function __construct(
        $appName,
        IRequest $request,
        LoginService $loginService,
        StorageService $storageService,
        QueryService $queryService,
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
        $this->queryService = $queryService;
    }

    /**
     * @CORS
     * @NoCSRFRequired
     * @PublicPage
     */
    public function searchRequest($username, $token, $query)
    {
        $this->logger->info($username . ' call searchRequest.');
        try {
            $this->loginService->login($username, $token);
        } catch (UnauthorizedException $unautorizedException) {
            $this->logger->info($unautorizedException->getMessage());
            return new EmptyResponse(Http::STATUS_UNAUTHORIZED);
        }

        try {
            $path = $this->queryService->getPath($query);
        } catch (BadRequestException $badRequestException) {
            $this->logger->info($badRequestException->getMessage());
            return new EmptyResponse(Http::STATUS_BAD_REQUEST);
        }

        try {
            $searchedFolder = $this->storageService->getFolder($path);
        }
         catch (MethodNotAllowedException $methodNotAllowedException) {
            $this->logger->info($methodNotAllowedException->getMessage());
             return new EmptyResponse(Http::STATUS_METHOD_NOT_ALLOWED);
        } catch (Exception $exception) {
            $this->logger->info($exception->getMessage());
            return new EmptyResponse(Http::STATUS_FORBIDDEN);
        }
        $folderAsArray = $this->storageService->folderChildNodeNoFolderAttributes($searchedFolder);
        return new JSONResponse($folderAsArray);
    }

    /**
     * @CORS
     * @NoCSRFRequired
     * @PublicPage
     */
    public function getAllFolders($username, $token)
    {
        $this->logger->info($username . ' call getAllFolders.');
        try {
            $this->loginService->login($username, $token);
        } catch (UnauthorizedException $unautorizedException) {
            $this->logger->info($unautorizedException->getMessage());
            return new EmptyResponse(Http::STATUS_UNAUTHORIZED);
        }

        try {
            $searchedFolder = $this->storageService->getFolder(StorageService::ROOT);
        } catch (Exception $exception) {
            $this->logger->info($exception->getMessage());
            return new EmptyResponse(Http::STATUS_FORBIDDEN);
        }
        $folderAsArray = $this->storageService->getFolderAttributeTree($searchedFolder);
        return new JSONResponse($folderAsArray);
    }

    /**
     * @CORS
     * @NoCSRFRequired
     * @PublicPage
     */
    public function getFile($username, $token, $path)
    {
        $this->logger->info($username . ' call getFile.');
        try {
            $this->loginService->login($username, $token);
        } catch (UnauthorizedException $unautorizedException) {
            $this->logger->info($unautorizedException->getMessage());
            return new EmptyResponse(Http::STATUS_UNAUTHORIZED);
        }

        $directory = dirname($path);
        $fileName = basename($path);

        \OC_Files::get($directory, $fileName);
    }

    /**
     * @CORS
     * @NoCSRFRequired
     * @PublicPage
     */
    public function delete($username, $token, $path)
    {
        $this->logger->info($username . ' call delete.');
        try {
            $this->loginService->login($username, $token);
        } catch (UnauthorizedException $unautorizedException) {
            $this->logger->info($unautorizedException->getMessage());
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
     */
    public function move($username, $token, $source_path, $target_path)
    {
        $this->logger->info($username . ' call move.');
        try {
            $this->loginService->login($username, $token);
        } catch (UnauthorizedException $unautorizedException) {
            $this->logger->info($unautorizedException->getMessage());
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
     */
    public function newDirectory($username, $token, $path)
    {
        $this->logger->info($username . ' call newDirectory.');
        try {
            $this->loginService->login($username, $token);
        } catch (UnauthorizedException $unautorizedException) {
            $this->logger->info($unautorizedException->getMessage());
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
        $newFolderAttributes = $this->storageService->getFolderAttributeTree($newFolder);
        return new JSONResponse($newFolderAttributes);
    }

    /**
     * @CORS
     * @NoCSRFRequired
     * @PublicPage
     */
    public function uploadFile($username, $token, $path)
    {
        $this->logger->info($username . ' call uploadFile.');

        try {
            $this->loginService->login($username, $token);
        } catch (UnauthorizedException $unautorizedException) {
            $this->logger->info($unautorizedException->getMessage());
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



}