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