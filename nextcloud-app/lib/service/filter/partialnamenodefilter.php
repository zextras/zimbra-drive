<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
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