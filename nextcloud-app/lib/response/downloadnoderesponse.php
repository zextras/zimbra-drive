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
use OCP\Files\Node;

class DownloadNodeResponse extends Response  implements ICallbackResponse
{
    /** @var  ICallbackResponse */
    private $downloadResponseInstance;

    public function __construct(DownloadItemResponseFactory $downloadResponseFactory, Node $node) {
        if( $node instanceof Folder )
        {
            /** @var Folder $node */
            $this->downloadResponseInstance = $downloadResponseFactory->makeDownloadZipFolderResponseFactory($node);
        } elseif ($node instanceof File) //Todo change!!!
        {
            /** @var File $node */
            $this->downloadResponseInstance = $downloadResponseFactory->makeDownloadFileResponse($node);
        } else
        {
            throw new BadRequestException($node->getPath() . " is not a file or a folder.");
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