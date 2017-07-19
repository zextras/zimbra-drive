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
use OCP\Files\Folder;
use OCP\Files\Node;
use OCP\Lock\ILockingProvider;

class NodeLocker
{
    /** @var  Node */
    private $node;

    /** @var  StorageService */
    private $storageService;

    public function __construct(StorageService $storageService, Node $node)
    {
        $this->storageService = $storageService;
        $this->node = $node;
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
        $node->lock(ILockingProvider::LOCK_SHARED);
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
        $node->lock( ILockingProvider::LOCK_SHARED);
        if($node instanceof Folder)
        {
            foreach ($node->getDirectoryListing() as $child)
            {
                $this->unlockNode($child);
            }
        }
    }

}