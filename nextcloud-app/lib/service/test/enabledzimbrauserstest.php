<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */

namespace OCA\ZimbraDrive\Service\Test;


use OCA\ZimbraDrive\Controller\AdminApiController;
use OCP\IConfig;

class EnabledZimbraUsersTest implements Test
{
    /**
     * @var IConfig
     */
    private $config;

    /**
     * @param IConfig $config
     */
    public function __construct(IConfig $config)
    {
        $this->config = $config;
    }

    /**
     * @return TestResult
     */
    public function run()
    {
        if($this->isZimbraDriveAuthenticationEnabled())
        {
            $message = "Zimbra's users are enabled.";
            return new TestOk($this->getName(), $message);
        } else
        {
            $message = "Zimbra's users are disabled.";
            return new TestKo($this->getName(), $message);
        }
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "Enabled Zimbra's users test";
    }

    public function isZimbraDriveAuthenticationEnabled()
    {
        $isZimbraDriveAuthenticationEnabled = false;

        $userBackEnds = $this->config->getSystemValue(AdminApiController::USER_BACKEND_VAR_NAME, array());

        foreach($userBackEnds as $userBackEnd)
        {
            if($userBackEnd['class'] === AdminApiController::ZIMBRA_USER_BACKEND_CLASS_VALUE)
            {
                $isZimbraDriveAuthenticationEnabled = true;
            }
        }

        return $isZimbraDriveAuthenticationEnabled;
    }
}