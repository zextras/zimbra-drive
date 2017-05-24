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