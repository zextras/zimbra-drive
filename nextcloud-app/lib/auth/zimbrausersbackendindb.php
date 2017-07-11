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

class ZimbraUsersBackendInDb extends AbstractZimbraUsersBackend
{

    /**
     * Delete a user
     *
     * @param string $uid The username of the user to delete
     *
     * @return bool
     */
    public function deleteUser($uid)
    {
        \OC_DB::executeAudited(
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
        $user = \OC_DB::executeAudited(
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
        $result = \OC_DB::executeAudited(
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
        $result = \OC_DB::executeAudited(
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
        \OC_DB::executeAudited(
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
    protected function createUser($uid, $display_name)
    {
        if (!$this->userExists($uid)) {
            \OC_DB::executeAudited(
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
        $result = \OC_DB::executeAudited(
            'SELECT COUNT(*) FROM `*PREFIX*zimbradrive_users`'
            . ' WHERE LOWER(`uid`) = LOWER(?)',
            array($uid)
        );
        return $result->fetchOne() > 0;
    }
}

