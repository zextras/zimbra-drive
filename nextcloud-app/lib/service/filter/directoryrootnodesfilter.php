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

namespace OCA\ZimbraDrive\Service\Filter;

use OCA\ZimbraDrive\Service\LogService;
use OCP\Files\Node;

class DirectoryRootNodesFilter implements NodesFilter
{
    /**
     * @var string
     */
    private $path;
    /**
     * @var bool
     */
    private $isCaseSensitive;
    /**
     * @var LogService
     */
    private $logger;


    /**
     * DirectoryRootNodesFilter constructor.
     * @param $path string
     * @param $isCaseSensitive
     * @param LogService $logService
     */
    public function __construct($path, $isCaseSensitive, LogService $logService)
    {
        $this->path = $path;
        $this->isCaseSensitive = $isCaseSensitive;
        $this->logger = $logService;
    }

    /**
     * @param $nodes array of Node
     * @return array
     */
    public function filter($nodes)
    {
        $filteredNodes = array();
        /** @var Node $node */
        foreach($nodes as $node)
        {
            $nodeInternalPath = $node->getInternalPath();
            $nodeUserRootRelativePath = substr($nodeInternalPath, strlen("files"));
            if($this->isInTheDirectoryTree($nodeUserRootRelativePath, $this->path))
            {
                $filteredNodes[] = $node;
            }
        }
        return $filteredNodes;
    }

    /**
     * @param $path string
     * @param $treeDirectoryRoot string
     * @return bool
     */
    private function isInTheDirectoryTree($path, $treeDirectoryRoot)
    {
        $firstPathChar = substr($treeDirectoryRoot, 0, 1);
        if($firstPathChar !== "/")
        {
            $treeDirectoryRoot = "/" . $treeDirectoryRoot;
        }

        $lastPathChar = substr($treeDirectoryRoot, -1);
        if($lastPathChar !== "/")
        {
            $treeDirectoryRoot = $treeDirectoryRoot . "/";
        }

        if(strlen($path) <= strlen($treeDirectoryRoot))
        {
            return false;
        }
        $rootPath = substr($path, 0, strlen($treeDirectoryRoot));

        if(!$this->isCaseSensitive)
        {
            $rootPath = strtolower($rootPath);
            $treeDirectoryRoot = strtolower($treeDirectoryRoot);
        }

        if(strcmp($rootPath, $treeDirectoryRoot) === 0)
        {
            return true;
        }

        return false;
    }


}