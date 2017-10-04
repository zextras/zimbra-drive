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