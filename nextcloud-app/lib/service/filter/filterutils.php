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
        if ($find == false)
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
        if ($find == false)
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
        if ($find == false)
        {
            return false;
        }
        return true;
    }


}