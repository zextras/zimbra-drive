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

use OCA\ZimbraDrive\Service\StorageService;
use OCP\AppFramework\Http\ICallbackResponse;
use OCP\AppFramework\Http\IOutput;
use OCP\AppFramework\Http\Response;
use OCP\Files\File;

class DownloadFileResponse extends Response  implements ICallbackResponse
{
    /** @var File $file */
    private $file;

    /** @var NodeLocker  */
    private $nodeLocker;

    /** @var  StorageService */
    private $storageService;

    /**
     * Creates a response that prompts the user to download the file
     * @param StorageService $storageService
     * @param NodeLockerFactory $nodeLockerFactory
     * @param File $file
     */
    public function __construct(StorageService $storageService, NodeLockerFactory $nodeLockerFactory, File $file)
    {
        $this->storageService = $storageService;
        $this->file = $file;

        $this->nodeLocker = $nodeLockerFactory->make($this->file);
    }

    public function callback (/** @noinspection PhpUnusedParameterInspection */ IOutput $output)
    {
        $this->nodeLocker->sharedLock();

        $this->setHeader();

        $this->sendFile();

        $this->nodeLocker->sharedUnlock();
    }

    private function sendFile()
    {
        $fileHandler = $this->file->fopen('rb');
        fpassthru($fileHandler);
    }

    private function setHeader()
    {
        $filename = $this->file->getName();
        header('Content-Disposition: ' . 'attachment; filename*=UTF-8\'\'' . rawurlencode( $filename )
            . '; filename="' . rawurlencode( $filename ) . '"');
        header('Content-Length: '. $this->file->getSize());
        $contentType = \OC::$server->getMimeTypeDetector()->getSecureMimeType($this->file->getMimeType());
        header('Content-Type: ' . $contentType);
        header('Content-Transfer-Encoding: binary');
    }

}