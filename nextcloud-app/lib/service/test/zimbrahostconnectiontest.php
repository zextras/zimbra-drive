<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
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

