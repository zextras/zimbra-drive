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

class EnabledZimbraUsersLoginTest implements Test
{
    private $appSettings;
    private $logger;

    /**
     * @param LogService $logger
     * @param AppSettings $appSettings
     * @internal param IConfig $config
     */
    public function __construct(LogService $logger, AppSettings $appSettings)
    {
        $this->logger = $logger;
        $this->appSettings = $appSettings;
    }

    /**
     * @return TestResult
     */
    public function run()
    {
        $allowZimbraUsersLogin = $this->appSettings->allowZimbraUsersLogin();
        if($allowZimbraUsersLogin)
        {
            $message = "Zimbra Drive authentication is enabled.";
            return new TestOk($this->getName(), $message);
        } else
        {
            $message = "Zimbra Drive authentication is disabled.";
            return new TestKo($this->getName(), $message);
        }
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "Enabled Zimbra's user login";
    }
}