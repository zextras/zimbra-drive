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

namespace OCA\ZimbraDrive\Service;

use OCP\Files\FileInfo;
use OCP\Files\Folder;
use OCP\Files\File;
use OCP\Files\IMimeTypeDetector;
use OCP\IServerContainer;
use OC\Files\Filesystem;
use OCP\Files\Node;

class StorageService
{
    const ROOT = '/';
    const READABLE_VAR_NAME = 'readable';
    const WRITABLE_VAR_NAME = 'writable';
    const SHAREABLE_VAR_NAME = 'shareable';

    private $serverContainer;
    private $logger;
    private $mimeTypeDetector;

    public function __construct(IServerContainer $serverContainer, IMimeTypeDetector $mimeTypeDetector, LogService $logService)
    {
        $this->serverContainer = $serverContainer;
        $this->logger = $logService;
        $this->mimeTypeDetector = $mimeTypeDetector;
    }

    /**
     * @param string $path
     * @return Node
     */
    public function getNode($path = self::ROOT)
    {
        $userRootFolder = $this->serverContainer->getUserFolder();
        return $userRootFolder->get($path);
    }

    /**
     * @param string $path
     * @return Folder
     * @throws MethodNotAllowedException
     */
    public function getFolder($path = self::ROOT)
    {
        $searchedNode = $this->getNode($path);
        $searchedNodeType = $searchedNode->getType();
        if ($searchedNodeType !== Node::TYPE_FOLDER) {
            $errorMessage = $path . ' is not a folder.';
            throw new MethodNotAllowedException($errorMessage);
        }
        /** @var Folder $searchedNode */
        return $searchedNode;
    }

    /**
     * @param string $path
     * @return File
     * @throws MethodNotAllowedException
     */
    public function getFile($path)
    {
        $searchedNode = $this->getNode($path);
        $searchedNodeType = $searchedNode->getType();
        if ($searchedNodeType === Node::TYPE_FOLDER) {
            $errorMessage = $path . 'is not a file.';
            throw new MethodNotAllowedException($errorMessage);
        }
        /** @var File $searchedNode */
        return $searchedNode;
    }

    /**
     * @param Folder $folder
     * @return array
     */
    public function folderChildNodesAttributes(Folder $folder)
    {
        $folderAsArray = array();
        $nodes = $folder->getDirectoryListing();
        foreach ($nodes as $nodeKey => $nodeValue) {
            $folderAsArray[] = $this->getNodeAttributes($nodeValue);
        }
        return $folderAsArray;
    }


    /**
     * @param Folder $folder
     * @return array
     */
    public function getFolderTreeAttributes(Folder $folder)
    {
        $folderAttributes = $this->getNodesCommonAttributes($folder);

        $folderChildrenAttributeForest = array();
        $folderChildren = $folder->getDirectoryListing();
        foreach ($folderChildren as $childKey => $childNode) {
            $childNodeType = $childNode->getType();
            if ($childNodeType === Folder::TYPE_FOLDER) {
                /** @var Folder $childNode */
                $folderChildrenAttributeForest[] = $this->getFolderTreeAttributes($childNode);
            }
        }
        $folderAttributes[ResponseVarName::CHILDREN_VAR_NAME] = $folderChildrenAttributeForest;
        return $folderAttributes;
    }

    /**
     * @param Node $node
     * @return array
     */
    public function getNodesCommonAttributes(Node $node)
    {
        $nodeOwner = $node->getOwner();
        $nodeAttributeMap = [
            ResponseVarName::NAME_VAR_NAME => $node->getName(),
            ResponseVarName::PERMISSIONS_VAR_NAME => $this->getPermission($node),
            ResponseVarName::SHARED_VAR_NAME => $node->isShared(),
            ResponseVarName::AUTHOR_VAR_NAME => $nodeOwner->getDisplayName(),
            ResponseVarName::SIZE_VAR_NAME => $node->getSize(),
            ResponseVarName::MODIFIED_TIME_VAR_NAME => $node->getMTime(),
            ResponseVarName::ID_VAR_NAME => $node->getId(),
            ResponseVarName::PATH_VAR_NAME => $node->getInternalPath()
        ];
        return $nodeAttributeMap;
    }

