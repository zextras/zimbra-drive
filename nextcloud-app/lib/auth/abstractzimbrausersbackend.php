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
use Psr\Log\LoggerInterface;
use OCP\Security\VerificationToken\IVerificationToken;
use OCP\Defaults;
use OCP\L10N\IFactory;
use OCP\IURLGenerator;
use OC\Accounts\Account;

abstract class AbstractZimbraUsersBackend extends RetroCompatibleBackend
{
    const ZIMBRA_GROUP = "zimbra";
    protected $logger;
    protected $config;
    protected $userManager;
    protected $groupManager;
    protected $allow_zimbra_users_login;
    protected $setZimbraGroupToUsers;
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

        $this->logger = $server->get(LoggerInterface::class);
        $this->config = $server->getConfig();
        $this->userManager = $server->getUserManager();
        $this->groupManager = $server->getGroupManager();

        if(class_exists('OC\Accounts\AccountManager')) //Nextcloud >= 11
        {
            $this->accountManager = new AccountManager(
                $server->getDatabaseConnection(),
                $this->config, // Nextcloud >= 21
                $server->getEventDispatcher(),
                $server->getJobList(), //Nextcloud >= 12.0.1
                $this->logger, // Nexcloud >= 18.0.0
                $server->get(IVerificationToken::class),
                $server->getMailer(),
                $server->get(Defaults::class),
                $server->get(IFactory::class),
                $server->get(IURLGenerator::class),
                $server->getCrypto()
            );
        }

        $appSettings = new AppSettings($this->config);
        $this->allow_zimbra_users_login = $appSettings->allowZimbraUsersLogin();
        $this->setZimbraGroupToUsers = $appSettings->setZimbraGroupToUsers();
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
            $user = $this->userManager->get($zimbraUser->getUid());
            $account = $this->accountManager->getAccount($user);
            $this->setDefaultUserAttributes($zimbraUser, $account);

            return $zimbraUser->getUid();
        } catch (\Exception $ignore)
        {
            return false;
        }
    }

    /**
     * @param ZimbraUser $zimbraUser
     * @param Account $account
     */
    private function setDefaultUserAttributes($zimbraUser, $account){
        $this->restoreUserEmailIfChanged($account, $zimbraUser->getEmail());
        $this->restoreUserDisplayNameIfChanged($account, $zimbraUser->getDisplayName());
        $this->setDefaultGroups($account);
    }

    /**
     * @param $account Account
     */
    private function setDefaultGroups($account)
    {
        $user = $account->getUser();

        $accountEmail = '';
        if(!is_null($account->getProperty(AccountManager::PROPERTY_EMAIL)))
        {
            $accountEmail = $account->getProperty(AccountManager::PROPERTY_EMAIL)->getValue();
        }

        if ($this->setZimbraGroupToUsers)
        {
            $this->insertUserInGroup($user, self::ZIMBRA_GROUP);
        }
        $this->insertUserInGroup($user, $this->getEmailDomain($accountEmail));
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
     * @param $account Account
     * @param $userEmail string
     */
    private function restoreUserEmailIfChanged(Account $account, $userEmail)
    {
        $accountEmail = '';
        if(!is_null($account->getProperty(AccountManager::PROPERTY_EMAIL)))
        {
            $accountEmail = $account->getProperty(AccountManager::PROPERTY_EMAIL)->getValue();
        }
        if( $accountEmail !== $userEmail)
        {
            $this->setUserEmailAddress($account, $userEmail);
        }
    }

    private function setUserEmailAddress(Account $account, $userEmail){
        $account->setProperty(AccountManager::PROPERTY_EMAIL, $userEmail, AccountManager::SCOPE_LOCAL, AccountManager::NOT_VERIFIED);
        $this->accountManager->updateAccount($account);
    }

    private function setUserDisplayName(Account $account, $userDisplayName){
        $account->setProperty(AccountManager::PROPERTY_DISPLAYNAME, $userDisplayName, AccountManager::SCOPE_LOCAL, AccountManager::NOT_VERIFIED);
        $this->accountManager->updateAccount($account);
    }

    private function restoreUserDisplayNameIfChanged(Account $account, $userDisplayName)
    {
        $accountDisplayName = '';
        if(!is_null($account->getProperty(AccountManager::PROPERTY_DISPLAYNAME)))
        {
            $accountDisplayName = $account->getProperty(AccountManager::PROPERTY_DISPLAYNAME)->getValue();
        }
        if( $accountDisplayName !== $userDisplayName)
        {
            $this->setUserDisplayName($account, $userDisplayName);
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

