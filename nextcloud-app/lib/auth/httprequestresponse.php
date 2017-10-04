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

namespace OCA\ZimbraDrive\Auth;

class HttpRequestResponse
{
    /** @var  string */
    private $rawResponse;
    /** @var  int */
    private $httpCode;
    /** @var bool */
    private $isConnectionErrorOccurred;
    private $connectionError;

    public function __construct($rawResponse, $httpCode, $isConnectionErrorOccurred, $connectionError)
    {
        $this->rawResponse = $rawResponse;
        $this->httpCode = $httpCode;
        $this->isConnectionErrorOccurred = $isConnectionErrorOccurred;
        $this->connectionError = $connectionError;
    }

    /**
     * @return mixed
     */
    public function getRawResponse()
    {
        return $this->rawResponse;
    }

    /**
     * @return integer
     */
    public function getHttpCode()
    {
        return $this->httpCode;
    }

    /**
     * @return bool
     */
    public function isConnectionErrorOccurred()
    {
        return $this->isConnectionErrorOccurred;
    }

    public function getConnectionError()
    {
        return $this->connectionError;
    }
}