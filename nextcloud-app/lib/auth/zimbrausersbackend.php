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

class ZimbraUsersBackend extends RetroCompatibleBackend
{
    const ZIMBRA_GROUP = "zimbra";

    /** @var AbstractZimbraUsersBackend */
    private $oc_user_zimbra_backend;

    /** @var \OCP\ILogger  */
    private $logger;

    public function __construct()
    {
        $server = \OC::$server;
        $this->logger = $server->getLogger();

        $this->initializeOcUserZimbraBackend();
    }

    private function initializeOcUserZimbraBackend()
    {
        if (class_exists('OC\\User\\Account')) { //ownCloud 10 all user backend will be 'degraded' to authentication backend
            $this->oc_user_zimbra_backend = new ZimbraUsersBackendPassword($this);
        } else {
            $this->oc_user_zimbra_backend = new ZimbraUsersBackendInDb();
        }
    }

    /**
     * Check if the password is correct
     * @param string $uid The username
     * @param string $password The password
     * @return string
     *
     * Check if the password is correct without logging in the user
     * returns the user id or false
     */
    public function checkPassword($uid, $password)
    {
        return $this->oc_user_zimbra_backend->checkPassword($uid, $password);
    }

    /**
     * Delete a user
     *
     * @param string $uid The username of the user to delete
     *
     * @return bool
     */
    public function deleteUser($uid)
    {
        return $this->oc_user_zimbra_backend->deleteUser($uid);
    }

    /**
     * Get display name of the user
     *
     * @param string $uid user ID of the user
     *
     * @return string display name
     */
    public function getDisplayName($uid)
    {
        return $this->oc_user_zimbra_backend->getDisplayName($uid);
    }

    /**
     * Get a list of all display names and user ids.
     *
     * @param string $search
     * @param null $limit
     * @param null $offset
     * @return array with all displayNames (value) and the corresponding uids (key)
     */
    public function getDisplayNames($search = '', $limit = null, $offset = null)
    {
        return $this->oc_user_zimbra_backend->getDisplayNames($search, $limit, $offset);
    }

    /**
     * Get a list of all users
     *
     * @param string $search
     * @param null $limit
     * @param null $offset
     * @return array with all uids
     */
    public function getUsers($search = '', $limit = null, $offset = null)
    {
        return $this->oc_user_zimbra_backend->getUsers($search, $limit, $offset);
    }

    /**
     * Determines if the backend can enlist users
     *
     * @return bool
     */
    public function hasUserListings()
    {
        return $this->oc_user_zimbra_backend->hasUserListings();
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
        return $this->oc_user_zimbra_backend->setDisplayName($uid, $display_name);
    }

    /**
     * @param string $uid
     * @return bool
     */
    public function userExists($uid)
    {
        return $this->oc_user_zimbra_backend->userExists($uid);
    }
}

