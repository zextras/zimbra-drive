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

namespace OCA\ZimbraDrive\Service\Test;

use OCA\ZimbraDrive\Service\LogService;
use OCA\ZimbraDrive\Settings\AppSettings;
use OCP\IConfig;

class ZimbraHostConnectionTest implements Test
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
        $connectionResult = $this->zimbraIsConnected();
        if($connectionResult->isIsConnected())
        {
            $message = "Zimbra Drive app can reach the host.";
            return new TestOk($this->name(), $message);
        }else
        {
            return new TestKo($this->name(), $connectionResult->getErrorMessage());
        }
    }

    /**
     * @return string
     */
    public function name()
    {
        return "Zimbra host connection test";
    }

    /**
     * @return ConnectionTestResult
     */
    public function zimbraIsConnected()
    {
        $zimbraIsConnected = false;
        $host = $this->appSettings->getServerUrl();
        $port = $this->appSettings->getServerPort();
        $waitTimeoutInSeconds = 10;
        $errStr = "";
        $fp = fsockopen($host,$port,$errCode,$errStr,$waitTimeoutInSeconds);
        if($fp){
            $zimbraIsConnected = true;
        }
        fclose($fp);
        return new ConnectionTestResult($zimbraIsConnected, $errStr);
    }
}

