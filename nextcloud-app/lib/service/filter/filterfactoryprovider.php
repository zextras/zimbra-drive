<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */


namespace OCA\ZimbraDrive\Service\Filter;

use OCA\ZimbraDrive\Service\LogService;

class FilterFactoryProvider
{
    /**
     * @var FilterUtils
     */
    private $filterUtils;
    /**
     * @var LogService
     */
    private $logger;

    /**
     * FilterFactoryProvider constructor.
     * @param FilterUtils $filterUtils
     * @param LogService $logService
     */
    public function __construct(FilterUtils $filterUtils, LogService $logService)
    {
        $this->filterUtils = $filterUtils;
        $this->logger = $logService;
    }

    /**
     * @return FilterFactory
     */
    public function getCaseSensitiveFilterFactory()
    {
        $isCaseSensitive = true;
        return new FilterFactory($this->filterUtils, $isCaseSensitive, $this->logger);

    }

    /**
     * @return FilterFactory
     */
    public function getNonCaseSensitiveFilterFactory()
    {
        $isCaseSensitive = false;
        return new FilterFactory($this->filterUtils, $isCaseSensitive, $this->logger);
    }
}