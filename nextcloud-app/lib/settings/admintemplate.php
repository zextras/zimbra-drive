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

namespace OCA\ZimbraDrive\Settings;

use OCA\ZimbraDrive\AppInfo\App;
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
            App::APP_NAME,
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