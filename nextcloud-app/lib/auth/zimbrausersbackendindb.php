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

class ZimbraUsersBackendInDb extends AbstractZimbraUsersBackend
{
    /** @var \OCP\IDBConnection */
    private $databaseConnection;

    /**
     * ZimbraUsersBackendInDb constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $server = \OC::$server;
        $this->databaseConnection = $server->getDatabaseConnection();
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
        $sql='DELETE FROM `*PREFIX*zimbradrive_users`'
            . ' WHERE `uid` = ?';

        $statement = $this->databaseConnection->prepare($sql);
        $statement->bindParam(1, $uid, \PDO::PARAM_STR);
        $statement->execute();

        $statement->closeCursor();
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
        $sql='SELECT `display_name` FROM `*PREFIX*zimbradrive_users`'
            . ' WHERE `uid` = ?';

        $statement = $this->databaseConnection->prepare($sql);
        $statement->bindParam(1, $uid, \PDO::PARAM_STR);
        $statement->execute();

        $row = $statement->fetch();
        $statement->closeCursor();

        $display_name = trim($row['display_name'], ' ');
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
        if($search === '')
        {
            $sql = 'SELECT `uid`, `display_name` FROM `*PREFIX*zimbradrive_users`';
            $statement = $this->databaseConnection->prepare($sql, $limit, $offset);
        } else
        {
            $sql='SELECT `uid`, `display_name` FROM `*PREFIX*zimbradrive_users`'
                . ' WHERE (LOWER(`display_name`) LIKE LOWER(?) '
                . ' OR LOWER(`uid`) LIKE LOWER(?))';
            $statement = $this->databaseConnection->prepare($sql, $limit, $offset);
            $statement->bindParam(1, $search, \PDO::PARAM_STR);
            $statement->bindParam(2, $search, \PDO::PARAM_STR);
        }

        $statement->execute();

        $display_names = array();
        while ($row = $statement->fetch()) {
            $display_names[$row['uid']] = $row['display_name'];
        }

        $statement->closeCursor();

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
        if($search === '')
        {
            $sql='SELECT `uid` FROM `*PREFIX*zimbradrive_users`';
            $statement = $this->databaseConnection->prepare($sql, $limit, $offset);
        } else
        {
            $sql='SELECT `uid` FROM `*PREFIX*zimbradrive_users`'
                . ' WHERE LOWER(`uid`) LIKE LOWER(?)';
            $statement = $this->databaseConnection->prepare($sql, $limit, $offset);
            $statement->bindParam(1, $search, \PDO::PARAM_STR);
        }

        $statement->execute();

        $users = array();
        while ($row = $statement->fetch()) {
            $users[] = $row['uid'];
        }

        $statement->closeCursor();
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

        $sql='UPDATE `*PREFIX*zimbradrive_users` SET `display_name` = ?'
            . ' WHERE LOWER(`uid`) = ?';

        $statement = $this->databaseConnection->prepare($sql);
        $statement->bindParam(1, $display_name, \PDO::PARAM_STR);
        $statement->bindParam(2, $uid, \PDO::PARAM_STR);
        $statement->execute();

        $statement->closeCursor();
        return true;
    }

    /**
     * @param $uid
     * @param $display_name
     */
    protected function createUser($uid, $display_name)
    {
        if (!$this->userExists($uid)) {


            $sql='INSERT INTO `*PREFIX*zimbradrive_users` ( `uid`, `display_name` )'
                . ' VALUES( ?, ? )';

            $statement = $this->databaseConnection->prepare($sql);
            $statement->bindParam(1, $uid, \PDO::PARAM_STR);
            $statement->bindParam(2, $display_name, \PDO::PARAM_STR);
            $statement->execute();

            $statement->closeCursor();
        }
    }

    /**
     * @param string $uid
     * @return bool
     */
    public function userExists($uid)
    {
        $sql='SELECT COUNT(*) FROM `*PREFIX*zimbradrive_users`'
            . ' WHERE LOWER(`uid`) = LOWER(?)';

        $statement = $this->databaseConnection->prepare($sql);
        $statement->bindParam(1, $uid, \PDO::PARAM_STR);
        $statement->execute();

        $row = $statement->fetch();
        $statement->closeCursor();

        return $row['COUNT(*)'] !== "0";
    }
}

