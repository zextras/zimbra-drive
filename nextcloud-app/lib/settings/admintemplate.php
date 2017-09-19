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
use OCA\ZimbraDrive\Service\ZimbraAuthentication;
use OCP\AppFramework\Http\TemplateResponse;

class AdminTemplate
{
    /**
     * @var AppSettings
     */
    private $appConfig;
    /**
     * @var ZimbraAuthentication
     */
    private $zimbraAuthentication;

    public function __construct(AppSettings $appConfig, ZimbraAuthentication $zimbraAuthentication)
    {
        $this->appConfig = $appConfig;
        $this->zimbraAuthentication = $zimbraAuthentication;
    }

    /**
     * @return TemplateResponse
     */
    public function getTemplate()
    {
        /** @var bool $isUserBackEndOC_User_ZimbraDefined */
        $isUserBackEndOC_User_ZimbraDefined = $this->zimbraAuthentication->isZimbraAuthenticationEnabled();

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