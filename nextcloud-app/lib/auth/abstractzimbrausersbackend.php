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

namespace OCA\ZimbraDrive\Auth;

use \OCA\ZimbraDrive\Settings\AppSettings;

abstract class AbstractZimbraUsersBackend extends \OC_User_Backend
{
    const ZIMBRA_GROUP = "zimbra";
    protected $logger;
    protected $config;
    protected $zimbra_url;
    protected $zimbra_port;
    protected $use_ssl;
    protected $trust_invalid_certs;
    protected $url;
    protected $userManager;
    protected $groupManager;
    protected $allow_zimbra_users_login;

    public function __construct()
    {
        $server = \OC::$server;

        $this->logger = $server->getLogger();
        $this->config = $server->getConfig();
        $this->userManager = $server->getUserManager();
        $this->groupManager = $server->getGroupManager();

        $appSettings = new AppSettings($this->config);

        $this->zimbra_url =$appSettings->getServerUrl();
        $this->zimbra_port = $appSettings->getServerPort();
        $this->use_ssl = $appSettings->useSSLDuringZimbraAuthentication();
        $this->trust_invalid_certs = $appSettings->trustInvalidCertificatesDuringZimbraAuthentication();
        $this->allow_zimbra_users_login = $appSettings->allowZimbraUsersLogin();

        $this->url = sprintf(
            "%s://%s:%s/service/extension/ZimbraDrive_NcUserZimbraBackend",
            "http" . ($this->use_ssl ? "s" : ""),
            $this->zimbra_url,
            $this->zimbra_port
        );
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

        $httpRequestResponse = $this->doZimbraAuthenticationRequest($uid, $password);

        if ($httpRequestResponse->getHttpCode() === 200) {
            $response = json_decode($httpRequestResponse->getRawResponse());
            $userId = $response->{'accountId'};
            $userDisplayName = $response->{'displayName'};
            $userEmail = $response->{'email'};
            if(!$this->userManager->userExists($userId))
            {
                $this->createUser($userId, $userDisplayName);
                $this->setDefaultUserAttributes($userId, $userEmail);
            } else
            {
                $this->restoreUserAttributes($userId, $userEmail);
                $this->restoreUserEmailIfChanged($userId, $userEmail);
            }

            return $userId;
        } else {
            return false;
        }
    }

    /**
     * @param $userId string
     * @param $userEmail string
     */
    private function restoreUserAttributes($userId, $userEmail){
        $user = $this->userManager->get($userId);
        $this->restoreUserEmailIfChanged($userId, $userEmail);
        $this->setDefaultGroups($user);
    }

    /**
     * @param $userId string
     * @param $userEmail string
     */
    private function setDefaultUserAttributes($userId, $userEmail){
        $user = $this->userManager->get($userId);
        $user->setEMailAddress($userEmail);
        $this->setDefaultGroups($user);
    }

    /**
     * @param $user \OC\User\User
     */
    private function setDefaultGroups($user)
    {
        $this->insertUserInGroup($user, self::ZIMBRA_GROUP);
        $this->insertUserInGroup($user, $this->zimbra_url);
    }

    /**
     * @param $userId string
     * @param $userDisplayName string
     */
    protected abstract function createUser($userId, $userDisplayName);

    /**
     * @param $userId string
     * @param $userEmail string
     */
    private function restoreUserEmailIfChanged($userId, $userEmail)
    {
        $user = $this->userManager->get($userId);
        if( $user->getEMailAddress() !== $userEmail)
        {
            $user->setEMailAddress($userEmail);
        }
    }

    /**
     * @param $user \OC\User\User
     * @param $group
     */
    protected function insertUserInGroup($user, $group)
    {
        if(isset($user))
        {
            if(!$this->groupManager->groupExists($group))
            {
                $this->groupManager->createGroup($group);
            }

            $zimbraGroup = $this->groupManager->get($group);
            $zimbraGroup->addUser($user);
        }
    }

    /**
     * Change the display name of a user
     *
     * @param string $uid The username
     * @param string $display_name The new display name
     *
     * @return true/false
     */
    public abstract function setDisplayName($uid, $display_name);

    /**
     * @param $uid
     * @param $password
     * @return string
     */
    private function buildPostField($uid, $password)
    {
        $fields = array(
            "username" => $uid,
            "password" => $password
        );

        //url-ify the data for the POST
        $fields_string = "";
        foreach ($fields as $key => $value) {
            $fields_string .= $key . "=" . $value . "&";
        }
        $fields_string = rtrim($fields_string, "&");
        return $fields_string;
    }

    /**
     * @param $uid
     * @param $password
     * @return HttpRequestResponse
     */
    private function doZimbraAuthenticationRequest($uid, $password)
    {
        $fields_string = $this->buildPostField($uid, $password);

        //open connection
        $ch = curl_init();

        //set the url, number of POST vars, POST data
        curl_setopt($ch, CURLOPT_URL, $this->url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_string);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        if ($this->trust_invalid_certs) {
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
        } else {
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 2);
        }

        //execute post
        $raw_response = curl_exec($ch);
        $response_info = curl_getinfo($ch);
        curl_close($ch);
        $http_code = $response_info["http_code"];
        $httpRequestResponse = new HttpRequestResponse($raw_response, $http_code);
        return $httpRequestResponse;
    }
}

