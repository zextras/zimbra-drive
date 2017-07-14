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


use OC\Files\Filesystem;
use OCA\ZimbraDrive\Service\StorageService;
use OCP\Files\Folder;
use OCP\Files\Node;
use OCP\Lock\ILockingProvider;
use \OC\Files\View;

class NodeLocker
{
    /** @var View  */
    private $view;

    /** @var  Node */
    private $node;

    /** @var  StorageService */
    private $storageService;

    public function __construct(Node $node)
    {
        $this->node = $node;
        $this->view = Filesystem::getView();

        $server = \OC::$server;
        $this->storageService = $server->query('OCA\ZimbraDrive\Service\StorageService');
    }

    public function lock()
    {
        $this->lockNode($this->node);
    }

    public function unlock()
    {
        $this->unlockNode($this->node);
    }

    private function lockNode(Node $node)
    {
        $this->view->lockFile($this->storageService->getRelativePath($node), ILockingProvider::LOCK_SHARED);
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
        $this->view->unlockFile($this->storageService->getRelativePath($node), ILockingProvider::LOCK_SHARED);
        if($node instanceof Folder)
        {
            foreach ($node->getDirectoryListing() as $child)
            {
                $this->unlockNode($child);
            }
        }
    }

}