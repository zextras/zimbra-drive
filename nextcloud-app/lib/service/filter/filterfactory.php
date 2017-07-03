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

namespace OCA\ZimbraDrive\Service\Filter;


use OCA\ZimbraDrive\Service\LogService;

class FilterFactory
{
    private $isCaseSensitive;
    /**
     * @var FilterUtils
     */
    private $filterUtils;
    /**
     * @var LogService
     */
    private $logger;

    /**
     * FilterFactory constructor.
     * @param FilterUtils $filterUtils
     * @param $isCaseSensitive
     * @param LogService $logService
     */
    public function __construct(FilterUtils $filterUtils, $isCaseSensitive, LogService $logService)
    {
        $this->isCaseSensitive = $isCaseSensitive;
        $this->filterUtils = $filterUtils;
        $this->logger = $logService;
    }

    /**
     * @param $token
     * @return NodesFilter
     * @throws NoSuchFilterException
     */
    public function createFilter($token)
    {
        if($this->filterUtils->queryIsFoldersContentsRequest($token))
        {
            $searchRootPath = $this->filterUtils->assertPathFromToken($token);
            return new DirectoryRootNodesFilter($searchRootPath, $this->isCaseSensitive, $this->logger);
        }
        if($this->filterUtils->isPlainText($token))
        {
            return new PartialNameNodeFilter($token, $this->isCaseSensitive, $this->logger);
        }
        throw new NoSuchFilterException();
    }
}