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


use OCA\ZimbraDrive\Controller\AdminApiController;
use OCA\ZimbraDrive\Service\LogService;
use OCA\ZimbraDrive\Settings\AppSettings;
use OCP\IConfig;

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