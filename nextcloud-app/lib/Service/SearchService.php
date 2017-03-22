<?php
/**
 * Copyright (C) 2017 ZeXtras S.r.l.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, version 2 of
 * the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License.
 * If not, see <http://www.gnu.org/licenses/>.
 */

namespace OCA\ZimbraDrive\Service;

use OCP\ISearch;

class SearchService
{
    const REX_PATH_IN_QUERY = '/^in:"([^"]*)"$/';
    private $searchService;
    /**
     * @var LogService
     */
    private $logger;
    /**
     * @var StorageService
     */
    private $storageService;

    /**
     * SearchService constructor.
     * @param $searchService ISearch
     * @param StorageService $storageService
     * @param LogService $logService
     */
    public function __construct(ISearch $searchService, StorageService $storageService, LogService $logService)
    {
        $this->searchService = $searchService;
        $this->logger = $logService;
        $this->storageService = $storageService;
    }


    //Assuming the user is already logged in
    /**
     * @param string $query
     * @return array
     */
    public function search($query)
    {
        if($this->queryIsFoldersContentsRequest($query))
        {
            return $this->getContentFolder($query);
        }

        $this->logger->info('SearchRequestDebug');
        $this->logger->info('query '. $query);

        /** @var $tokens array */
        $tokens = $this->getTokens($query);
        $this->logger->info('token '. print_r($tokens, true));


        $stringWanted = $this->getStringToFind($tokens);
        $this->logger->info('plain text ' . print_r($stringWanted, true));

        $appProvideSearch = array('files');

        $pageNumber = 1;
        $resultsPerPage = 0; //0 -> all

        $allResults = $this->searchService->searchPaged($stringWanted, $appProvideSearch, $pageNumber, $resultsPerPage);
        $this->logger->info('tutti i risultati (paged)' . print_r($allResults, true));

        $rootDirectoryOfTheSearch = $this->getRootDirectoryOfTheSearch($tokens);
        $this->logger->info('root directory ' . print_r($rootDirectoryOfTheSearch, true));


        $resultsFilterByFolder = $this->filterByFolder($allResults, $rootDirectoryOfTheSearch);
        $this->logger->info('filtered result' . print_r($resultsFilterByFolder, true));

        $results = $this->fileToArray($resultsFilterByFolder);


        return $results;


    }


    /**
     * @param $query
     * @return string
     * @throws BadRequestException
     */
    //$query must be 'in:"..."'
    public function getPath($query)
    {
        //is a valid 'in:' query, and extract the path
        $find = preg_match(self::REX_PATH_IN_QUERY, $query, $matches);
        if ($find == false)
        {
            $message = 'Not valid query \'' . $query . '\'';
            throw new BadRequestException($message);
        }
        $path = $matches[1];
        return $path;
    }


    /**
     * @param $query string
     * @return array
     */
    private function getTokens($query)
    {
        $delimiter = ' ';
        return explode($delimiter, $query);
    }

    /**
     * @param $tokens array
     * @return string
     */
    private function getRootDirectoryOfTheSearch($tokens)
    {
        foreach ($tokens as $token)
        {
//            $find = preg_match('/^in:"([\w \/]*)"$/', $token, $matches); //todo
            $find = preg_match('/^in:([\w \/]*)$/', $token, $matches);
            if ($find == true)
            {
                $path = $matches[1];
                return $path;
            }
        }
        return '';
    }

    /**
     * @param $tokens array
     * @return array
     */
    private function getStringToFind($tokens)
    {

        foreach ($tokens as $token)
        {
            if($this->isPlainText($token))
                return $token;
        }
        return '';
    }

    /**
     * @param $allResults array of \OC\Search\Result\File
     * @param $rootDirectoryOfTheSearch string
     * @return array of \OC\Search\Result\File
     */
    private function filterByFolder($allResults, $rootDirectoryOfTheSearch)
    {
        $filteredResults = array();

        /** @var \OC\Search\Result\File $resultToFilter this is true because it use only the files search provider
         * and all result objects are descendants of File*/
        foreach($allResults as $resultToFilter)
        {
            $resultPath = $resultToFilter->path;
            if($this->isInTheDirectoryTree($resultPath, $rootDirectoryOfTheSearch))//substr_compare($resultPath,$rootDirectoryOfTheSearch, 0) == 0)
            {
                $filteredResults[] = $resultToFilter;
            }
        }
        return $filteredResults;
    }

    /**
     * @param $tokens string
     * @return bool
     */
    private function isPlainText($tokens)
    {
        return ! $this->isValidSearchOperator($tokens);
    }

    /**
     * @param $tokens string
     * @return bool
     */
    private function isValidSearchOperator($tokens)
    {
//        $find = preg_match('/^\w*:".*"$/', $tokens, $matches); //todo
        $find = preg_match('/^\w*:.*$/', $tokens, $matches);
        if ($find == false)
        {
            return false;
        }
        return true;
    }

    /**
     * @param $path string
     * @param $treeDirectoryRoot string
     * @return bool
     */
    private function isInTheDirectoryTree($path, $treeDirectoryRoot)
    {
        if(strlen($path) < strlen($treeDirectoryRoot))
        {
            return false;
        }
        $rootPath = substr($path, 0, strlen($treeDirectoryRoot));

        if(strcmp($rootPath, $treeDirectoryRoot) === 0)
        {
            return true;
        }

        return false;


    }

    /**
     * @param $wantedFiles array of \OC\Search\Result\File
     * @return array
     */
    public function fileToArray($wantedFiles)
    {
        $results = array();
        /** @var \OC\Search\Result\File $wantedFile */
        foreach ($wantedFiles as $wantedFile)
        {
            $file = $this->storageService->getNode($wantedFile->path);
            $result = $this->storageService->getNodesAttributes($file);
            $results[] = $result;
        }
        return $results;
    }

    /**
     * @param $query string
     * @return bool
     */
    private function queryIsFoldersContentsRequest($query)
    {
        $find = preg_match(self::REX_PATH_IN_QUERY, $query, $matches);
        if ($find == false)
        {
            return false;
        }
        return true;
    }

    /**
     * @param $query string
     * @return array
     */
    private function getContentFolder($query)
    {
        $path = $this->getPath($query);
        $searchedFolder = $this->storageService->getFolder($path);
        $folderAsArray = $this->storageService->folderChildNodesAttributes($searchedFolder);
        return $folderAsArray;
    }

}