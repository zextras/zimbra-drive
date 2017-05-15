<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */


namespace OCA\ZimbraDrive\Response;

use OCP\AppFramework\Http;
use OCP\AppFramework\Http\ICallbackResponse;
use OCP\AppFramework\Http\IOutput;
use OCP\AppFramework\Http\Response;

class NodeResponse  extends Response  implements ICallbackResponse
{
    /** @var string $nodePath */
    private $nodePath;

    /**
     * FileDisplayResponse constructor.
     *
     * @param string $nodePath
     * @param int $statusCode
     * @param array $headers
     */
    public function __construct($nodePath, $statusCode=Http::STATUS_OK,
                                $headers=[]) {
        $this->nodePath = $nodePath;
        $this->setStatus($statusCode);
        $this->setHeaders(array_merge($this->getHeaders(), $headers));
    }


    /**
     *
     * @param IOutput $output a small wrapper that handles output
     * @since 8.1.0
     */
    public function callback (IOutput $output)
    {
        $directory = dirname($this->nodePath);
        $fileName = basename($this->nodePath);

        \OC_Files::get($directory, $fileName);
    }

}