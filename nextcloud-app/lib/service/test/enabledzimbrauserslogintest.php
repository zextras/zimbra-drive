<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */

namespace OCA\ZimbraDrive\Service\Test;


use OCA\ZimbraDrive\Controller\AdminApiController;
use OCA\ZimbraDrive\Service\LogService;
use OCA\ZimbraDrive\Settings\AppSettings;
use OCP\IConfig;

class EnabledZimbraUsersLoginTest implements Test
{
    private $appSettings;
    private $logger;

    /**
     * @param LogService $logger
     * @param AppSettings $appSettings
     * @internal param IConfig $config
     */
    public function __construct(LogService $logger, AppSettings $appSettings)
    {
        $this->logger = $logger;
        $this->appSettings = $appSettings;
    }

    /**
     * @return TestResult
     */
    public function run()
    {
        $allowZimbraUsersLogin = $this->appSettings->allowZimbraUsersLogin();
        if($allowZimbraUsersLogin)
        {
            $message = "Zimbra Drive authentication is enabled.";
            return new TestOk($this->getName(), $message);
        } else
        {
            $message = "Zimbra Drive authentication is disabled.";
            return new TestKo($this->getName(), $message);
        }
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "Enabled Zimbra's user login";
    }
}