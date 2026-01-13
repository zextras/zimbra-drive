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