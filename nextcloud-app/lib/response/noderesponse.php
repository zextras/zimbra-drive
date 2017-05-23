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