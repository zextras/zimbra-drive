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

use OCA\ZimbraDrive\AppInfo\Application;

class OC_User_Zimbra extends \OC_User_Backend
{
    const ZIMBRA_GROUP = "zimbra";
    private $logger;
    private $config;
    private $zimbra_url;
    private $zimbra_port;
    private $use_ssl;
    private $trust_invalid_certs;
    private $url;
    private $userManager;
    private $groupManager;

    public function __construct()
    {
        $server = \OC::$server;

        $this->logger = $server->getLogger();
        $this->config = $server->getConfig();
        $this->userManager = $server->getUserManager();
        $this->groupManager = $server->getGroupManager();

        $appName = Application::APP_NAME;
        $this->zimbra_url = $this->config->getAppValue($appName, "zimbra_url");
        $this->zimbra_port = $this->config->getAppValue($appName, "zimbra_port");
        $this->use_ssl = $this->config->getAppValue($appName, "use_ssl", "true") == "true";
        $this->trust_invalid_certs = $this->config->getAppValue($appName, "trust_invalid_certs", "false") == "true";

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

        //open connection
        $ch = curl_init();

        //set the url, number of POST vars, POST data
        curl_setopt($ch, CURLOPT_URL, $this->url);
        curl_setopt($ch, CURLOPT_POST, count($fields));
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
        $http_code = $response_info["http_code"];

        //close connection
        curl_close($ch);

        if ($http_code == "200") {
            $response = json_decode($raw_response);
            $userId = $response->{'accountId'};
            $userDisplayName = $response->{'displayName'};
            $userEmail = $response->{'email'};

            if(!$this->userExists($userId))
            {
                $this->initializeUser($userId, $userDisplayName);
            }

            $user = $this->userManager->get($userId);
            $user->setEMailAddress($userEmail);

            return $userId;
        } else {
            return false;
        }
    }

    /**
     * @param $userId
     * @param $userDisplayName
     */
    private function initializeUser($userId, $userDisplayName)
    {
        $this->logger->debug('Initialize user ' . $userId . '.', ['app' => Application::APP_NAME]);
        $this->storeUser(
            $userId,
            $userDisplayName
        );

        $this->insertUserInGroup($userId, self::ZIMBRA_GROUP);
        $this->insertUserInGroup($userId, $this->zimbra_url);
    }

    /**
     * @param $userId
     * @param $group
     */
    private function insertUserInGroup($userId, $group)
    {
        $user = $this->userManager->get($userId);

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
     * Delete a user
     *
     * @param string $uid The username of the user to delete
     *
     * @return bool
     */
    public function deleteUser($uid)
    {
        OC_DB::executeAudited(
            'DELETE FROM `*PREFIX*zimbradrive_users`'
            . ' WHERE `uid` = ?',
            array($uid)
        );
        return true;
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
        $user = OC_DB::executeAudited(
            'SELECT `display_name` FROM `*PREFIX*zimbradrive_users`'
            . ' WHERE `uid` = ?',
            array($uid)
        )->fetchRow();
        $display_name = trim($user['display_name'], ' ');
        if (!empty($display_name)) {
            return $display_name;
        } else {
            return $uid;
        }
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
        $result = OC_DB::executeAudited(
            array(
                'sql' => 'SELECT `uid`, `display_name` FROM `*PREFIX*zimbradrive_users`'
                    . ' WHERE (LOWER(`display_name`) LIKE LOWER(?) '
                    . ' OR LOWER(`uid`) LIKE LOWER(?))',
                'limit' => $limit,
                'offset' => $offset
            ),
            array('%' . $search . '%', '%' . $search . '%')
        );

        $display_names = array();
        while ($row = $result->fetchRow()) {
            $display_names[$row['uid']] = $row['display_name'];
        }

        return $display_names;
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
        $result = OC_DB::executeAudited(
            array(
                'sql' => 'SELECT `uid` FROM `*PREFIX*zimbradrive_users`'
                    . ' WHERE LOWER(`uid`) LIKE LOWER(?)',
                'limit' => $limit,
                'offset' => $offset
            ),
            array($search . '%')
        );
        $users = array();
        while ($row = $result->fetchRow()) {
            $users[] = $row['uid'];
        }
        return $users;
    }

    /**
     * Determines if the backend can enlist users
     *
     * @return bool
     */
    public function hasUserListings()
    {
        return true;
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
        if (!$this->userExists($uid)) {
            return false;
        }
        OC_DB::executeAudited(
            'UPDATE `*PREFIX*zimbradrive_users` SET `display_name` = ?'
            . ' WHERE LOWER(`uid`) = ?',
            array($display_name, $uid)
        );
        return true;
    }

    /**
     * @param $uid
     * @param $display_name
     */
    private function storeUser($uid, $display_name)
    {
        if (!$this->userExists($uid)) {
            OC_DB::executeAudited(
                'INSERT INTO `*PREFIX*zimbradrive_users` ( `uid`, `display_name` )'
                . ' VALUES( ?, ? )',
                array($uid, $display_name)
            );
        }
    }

    /**
     * @param string $uid
     * @return bool
     */
    public function userExists($uid)
    {
        $result = OC_DB::executeAudited(
            'SELECT COUNT(*) FROM `*PREFIX*zimbradrive_users`'
            . ' WHERE LOWER(`uid`) = LOWER(?)',
            array($uid)
        );
        return $result->fetchOne() > 0;
    }
}

