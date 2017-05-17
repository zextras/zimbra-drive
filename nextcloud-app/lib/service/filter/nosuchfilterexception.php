<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */

namespace OCA\ZimbraDrive\Service\Filter;

use \Exception;

class NoSuchFilterException extends Exception
{
    const MESSAGE = "The filter is not support.";

    /**
     * NoSuchFilterException constructor.
     * @param string $message
     */
    public function __construct($message = self::MESSAGE)
    {
        parent::__construct($message);
    }
}