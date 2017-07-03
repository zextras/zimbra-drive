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

namespace OCA\ZimbraDrive\Settings;

use OCA\ZimbraDrive\AppInfo\Application;
use OCA\ZimbraDrive\Controller\AdminApiController;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;

class AdminTemplate
{
    /**
     * @var IConfig
     */
    private $config;
    /**
     * @var AppSettings
     */
    private $appConfig;

    /**
     * AdminTemplate constructor.
     * @param IConfig $config
     * @param AppSettings $appConfig
     */
    public function __construct(IConfig $config, AppSettings $appConfig)
    {
        $this->config = $config;
        $this->appConfig = $appConfig;
    }

    public function getTemplate()
    {
        /** @var array $user_backends */
        $user_backends = $this->config->getSystemValue(AdminApiController::USER_BACKEND_VAR_NAME, array());
        /** @var bool $isUserBackEndOC_User_ZimbraDefined */
        $isUserBackEndOC_User_ZimbraDefined = false;
        foreach($user_backends as $user_backend){
            $class = $user_backend['class'];
            if(isset($class) && $class === AdminApiController::ZIMBRA_USER_BACKEND_CLASS_VALUE)
            {
                $isUserBackEndOC_User_ZimbraDefined = true;
                break;
            }
        }

        $template = new TemplateResponse(
            Application::APP_NAME,
            'admin',
            [
                AppSettings::ZIMBRA_URL => $this->appConfig->getServerUrl(),
                AppSettings::ZIMBRA_PORT => $this->appConfig->getServerPort(),
                AppSettings::USE_SSL => $this->appConfig->useSSLDuringZimbraAuthentication(),
                AppSettings::TRUST_INVALID_CERTS => $this->appConfig->trustInvalidCertificatesDuringZimbraAuthentication(),
                AppSettings::PREAUTH_KEY => $this->appConfig->getZimbraPreauthKey(),
                AppSettings::ENABLE_ZIMBRA_USERS => $isUserBackEndOC_User_ZimbraDefined,
                AppSettings::ALLOW_ZIMBRA_USERS_LOGIN => $this->appConfig->allowZimbraUsersLogin()
            ],
            'blank'
        );

        return $template;
    }
}