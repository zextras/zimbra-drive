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
use OCP\Files\File;
use OCP\Files\Folder;

class DownloadItemResponseFactory
{
    /** @var  StorageService */
    private $storageService;


    public function __construct(StorageService $storageService)
    {
        $this->storageService = $storageService;
    }

    public function makeDownloadFileResponse(File $file)
    {
        $nodeLockerFactory = new NodeLockerFactory($this->storageService);
        return new DownloadFileResponse($this->storageService, $nodeLockerFactory, $file);
    }

    public function makeDownloadZipFolderResponseFactory(Folder $folder)
    {
        $nodeLockerFactory = new NodeLockerFactory($this->storageService);
        return new DownloadZipFolderResponse($this->storageService, $nodeLockerFactory, $folder);
    }
}