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

namespace OCA\ZimbraDrive\Service;

use OCP\IUserSession;

class LoginService
{
    const VAR_USERNAME_NAME = 'username';
    const VAR_PASSWORD_NAME = 'token';
    private $logger;
    private $sessionService;

    /**
     * LoginService constructor.
     * @param $logger
     * @param $sessionService
     */
    public function __construct(LogService $logger, IUserSession $sessionService)
    {
        $this->logger = $logger;
        $this->sessionService = $sessionService;
    }

    /**
     * @param $username
     * @param $password
     * @throws UnauthorizedException
     */
    public function login($username, $password)
    {
        $login = $this->sessionService->login($username, $password);
        if (! $login)
        {
            $errorMessage = $username . ' login failed.';
            throw new UnauthorizedException($errorMessage);
        }
    }
}