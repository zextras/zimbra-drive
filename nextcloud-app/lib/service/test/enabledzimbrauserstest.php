<?php
/**
 * Zimbra Drive App
 * Copyright (C) 2017  Zextras Srl
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * If you require any further information, feel free to contact legal@zextras.com.
 */

namespace OCA\ZimbraDrive\Service\Test;

use OCA\ZimbraDrive\Service\ZimbraAuthentication;
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

        $userBackEnds = $this->config->getSystemValue(ZimbraAuthentication::USER_BACKEND_VAR_NAME, array());

        foreach($userBackEnds as $userBackEnd)
        {
            if($userBackEnd['class'] === ZimbraAuthentication::ZIMBRA_USER_BACKEND_CLASS_VALUE)
            {
                $isZimbraDriveAuthenticationEnabled = true;
            }
        }

        return $isZimbraDriveAuthenticationEnabled;
    }
}