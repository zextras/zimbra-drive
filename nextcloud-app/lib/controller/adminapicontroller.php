<?php
/**
 * Copyright 2017 Zextras Srl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

namespace OCA\ZimbraDrive\Controller;

use OCA\ZimbraDrive\Service\LogService;
use OCA\ZimbraDrive\Service\ZimbraAuthentication;
use OCP\AppFramework\ApiController;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IRequest;
use OCP\AppFramework\Http\Response;

class AdminApiController extends ApiController
{
    private $logger;
    /**
     * @var ZimbraAuthentication
     */
    private $authenticationService;

    /**
     * AdminApiController constructor.
     * @param string $appName
     * @param IRequest $request
     * @param ZimbraAuthentication $authenticationService
     * @param LogService $logger
     */
    public function __construct(
        $appName,
        IRequest $request,
        ZimbraAuthentication $authenticationService,
        LogService $logger
    )
    {
        parent::__construct(
            $appName,
            $request,
            'POST'
        );

        $this->logger = $logger;
        $this->authenticationService = $authenticationService;
    }

    /**
     * @return Response
     */
    public function enableZimbraAuthentication()
    {
        $this->authenticationService->enableZimbraAuthentication();
        return $this->successResponse();
    }

    /**
     * @return Response
     */
    public function disableZimbraAuthentication()
    {
        $this->authenticationService->disableZimbraAuthentication();
        return $this->successResponse();
    }

    private function successResponse()
    {
        return new JSONResponse(array("status" => "success"));
    }
}