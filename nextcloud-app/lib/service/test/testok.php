<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */

namespace OCA\ZimbraDrive\Service\Test;


class TestOk extends TestResult
{

    /**
     * @param string $testName
     * @param string $message
     */
    public function __construct($testName, $message = '')
    {
        parent::__construct($testName,true, $message);
    }
}