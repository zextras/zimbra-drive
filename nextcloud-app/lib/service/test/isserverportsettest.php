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