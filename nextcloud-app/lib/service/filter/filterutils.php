<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
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