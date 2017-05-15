<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */

namespace OCA\ZimbraDrive\Service;

use OCP\ILogger;

class LogService
{
    private $logger;
    private $appName;

    public function __construct(ILogger $logger, $appName)
    {
        $this->logger = $logger;
        $this->appName = $appName;
    }

    /**
     * Runtime errors that do not require immediate action but should typically
     * be logged and monitored.
     *
     * @param string $message
     * @param array $context
     * @return void
     */
    public function error($message, array $context = array())
    {
        $context['app'] = $this->appName;
        $this->logger->error($message, $context);
    }

    /**
     * System is unusable.
     *
     * @param string $message
     * @param array $context
     * @return void
     */
    public function emergency($message, array $context = array())
    {
        $context['app'] = $this->appName;
        $this->logger->emergency($message, $context);
    }

    /**
     * Action must be taken immediately.
     *
     * @param string $message
     * @param array $context
     * @return void
     */
    public function alert($message, array $context = array())
    {
        $context['app'] = $this->appName;
        $this->logger->alert($message, $context);
    }

    /**
     * Critical conditions.
     *
     * @param string $message
     * @param array $context
     * @return void
     */
    public function critical($message, array $context = array())
    {
        $context['app'] = $this->appName;
        $this->logger->critical($message, $context);
    }

    /**
     * Exceptional occurrences that are not errors.
     *
     * @param string $message
     * @param array $context
     * @return void
     */
    public function warning($message, array $context = array())
    {
        $context['app'] = $this->appName;
        $this->logger->warning($message, $context);
    }

    /**
     * Normal but significant events.
     *
     * @param string $message
     * @param array $context
     * @return void
     */
    public function notice($message, array $context = array())
    {
        $context['app'] = $this->appName;
        $this->logger->notice($message, $context);
    }

    /**
     * Interesting events.
     *
     * @param string $message
     * @param array $context
     * @return void
     */
    public function info($message, array $context = array())
    {
        $context['app'] = $this->appName;
        $this->logger->info($message, $context);
    }

    /**
     * Detailed debug information.
     *
     * @param string $message
     * @param array $context
     * @return void
     */
    public function debug($message, array $context = array())
    {
        $context['app'] = $this->appName;
        $this->logger->debug($message, $context);
    }

    /**
     * Logs with an arbitrary level.
     *
     * @param mixed $level
     * @param string $message
     * @param array $context
     * @return void
     */
    public function log($level, $message, array $context = array())
    {
        $context['app'] = $this->appName;
        $this->logger->log($level, $message, $context);
    }
}
