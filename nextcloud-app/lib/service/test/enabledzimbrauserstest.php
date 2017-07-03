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


use OCA\ZimbraDrive\Controller\AdminApiController;
use OCP\IConfig;

class EnabledZimbraUsersTest implements Test
{
    /**
     * @var IConfig
     */
    private $config;

    /**
     * @param IConfig $config
     */
    public function __construct(IConfig $config)
    {
        $this->config = $config;
    }

    /**
     * @return TestResult
     */
    public function run()
    {
        if($this->isZimbraDriveAuthenticationEnabled())
        {
            $message = "Zimbra's users are enabled.";
            return new TestOk($this->getName(), $message);
        } else
        {
            $message = "Zimbra's users are disabled.";
            return new TestKo($this->getName(), $message);
        }
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "Enabled Zimbra's users test";
    }

    public function isZimbraDriveAuthenticationEnabled()
    {
        $isZimbraDriveAuthenticationEnabled = false;

        $userBackEnds = $this->config->getSystemValue(AdminApiController::USER_BACKEND_VAR_NAME, array());

        foreach($userBackEnds as $userBackEnd)
        {
            if($userBackEnd['class'] === AdminApiController::ZIMBRA_USER_BACKEND_CLASS_VALUE)
            {
                $isZimbraDriveAuthenticationEnabled = true;
            }
        }

        return $isZimbraDriveAuthenticationEnabled;
    }
}