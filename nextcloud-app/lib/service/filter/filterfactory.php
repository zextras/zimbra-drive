<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
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