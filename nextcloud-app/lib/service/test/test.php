<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */

namespace OCA\ZimbraDrive\Service\Test;


interface Test
{
    /**
     * @return string
     */
    public function getName();

    /**
     * @return TestResult
     */
    public function run();

}