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

use OCA\ZimbraDrive\Service\BadRequestException;
use OCP\AppFramework\Http\ICallbackResponse;
use OCP\AppFramework\Http\IOutput;
use OCP\AppFramework\Http\Response;
use OCP\Files\File;
use OCP\Files\Folder;

class DownloadNodeResponse extends Response  implements ICallbackResponse
{
    /** @var  Response */
    private $downloadResponseInstance;
    /** @var \OCP\ILogger */
    private $logger;

    public function __construct($filePath) {
        $server = \OC::$server;
        $userRootFolder = $server->getUserFolder();

        $this->logger = $server->getLogger();

        $node = $userRootFolder->get($filePath);

        if( $node instanceof Folder )
        {
            /** @var Folder $node */
            $this->downloadResponseInstance = new DownloadZipFolderResponse($node);
        } elseif ($node instanceof File)
        {
            /** @var File $node */
            $this->downloadResponseInstance = new DownloadFileResponse($node);
        } else
        {
            throw new BadRequestException("$filePath is not a file or a folder.");
        }
    }

    /**
     *
     * @param IOutput $output a small wrapper that handles output
     * @since 8.1.0
     */
    public function callback (IOutput $output)
    {
        $this->downloadResponseInstance->callback ($output);
    }

}