    /**
     * @param Node $node
     * @return array
     */
    public function getNodeAttributes(Node $node)
    {
        $nodeAttributeMap = $this->getNodesCommonAttributes($node);
        $type = "";
        switch ($node->getType()){
            case Folder::TYPE_FOLDER:
                /** @var  Folder $node */
                $type = ResponseVarName::NODE_FOLDER;
                break;
            case Folder::TYPE_FILE:
                /** @var  File $node */
                $type = ResponseVarName::NODE_FILE;
                $nodeAttributeMap[ResponseVarName::MIME_TYPE_VAR_NAME] = $node->getMimetype();
                break;
        }
        $nodeAttributeMap[ResponseVarName::NODE_TYPE_VAR_NAME] = $type;
        return $nodeAttributeMap;
    }

    /**
     * @param $nodes array
     * @return array
     */
    public function getNodesAttributes($nodes)
    {
        $nodesAttributes = array();
        /** @var Node $node */
        foreach($nodes as $node)
        {
            $nodesAttributes[] = $this->getNodeAttributes($node);
        }
        return $nodesAttributes;
    }



    /**
     * @param FileInfo $fileInfo
     * @return array
     */
    private function getPermission(FileInfo $fileInfo)
    {
        $permissions = array();
        $permissions[self::READABLE_VAR_NAME] = false;
        $permissions[self::WRITABLE_VAR_NAME] = false;
        $permissions[self::SHAREABLE_VAR_NAME] = false;

        if ($fileInfo->isReadable()) {
            $permissions[self::READABLE_VAR_NAME] = true;

            if ($fileInfo->getType() === Folder::TYPE_FOLDER && $fileInfo->isCreatable()) {
                $permissions[self::WRITABLE_VAR_NAME] = true;
            } else {
                if ($fileInfo->isDeletable() && $fileInfo->isUpdateable()) {
                    $permissions[self::WRITABLE_VAR_NAME] = true;
                }
            }

            if ($fileInfo->isShareable()) {
                $permissions[self::SHAREABLE_VAR_NAME] = true;
            }
        }
        return $permissions;
    }

    /**
     * @param string $path
     * @return string
     */
    public function getSecureMimeType($path)
    {
        $mimeType = $this->mimeTypeDetector->getSecureMimeType($path);
        return $mimeType;
    }

    /**
     * @param $sourcePath string
     * @param $targetPath string
     * @throws MethodNotAllowedException
     */
    public function move($sourcePath, $targetPath)
    {
        //if the $targetPath is a directory, it use the $filePath file name
        $nodeToMove = $this->getNode($sourcePath);
        $lastCharTargetPath = $targetPath[strlen($targetPath)-1];
        if($lastCharTargetPath === "/")
        {
            $targetPath = $targetPath . "/" . $nodeToMove->getName();
        }

        $targetDirectoryPath  = dirname($targetPath);
        $targetFileName = basename($targetPath);
        $targetDirectory = $this->getFolder($targetDirectoryPath);
        $targetExists = $targetDirectory->nodeExists($targetFileName);
        if($targetExists)
        {
            $errorMessage = "Cannot move the file because a file already exist in the destination path ($targetPath).";
            throw new MethodNotAllowedException($errorMessage);
        }

        $targetFullPath = $targetDirectory->getFullPath($targetFileName);

        $nodeToMove->move($targetFullPath);
    }

    /**
     * @param $path
     * @return Folder
     * @throws MethodNotAllowedException
     */
    public function newDirectory($path)
    {
        $userRootFolder = $this->getFolder(self::ROOT);

        $targetExists = $userRootFolder->nodeExists($path);
        if($targetExists)
        {
            $errorMessage = "Cannot create the directory because a file already exist in the destination path ($path).";
            throw new MethodNotAllowedException($errorMessage);
        }

        $newFolder = $userRootFolder->newFolder($path);
        return $newFolder;
    }


