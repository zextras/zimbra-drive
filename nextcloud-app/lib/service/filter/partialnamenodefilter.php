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