<?php
/**
 * Copyright (C) 2017 ZeXtras S.r.l.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, version 2 of
 * the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License.
 * If not, see <http://www.gnu.org/licenses/>.
 */

namespace OCA\ZimbraDrive\Service;

use OCP\ILogger;

class LogService implements ILogger
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
     * @since 7.0.0
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
     * @since 7.0.0
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
     * @since 7.0.0
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
     * @since 7.0.0
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
     * @since 7.0.0
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
     * @since 7.0.0
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
     * @since 7.0.0
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
     * @since 7.0.0
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
     * @since 7.0.0
     */
    public function log($level, $message, array $context = array())
    {
        $context['app'] = $this->appName;
        $this->logger->log($message, $context);
    }

    /**
     * Logs an exception very detailed
     * An additional message can we written to the log by adding it to the
     * context.
     *
     * <code>
     * $logger->logException($ex, [
     *     'message' => 'Exception during cron job execution'
     * ]);
     * </code>
     *
     * @param \Exception | \Throwable $exception
     * @param array $context
     * @return void
     * @since 8.2.0
     */
    public function logException($exception, array $context = array())
    {
        $context['app'] = $this->appName;
        $this->logger->logException($exception, $context);
    }
}
