<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */

namespace OCA\ZimbraDrive\Service\Test;


class ConnectionTestResult
{
    /** @var  bool */
    private $isConnected;
    /** @var  string */
    private $errorMessage;

    /**
     * ConnectionTestResult constructor.
     * @param bool $isConnected
     * @param string $errorMessage
     */
    public function __construct($isConnected, $errorMessage)
    {
        $this->isConnected = $isConnected;
        $this->errorMessage = $errorMessage;
    }

    /**
     * @return bool
     */
    public function isIsConnected()
    {
        return $this->isConnected;
    }

    /**
     * @return string
     */
    public function getErrorMessage()
    {
        return $this->errorMessage;
    }
}