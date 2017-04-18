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

namespace OCA\ZimbraDrive\Controller;


use OCP\AppFramework\ApiController;
use OCP\IRequest;
use OCA\ZimbraDrive\Service\LogService;
use OCP\AppFramework\Http\DataDisplayResponse;

class ConnectivityTestController extends ApiController
{
    private $logger;

    public function __construct(
        $appName,
        IRequest $request,
        LogService $logger
    )
    {
        parent::__construct(
            $appName,
            $request
        );

        $this->logger = $logger;
    }

    /**
     * @CORS
     * @NoCSRFRequired
     * @PublicPage
     */
    public function connectivityTest()
    {
        $this->logger->info('connectivityTest');
        return new DataDisplayResponse("OK");
    }
}