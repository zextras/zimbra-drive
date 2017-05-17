<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */

namespace OCA\ZimbraDrive\Service;

use OCP\IUserSession;

class LoginService
{
    const VAR_USERNAME_NAME = 'username';
    const VAR_PASSWORD_NAME = 'token';
    private $logger;
    private $sessionService;

    /**
     * LoginService constructor.
     * @param $logger
     * @param $sessionService
     */
    public function __construct(LogService $logger, IUserSession $sessionService)
    {
        $this->logger = $logger;
        $this->sessionService = $sessionService;
    }

    /**
     * @param $username
     * @param $password
     * @throws UnauthorizedException
     */
    public function login($username, $password)
    {
        $login = $this->sessionService->login($username, $password);
        if (! $login)
        {
            $errorMessage = $username . ' login failed.';
            throw new UnauthorizedException($errorMessage);
        }
    }
}