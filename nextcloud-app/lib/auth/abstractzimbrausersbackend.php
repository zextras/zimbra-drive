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

use OC\Accounts\AccountManager;
use OCA\ZimbraDrive\Settings\AppSettings;
use OC\User\User;
use OCP\IServerContainer;

abstract class AbstractZimbraUsersBackend extends \OC_User_Backend
{
    const ZIMBRA_GROUP = "zimbra";
    protected $logger;
    protected $config;
    protected $userManager;
    protected $groupManager;
    protected $allow_zimbra_users_login;
    /** @var AccountManager */
    private $accountManager;
    /** @var ZimbraAuthenticationBackend  */
    private $zimbraAuthenticationBackend;

    /**
     * @param IServerContainer $server
     * @param ZimbraAuthenticationBackend $zimbraAuthenticationBackend
     */
    public function __construct($server = null, $zimbraAuthenticationBackend = null)
    {
        if(is_null($server))
        {
            $server = \OC::$server;
        }
        if(is_null($zimbraAuthenticationBackend))
        {
            $this->zimbraAuthenticationBackend = new ZimbraAuthenticationBackendImpl($server);
        } else
        {
            $this->zimbraAuthenticationBackend = $zimbraAuthenticationBackend;
        }

        $this->logger = $server->getLogger();
        $this->config = $server->getConfig();
        $this->userManager = $server->getUserManager();
        $this->groupManager = $server->getGroupManager();

        if(class_exists('OC\Accounts\AccountManager')) //Nextcloud >= 11
        {
            $this->accountManager = new AccountManager(
                $server->getDatabaseConnection(),
                $server->getEventDispatcher(),
                $server->getJobList() //Nextcloud >= 12.0.1
            );
        }

        $appSettings = new AppSettings($this->config);
        $this->allow_zimbra_users_login = $appSettings->allowZimbraUsersLogin();
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
        if(!$this->allow_zimbra_users_login)
        {
            return false;
        }

        try
        {
            $zimbraUser = $this->zimbraAuthenticationBackend->getZimbraUser($uid, $password);
            if(!$this->userManager->userExists($zimbraUser->getUid()))
            {
                $this->createUser($zimbraUser->getUid(), $zimbraUser->getDisplayName());
            }
            $this->setDefaultUserAttributes($zimbraUser);

            return $zimbraUser->getUid();
        } catch (\Exception $ignore)
        {
            return false;
        }
    }

    /**
     * @param ZimbraUser $zimbraUser
     */
    private function setDefaultUserAttributes($zimbraUser){
        $user = $this->userManager->get($zimbraUser->getUid());
        $this->restoreUserEmailIfChanged($user, $zimbraUser->getEmail());
        $this->restoreUserDisplayNameIfChanged($user, $zimbraUser->getDisplayName());
        $this->setDefaultGroups($user);
    }

    /**
     * @param $user User
     */
    private function setDefaultGroups($user)
    {
        $this->insertUserInGroup($user, self::ZIMBRA_GROUP);
        $this->insertUserInGroup($user, $this->getEmailDomain($user->getEMailAddress()));
    }

    private function getEmailDomain($email)
    {
        $domain = substr($email, strpos($email, '@') + 1);
        return $domain;
    }


    /**
     * @param $userId string
     * @param $userDisplayName string
     */
    protected abstract function createUser($userId, $userDisplayName);

    /**
     * @param $user User
     * @param $userEmail string
     */
    private function restoreUserEmailIfChanged(User $user, $userEmail)
    {
        if( $user->getEMailAddress() !== $userEmail)
        {
            if(!is_null($this->accountManager)) //Nextcloud 11
            {
                $userData = $this->accountManager->getUser($user);
                $userData[AccountManager::PROPERTY_EMAIL]['value'] = $userEmail;
                $this->accountManager->updateUser($user, $userData);
            } else
            {
                $user->setEMailAddress($userEmail);
            }
        }
    }

    private function restoreUserDisplayNameIfChanged(User $user, $userDisplayName)
    {
        if($user->getDisplayName() !== $userDisplayName)
        {
            if(!is_null($this->accountManager)) //Nextcloud 11
            {
                $userData = $this->accountManager->getUser($user);
                $userData[AccountManager::PROPERTY_DISPLAYNAME]['value'] = $userDisplayName;
                $this->accountManager->updateUser($user, $userData);
            } else
            {
                $user->setDisplayName($userDisplayName);
            }
        }
    }


    /**
     * @param User $user
     * @param string $groupName
     */
    protected function insertUserInGroup(User $user, $groupName)
    {
        if(isset($user))
        {
            if(!$this->groupManager->groupExists($groupName))
            {
                $this->groupManager->createGroup($groupName);
            }

            $targetGroup = $this->groupManager->get($groupName);
            if(!$targetGroup->inGroup($user))
            {
                $targetGroup->addUser($user);
            }
        }
    }



    /**
     * Change the display name of a user
     *
     * @param string $uid The username
     * @param string $display_name The new display name
     *
     * @return bool
     */
    public abstract function setDisplayName($uid, $display_name);
}

