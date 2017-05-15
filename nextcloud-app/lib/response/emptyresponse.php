<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */

namespace OCA\ZimbraDrive\Response;

use OCP\AppFramework\Http;
use OCP\AppFramework\Http\Response;

class EmptyResponse extends Response
{

    public function __construct($statusCode=Http::STATUS_OK,
                                array $headers=array()) {
        $this->setStatus($statusCode);
        $this->setHeaders(array_merge($this->getHeaders(), $headers));
    }

}