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

class PartialNameNodeFilter implements NodesFilter
{
    private $targetPartialName;
    /**
     * @var
     */
    private $isCaseSensitive;
    /**
     * @var LogService
     */
    private $logger;

    /**
     * PartialNameNodeFilter constructor.
     * @param $targetPartialName string
     * @param $isCaseSensitive
     * @param LogService $logService
     */
    public function __construct($targetPartialName, $isCaseSensitive, LogService $logService)
    {
        $this->logger = $logService;
        if(!$isCaseSensitive)
        {
            $targetPartialName = strtolower($targetPartialName);
        }
        $this->isCaseSensitive = $isCaseSensitive;
        $this->targetPartialName = $targetPartialName;
    }


    public function filter($nodes)
    {
        $filteredNodes = array();
        /** @var Node $node */
        foreach($nodes as $node)
        {
            $nodePath = $node->getInternalPath();
            $name = basename($nodePath);

            if(!$this->isCaseSensitive)
            {
                $name = strtolower($name);
            }

            if(strpos($name, $this->targetPartialName) !== false)
            {
                $filteredNodes[] = $node;
            }
        }
        return $filteredNodes;
    }
}