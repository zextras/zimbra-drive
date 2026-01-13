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

use OC\Files\Filesystem;
use OC\Files\View;
use OCA\ZimbraDrive\Service\StorageService;
use OCP\Files\Folder;
use OCP\Files\Node;
use OCP\Lock\ILockingProvider;

class NodeLocker
{
    /** @var  Node */
    private $node;

    /** @var  StorageService */
    private $storageService;

    /** @var  View */
    private $view;

    public function __construct(StorageService $storageService, Node $node)
    {
        $this->storageService = $storageService;
        $this->node = $node;
        $this->view = Filesystem::getView();
    }

    public function sharedLock()
    {
        $this->lockNode($this->node);
    }

    public function sharedUnlock()
    {
        $this->unlockNode($this->node);
    }

    private function lockNode(Node $node)
    {
        $this->view->lockFile($this->node->getPath(), ILockingProvider::LOCK_SHARED);
        if($node instanceof Folder)
        {
            foreach ($node->getDirectoryListing() as $child)
            {
                $this->lockNode($child);
            }
        }
    }

    private function unlockNode(Node $node)
    {
        $this->view->unlockFile($this->node->getPath(), ILockingProvider::LOCK_SHARED);
        if($node instanceof Folder)
        {
            foreach ($node->getDirectoryListing() as $child)
            {
                $this->unlockNode($child);
            }
        }
    }

}