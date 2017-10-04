<?php
/**
 * Zimbra Drive App
 * Copyright (C) 2017  Zextras Srl
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * If you require any further information, feel free to contact legal@zextras.com.
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