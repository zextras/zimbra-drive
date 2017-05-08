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
use OCP\IConfig;

class AppSettings
{
    const ZIMBRA_URL = "zimbra_url";
    const ZIMBRA_PORT = "zimbra_port";
    const USE_SSL = "use_ssl";
    const TRUST_INVALID_CERTS = "trust_invalid_certs";
    const PREAUTH_KEY = "preauth_key";
    const ALLOW_ZIMBRA_USERS_LOGIN = "allow_zimbra_users_login";
    const ENABLE_ZIMBRA_USERS = "enable_zimbra_users";

    /** @var IConfig */
    private $config;

    /**
     * AppSettings constructor.
     * @param $config
     */
    public function __construct(IConfig $config)
    {
        $this->config = $config;
    }

    public function getServerUrl()
    {
        return $this->config->getAppValue(Application::APP_NAME, self::ZIMBRA_URL);
    }

    public function getServerPort()
    {
        return $this->config->getAppValue(Application::APP_NAME, self::ZIMBRA_PORT);
    }

    public function useSSLDuringZimbraAuthentication()
    {
        return $this->config->getAppValue(Application::APP_NAME, self::USE_SSL, 'true') === 'true';
    }


    public function trustInvalidCertificatesDuringZimbraAuthentication()
    {
        return $this->config->getAppValue(Application::APP_NAME, self::TRUST_INVALID_CERTS, 'false') === 'true';
    }


    public function getZimbraPreauthKey()
    {
        return $this->config->getAppValue(Application::APP_NAME, self::PREAUTH_KEY);
    }

    public function allowZimbraUsersLogin()
    {
        return $this->config->getAppValue(Application::APP_NAME, self::ALLOW_ZIMBRA_USERS_LOGIN, 'false') === 'true';
    }

}