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

use OC\Streamer;
use OCA\ZimbraDrive\Service\StorageService;
use OCP\AppFramework\Http\ICallbackResponse;
use OCP\AppFramework\Http\IOutput;
use OCP\AppFramework\Http\Response;
use OCP\Files\Folder;

class DownloadZipFolderResponse extends Response  implements ICallbackResponse
{
    /** @var Folder $folder */
    private $folder;

    /** @var NodeLocker  */
    private $nodeLocker;

    /** @var  StorageService */
    private $storageService;

    public function __construct(StorageService $storageService, NodeLockerFactory $nodeLockerFactory, Folder $folder)
    {
        $this->storageService = $storageService;
        $this->folder = $folder;

        $this->nodeLocker = $nodeLockerFactory->makeNodeLocker($this->folder);
    }

    /**
     *
     * @param IOutput $output a small wrapper that handles output
     * @since 8.1.0
     */
    public function callback (IOutput $output)
    {
        $this->nodeLocker->sharedLock();

        $this->streamZipOfFolder();

        $this->nodeLocker->sharedUnlock();
    }

    private function streamZipOfFolder()
    {
        $streamer = new Streamer();

        $streamer->sendHeaders($this->folder->getName());

        $streamer->addDirRecursive($this->storageService->getRelativePath($this->folder));

        $streamer->finalize();
    }
}