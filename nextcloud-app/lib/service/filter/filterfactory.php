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