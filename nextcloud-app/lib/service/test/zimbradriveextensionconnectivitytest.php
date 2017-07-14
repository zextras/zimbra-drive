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

namespace OCA\ZimbraDrive\Service\Test;

use OCA\ZimbraDrive\Service\LogService;
use OCA\ZimbraDrive\Settings\AppSettings;
use OCP\IConfig;

class ZimbraDriveExtensionConnectivityTest implements Test
{
    /**
     * @var IConfig
     */
    private $config;
    /**
     * @var LogService
     */
    private $logger;
    /**
     * @var AppSettings
     */
    private $appSettings;

    /**
     * @param IConfig $config
     * @param LogService $logger
     * @param AppSettings $appSettings
     */
    public function __construct(IConfig $config, LogService $logger, AppSettings $appSettings)
    {
        $this->config = $config;
        $this->logger = $logger;
        $this->appSettings = $appSettings;
    }

    /**
     * @return TestResult
     */
    public function run()
    {
        $connectionResult = $this->zimbraDriveExtensionServiceIsConnected();
        if($connectionResult->isIsConnected())
        {
            $message = "Zimbra Drive app can reach Zimbra Drive extension.";
            return new TestOk($this->getName(), $message);
        }else
        {
            return new TestKo($this->getName(), $connectionResult->getErrorMessage());
        }
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "Zimbra Drive extension connection test";
    }

    /**
     * @return ConnectionTestResult
     */
    public function zimbraDriveExtensionServiceIsConnected()
    {
        $zimbra_url =$this->appSettings->getServerUrl();
        $zimbra_port = $this->appSettings->getServerPort();
        $use_ssl = $this->appSettings->useSSLDuringZimbraAuthentication();
        $trust_invalid_certs = $this->appSettings->trustInvalidCertificatesDuringZimbraAuthentication();

        $url = sprintf(
            "%s://%s:%s/service/extension/ZimbraDrive_ConnectivityTest",
            "http" . ($use_ssl ? "s" : ""),
            $zimbra_url,
            $zimbra_port
        );

        //open connection
        $ch = curl_init();

        //set the url, number of POST vars, POST data
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        if ($trust_invalid_certs) {
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
        } else {
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 2);
        }

        //execute post
        curl_exec($ch);
        $response_info = curl_getinfo($ch);
        $http_code = $response_info["http_code"];

        //close connection
        curl_close($ch);
        $isConnectionOk = false;
        if($http_code === 200)
        {
            $message = "Zimbra Drive app can reach Zimbra Drive extension.";
            $isConnectionOk = true;
        }else
        {
            $message = "Impossible to connect to Zimbra Drive extension (response http code: " . $http_code . " )";
        }
        return new ConnectionTestResult($isConnectionOk, $message);
    }
}

