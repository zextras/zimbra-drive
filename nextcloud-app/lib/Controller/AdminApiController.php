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