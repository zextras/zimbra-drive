<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */

namespace OCA\ZimbraDrive\Service\Test;


class CloudConnectivityTest implements Test
{
    /**
     * @return TestResult
     */
    public function run()
    {
        $message = "Zimbra Drive app is installed.";
        return new TestOk($this->getName(), $message);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return "Zimbra Drive app installation test";
    }
}