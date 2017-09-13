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

class HttpRequestResponseBuilder
{
    private $rawResponse;
    /** @var int */
    private $httpCode;
    /** @var bool */
    private $isConnectionErrorOccurred;
    private $connectionError;


    public function __construct()
    {
        $this->rawResponse = "";
        $this->httpCode = 200;
        $this->isConnectionErrorOccurred = false;
        $this->connectionError = "";
    }


    public function setRawResponse($rawResponse)
    {
        $this->rawResponse = $rawResponse;
    }

    /**
     * @param int $httpCode
     */
    public function setHttpCode($httpCode)
    {
        $this->httpCode = $httpCode;
    }

    /**
     * @param bool $isConnectionErrorOccurred
     */
    public function setIsConnectionErrorOccurred($isConnectionErrorOccurred)
    {
        $this->isConnectionErrorOccurred = $isConnectionErrorOccurred;
    }

    public function setConnectionError($connectionError)
    {
        $this->connectionError = $connectionError;
    }

    public function build()
    {
        return new HttpRequestResponse($this->rawResponse, $this->httpCode, $this->isConnectionErrorOccurred, $this->connectionError);
    }
}