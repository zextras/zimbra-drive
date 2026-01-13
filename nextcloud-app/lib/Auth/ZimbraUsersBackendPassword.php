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

namespace OCA\ZimbraDrive\Auth;

use \phpseclib\Crypt\Random;

class ZimbraUsersBackendPassword extends AbstractZimbraUsersBackend
{
    /** @var ZimbraUsersBackend */
    private $backend;
    public function __construct($backend, $server = null, $zimbraAuthenticationBackend = null)
    {
        parent::__construct($server, $zimbraAuthenticationBackend);
        $this->backend = $backend;
    }

    /**
     * @param $userId
     * @param $userDisplayName
     */
    protected function createUser($userId, $userDisplayName)
    {
        parent::__construct();

        $user = $this->userManager->createUserFromBackend($userId, Random::string(255), $this->backend);
        $user->setDisplayName($userDisplayName);
    }

    /**
     * Change the display name of a user
     *
     * @param string $uid The username
     * @param string $display_name The new display name
     *
     * @return true/false
     */
    public function setDisplayName($uid, $display_name)
    {
        $user = $this->userManager->get($uid);
        return $user->setDisplayName($display_name);
    }
}

