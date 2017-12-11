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

namespace OCA\ZimbraDrive\Service;

use OCA\ZimbraDrive\Service\Filter\FilterFactory;
use OCA\ZimbraDrive\Service\Filter\NoSuchFilterException;
use OCP\Files\Folder;
use OCA\ZimbraDrive\Service\Filter\FilterFactoryProvider;
use OCA\ZimbraDrive\Service\Filter\FilterUtils;
use OCP\Files\NotFoundException;

class SearchService
{
    /**
     * @var LogService
     */
    private $logger;
    /**
     * @var StorageService
     */
    private $storageService;
    /**
     * @var FilterFactoryProvider
     */
    private $filterFactoryProvider;
    /**
     * @var FilterUtils
     */
    private $filterUtils;

    /**
     * SearchService constructor.
     * @param StorageService $storageService
     * @param LogService $logService
     * @param FilterFactoryProvider $filterFactoryProvider
     * @param FilterUtils $filterUtils
     */
    public function __construct(StorageService $storageService, LogService $logService, FilterFactoryProvider $filterFactoryProvider, FilterUtils $filterUtils)
    {
        $this->logger = $logService;
        $this->storageService = $storageService;
        $this->filterFactoryProvider = $filterFactoryProvider;
        $this->filterUtils = $filterUtils;
    }


    /**
     * @param $query string
     * @param $isCaseSensitive
     * @return array
     */
    public function search($query, $isCaseSensitive)
    {
        if($this->filterUtils->queryIsFoldersContentsRequest($query)) //actually only 'in:' is supports
        {
            $path = $this->filterUtils->assertPathFromToken($query);

            if($isCaseSensitive)
            {
                $results = $this->getFoldersContentCaseSensitive($path);
            } else
            {
                $results = $this->getFoldersContentCaseInsensitive($path);
            }
            return $results;
        }


        if($isCaseSensitive)
        {
            $filterFactory = $this->filterFactoryProvider->getCaseSensitiveFilterFactory();
        } else
        {
            $filterFactory = $this->filterFactoryProvider->getNonCaseSensitiveFilterFactory();
        }

        /** @var $tokens array */
        $tokens = $this->getTokens($query);

        $rootDirectoryOfTheSearch = $this->getRootDirectoryOfTheSearch($tokens);

        $nodeResults = $this->storageService->getFolderDescendantsFromPath($rootDirectoryOfTheSearch);
        foreach($tokens as $token)
        {
            if(sizeof($nodeResults) <= 0)
            {
                break;
            }
            $nodeResults = $this->filterNodesByToken($nodeResults, $token, $filterFactory);
        }

        $nodeArrayResults = $this->storageService->getNodesAttributes($nodeResults);
        return $nodeArrayResults;
    }

    /**
     * @param $query string
     * @return array
     */
    private function getTokens($query)
    {
        preg_match_all('/(([^ :]+:"[^"]*")|([^ :]+))( |$)/', $query, $matches, PREG_PATTERN_ORDER);
        return $matches[1];
    }

    /**
     * @param $tokens array
     * @return string
     */
    private function getRootDirectoryOfTheSearch($tokens)
    {
        foreach ($tokens as $token)
        {
            $find = preg_match('~^in:"([^"]*)/*"$~', $token, $matches);
            if ($find === true)
            {
                $path = $matches[1];
                return $path;
            }
        }
        return '';
    }

    /**
     * @param $path
     * @return array
     */
    private function getFoldersContentCaseInsensitive($path)
    {
        $folders = $this->storageService->getFoldersNonSensitivePath($path);

        return $this->getFoldersContent($folders);
    }

    /**
     * @param $path
     * @return array
     * @throws BadRequestException
     */
    private function getFoldersContentCaseSensitive($path)
    {
        try
        {
            $folder = $this->storageService->getFolder($path);
        } catch (NotFoundException $notFoundException)
        {
            throw new BadRequestException($notFoundException->getMessage());
        }

        $folders =  array($folder);

        return $this->getFoldersContent($folders);
    }

    /**
     * @param $folders array of Folder
     * @return array
     */
    private function getFoldersContent($folders)
    {
        $foldersChildrenArrayResult =  array();
        /** @var Folder $folder */
        foreach($folders as $folder)
        {
            $folderChildren = $this->storageService->folderChildNodesAttributes($folder);
            $foldersChildrenArrayResult = array_merge($foldersChildrenArrayResult, $folderChildren) ;
        }
        return $foldersChildrenArrayResult;
    }

    /**
     * @param $nodesToFilter array
     * @param $token string
     * @param $filterFactory FilterFactory
     * @return mixed
     * @throws BadRequestException
     */
    private function filterNodesByToken($nodesToFilter, $token, $filterFactory)
    {
        try
        {
            $filter = $filterFactory->createFilter($token);
        } catch (NoSuchFilterException $noSuchFilterException)
        {
            throw new BadRequestException($noSuchFilterException->getMessage());
        }
        return $filter->filter($nodesToFilter);
    }
}