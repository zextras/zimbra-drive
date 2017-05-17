<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */

namespace OCA\ZimbraDrive\Service\Test;


class TestKo extends TestResult
{

    /**
     * @param string $testName
     * @param string $message
     */
    public function __construct($testName, $message = '')
    {
        parent::__construct($testName,false, $message);
    }
}