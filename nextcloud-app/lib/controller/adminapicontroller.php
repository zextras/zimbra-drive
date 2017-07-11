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
use OCP\AppFramework\ApiController;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IConfig;
use OCP\IRequest;
use OCP\AppFramework\Http\Response;

class AdminApiController extends ApiController
{
    const USER_BACKEND_VAR_NAME = 'user_backends';
    const ZIMBRA_USER_BACKEND_CLASS_VALUE = 'OCA\ZimbraDrive\Auth\ZimbraUsersBackend';
    private $logger;
    /**
     * @var IConfig
     */
    private $config;

    /**
     * AdminApiController constructor.
     * @param string $appName
     * @param IRequest $request
     * @param IConfig $config
     * @param LogService $logger
     */
    public function __construct(
        $appName,
        IRequest $request,
        IConfig $config,
        LogService $logger
    )
    {
        parent::__construct(
            $appName,
            $request,
            'POST'
        );

        $this->logger = $logger;
        $this->config = $config;
    }

    /**
     * @return Response
     */
    public function enableZimbraAuthentication()
    {
        $userBackends = $this->config->getSystemValue(self::USER_BACKEND_VAR_NAME, array());

        $zimbraUserBackend = array(
            'class' => self::ZIMBRA_USER_BACKEND_CLASS_VALUE,
            'arguments' => array (),
        );
        $userBackends[] = $zimbraUserBackend;

        $this->config->setSystemValue(self::USER_BACKEND_VAR_NAME, $userBackends);
        return $this->successResponse();
    }

    /**
     * @return Response
     */
    public function disableZimbraAuthentication()
    {
        $userBackends = $this->config->getSystemValue(self::USER_BACKEND_VAR_NAME, array());

        $userBackendsWithoutZimbra = array();
        foreach($userBackends as $userBackend)
        {
            if($userBackend['class'] !== self::ZIMBRA_USER_BACKEND_CLASS_VALUE)
            {
                $userBackendsWithoutZimbra[] = $userBackend;
            }
        }
        if(count($userBackendsWithoutZimbra) === 0)
        {
            $this->config->deleteSystemValue(self::USER_BACKEND_VAR_NAME);
        }else
        {
            $this->config->setSystemValue(self::USER_BACKEND_VAR_NAME, $userBackendsWithoutZimbra);
        }
        return $this->successResponse();
    }

    private function successResponse()
    {
        return new JSONResponse(array("status" => "success"));
    }
}