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

use OCA\ZimbraDrive\Service\BadRequestException;

class FilterUtils
{

    const REX_PATH_IN_QUERY = '/^in:"([^"]*)"$/';

    /**
     * @param $token
     * @return string
     * @throws BadRequestException
     * @internal param $query
     */
    //$query must be 'in:"..."'
    public function assertPathFromToken($token)
    {
        //is a valid 'in:' query, and extract the path
        $find = preg_match(self::REX_PATH_IN_QUERY, $token, $matches);
        if ($find === false || $find === 0)
        {
            $message = 'Not valid query \'' . $token . '\'';
            throw new BadRequestException($message);
        }
        $path = $matches[1];
        return $path;
    }

    /**
     * @param $query string
     * @return bool
     */
    public function queryIsFoldersContentsRequest($query)
    {
        $find = preg_match(self::REX_PATH_IN_QUERY, $query, $matches);
        if ($find === false || $find === 0)
        {
            return false;
        }
        return true;
    }

    /**
     * @param $tokens string
     * @return bool
     */
    public function isPlainText($tokens)
    {
        return ! $this->isValidSearchOperator($tokens);
    }

    /**
     * @param $tokens string
     * @return bool
     */
    public function isValidSearchOperator($tokens)
    {
        $find = preg_match('/^([^ :]+:"[^"]*")$/', $tokens, $matches);
        if ($find === false || $find === 0)
        {
            return false;
        }
        return true;
    }


}