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
                "use_zimbra_auth" => $isUserBackEndOC_User_ZimbraDefined,
            ],
            'blank'
        );

        return $template;
    }
}