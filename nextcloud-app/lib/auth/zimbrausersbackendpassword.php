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

use \phpseclib\Crypt\Random;

class ZimbraUsersBackendPassword extends AbstractZimbraUsersBackend
{

    /**
     * @param $userId
     * @param $userDisplayName
     */
    protected function createUser($userId, $userDisplayName)
    {
        parent::__construct();

        $user = $this->userManager->createUser($userId, Random::string(255));
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

