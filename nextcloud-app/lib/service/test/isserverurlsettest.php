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

class IsServerUrlSetTest implements Test
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
        if($this->appSettings->getServerUrl() === '')
        {
            $message = "The server url is not set.";
            return new TestKo($this->getName(), $message);
        }else
        {
            $message = "The server url is set.";
            return new TestOk($this->getName(), $message);
        }
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "Is server url set test";
    }
}