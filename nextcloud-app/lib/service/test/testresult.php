<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */

namespace OCA\ZimbraDrive\Service\Test;


class TestResult
{
    /**
     * @var bool $isPassed
     */
    private $isPassed;

    /**
     * @var string $message
     */
    private $message;

    /**
     * @var string $message
     */
    private $testName;

    /**
     * @param string $testName
     * @param bool $isPassed
     * @param string $message
     */
    public function __construct($testName, $isPassed, $message = '')
    {
        $this->testName = $testName;
        $this->isPassed = $isPassed;
        $this->message = $message;
    }

    public function getTestName()
    {
        return $this->testName;
    }

    /**
     * @return bool
     */
    public function isPassed(){
        return $this->isPassed;
    }

    /**
     * @return string
     */
    public function getMessage(){
        return $this->message;
    }
}