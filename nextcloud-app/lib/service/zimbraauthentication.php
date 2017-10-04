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

namespace OCA\ZimbraDrive\Service;

use OCP\IConfig;


class ZimbraAuthentication
{
    const USER_BACKEND_VAR_NAME = 'user_backends';
    const ZIMBRA_USER_BACKEND_CLASS_VALUE = 'OCA\ZimbraDrive\Auth\ZimbraUsersBackend';
    private $logger;
    /**
     * @var IConfig
     */
    private $config;

    /**
     * @param IConfig $config
     * @param LogService $logger
     */
    public function __construct(
        IConfig $config,
        LogService $logger
    )
    {
        $this->logger = $logger;
        $this->config = $config;
    }

    public function enableZimbraAuthentication()
    {
        $userBackends = $this->config->getSystemValue(self::USER_BACKEND_VAR_NAME, array());

        $zimbraUserBackend = array(
            'class' => self::ZIMBRA_USER_BACKEND_CLASS_VALUE,
            'arguments' => array (),
        );
        $userBackends[] = $zimbraUserBackend;

        $this->config->setSystemValue(self::USER_BACKEND_VAR_NAME, $userBackends);
    }

    public function disableZimbraAuthentication()
    {
        $userBackends = $this->config->getSystemValue(self::USER_BACKEND_VAR_NAME, array());

        $userBackendsWithoutZimbra = array();
        foreach($userBackends as $userBackend)
        {
            if($userBackend['class'] !== self::ZIMBRA_USER_BACKEND_CLASS_VALUE)
            {
                $userBackendsWithoutZimbra[] = $userBackend;
            }
        }
        if(count($userBackendsWithoutZimbra) === 0)
        {
            $this->config->deleteSystemValue(self::USER_BACKEND_VAR_NAME);
        }else
        {
            $this->config->setSystemValue(self::USER_BACKEND_VAR_NAME, $userBackendsWithoutZimbra);
        }
    }

    public function isZimbraAuthenticationEnabled()
    {
        $userBackends = $this->config->getSystemValue(self::USER_BACKEND_VAR_NAME, array());
        foreach($userBackends as $userBackend){
            $class = $userBackend['class'];
            if(isset($class) && $class === ZimbraAuthentication::ZIMBRA_USER_BACKEND_CLASS_VALUE)
            {
                return true;
            }
        }
        return false;
    }
}