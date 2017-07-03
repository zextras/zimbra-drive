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