    /**
     * @param $name
     * @param $path
     * @param $tempFilePath
     * @throws MethodNotAllowedException
     */
    public function uploadFile($name, $path, $tempFilePath)
    {
        $newFileFullPath = $path . '/' . $name;

        $userRootFolder = $this->getFolder(self::ROOT);

        $targetExists = $userRootFolder->nodeExists($newFileFullPath);
        if($targetExists)
        {
            $errorMessage = "Cannot upload the file because a file already exist in the destination path ($path).";
            throw new MethodNotAllowedException($errorMessage);
        }

        Filesystem::fromTmpFile($tempFilePath, $newFileFullPath);
    }

    /**
     * @param $path
     * @return array of Folder
     */
    public function getFoldersNonSensitivePath($path)
    {
        $rootFolder = $this->getFolder(self::ROOT);
        $folderResults = array($rootFolder);

        $folderLevels = $this->getPathLevels($path);

        foreach($folderLevels as $folderLevel)
        {
            $foldersChildren = $this->getFoldersChildOfFolderArray($folderResults);

            $folderResults = $this->filterNodeByNameNonCaseSensitiveName($foldersChildren, $folderLevel);
        }

        return $folderResults;
    }

    /**
     * @param $folders array of Folder
     * @return array
     */
    private function getFoldersChildOfFolderArray($folders)
    {
        $foldersResult = array();
        /** @var Folder $folder */
        foreach($folders as $folder)
        {
            $folderChild = $this->getChildFolders($folder);
            $foldersResult = array_merge($foldersResult, $folderChild);
        }
        return $foldersResult;
    }

    /**
     * @param $folder Folder
     * @return array
     */
    private function getChildFolders($folder)
    {
        $childFolders = array();

        $nodesChild = $folder->getDirectoryListing();
        foreach($nodesChild as $nodeChild)
        {
            if($this->isFolder($nodeChild))
            {
                $childFolders[] = $nodeChild;
            }
        }

        return $childFolders;
    }

    /**
     * @param $nodeChild Node
     * @return bool
     */
    public function isFolder($nodeChild)
    {
        return $nodeChild->getType() === Folder::TYPE_FOLDER;
    }

    /**
     * @param $nodes array of Node
     * @param $targetName string
     * @return array of Node
     */
    private function filterNodeByNameNonCaseSensitiveName($nodes, $targetName)
    {
        $filterNodes = array();
        /** @var Node $node */
        foreach($nodes as $node)
        {
            $nodeName = $node->getName();

            if($this->nonCaseSensitiveCompare($nodeName, $targetName))
            {
                $filterNodes[] = $node;
            }
        }
        return $filterNodes;
    }

    /**
     * @param $string1
     * @param $string2
     * @return bool
     */
    private function nonCaseSensitiveCompare($string1, $string2)
    {
        return strcasecmp($string1, $string2) === 0;
    }

    /**
     * @param $path
     * @return array
     */
    private function getPathLevels($path)
    {
        $pathLevels = explode("/", $path);

        $pathLevelsWithoutEmptyLevels = array();

        foreach($pathLevels as $pathLevel)
        {
            if($pathLevel !== "")
            {
                $pathLevelsWithoutEmptyLevels[] = $pathLevel;
            }
        }

        return $pathLevelsWithoutEmptyLevels;
    }

    /**
     * @param string $nodePath
     * @return array
     */
    public function getFolderDescendantsFromPath($nodePath = "/")
    {
        $folder = $this->getFolder($nodePath);
        return $this->getFolderDescendants($folder);
    }

    /**
     * @param $folder Folder
     * @return array
     */
    public function getFolderDescendants($folder)
    {
        $folderChildren = $folder->getDirectoryListing();
        $nodeDescendants = $folderChildren;
        /** @var Node $folderChild */
        foreach($folderChildren as $folderChild)
        {
            if($this->isFolder($folderChild))
            {
                /** @var Folder $folderChild */
                $folderChildDescendant = $this->getFolderDescendants($folderChild);
                $nodeDescendants = array_merge($nodeDescendants, $folderChildDescendant);
            }
        }
        return $nodeDescendants;
    }
}