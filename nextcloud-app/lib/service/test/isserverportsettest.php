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

class IsServerPortSetTest implements Test
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
        $port = intval($this->appSettings->getServerPort());
        if($port > 0)
        {
            $message = "The server port is set.";
            return new TestOk($this->getName(), $message);
        }else
        {
            $message = "The server port is not set.";
            return new TestKo($this->getName(), $message);
        }
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "Is server port set test";
    }
}