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

namespace OCA\ZimbraDrive\Service;

use OCP\ILogger;

class QueryService
{

    private $logger;

    /**
     * QueryService constructor.
     * @param $logger
     */
    public function __construct(ILogger $logger)
    {
        $this->logger = $logger;
    }

    /**
     * @param $query
     * @return string
     * @throws BadRequestException
     */
    //$query must be 'in:"..."'
    public function getPath($query)
    {
        //is a valid 'in:' query, and extract the path
        $find = preg_match('/^in:"([\w \/]*)"$/', $query, $matches);
        if ($find == false)
        {
            throw new BadRequestException("Not a valid query '" . $query . "''" );
        }
        $path = $matches[1];
        return $path;
    }
}
