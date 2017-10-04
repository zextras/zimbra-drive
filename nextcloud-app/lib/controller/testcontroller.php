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

namespace OCA\ZimbraDrive\Controller;


use OCA\ZimbraDrive\Service\Test\EnabledZimbraUsersLoginTest;
use OCA\ZimbraDrive\Service\Test\EnabledZimbraUsersTest;
use OCA\ZimbraDrive\Service\Test\IsServerPortSetTest;
use OCA\ZimbraDrive\Service\Test\IsServerUrlSetTest;
use OCA\ZimbraDrive\Service\Test\Test;
use OCA\ZimbraDrive\Service\Test\TestResult;
use OCA\ZimbraDrive\Service\Test\CloudConnectivityTest;
use OCA\ZimbraDrive\Service\Test\ZimbraAuthenticationServiceConnectionTest;
use OCA\ZimbraDrive\Service\Test\ZimbraHostConnectionTest;
use OCA\ZimbraDrive\Service\Test\ZimbraDriveExtensionConnectivityTest;
use OCP\AppFramework\ApiController;
use OCP\IRequest;
use OCA\ZimbraDrive\Service\LogService;
use OCP\AppFramework\Http\DataDisplayResponse;

class TestController extends ApiController
{
    private $logger;
    /** @var Test $tests */
    private $tests;

    public function __construct(
        $appName,
        IRequest $request,
        LogService $logger,
        CloudConnectivityTest $cloudConnectivityTest,
        EnabledZimbraUsersTest $enabledZimbraUsersTest,
        IsServerUrlSetTest $isServerUrlSetTest,
        IsServerPortSetTest $isServerPortSetTest,
        ZimbraHostConnectionTest $zimbraConnectionTest,
        ZimbraAuthenticationServiceConnectionTest $zimbraAuthenticationServiceConnectionTest,
        ZimbraDriveExtensionConnectivityTest $zimbraDriveExtensionConnectivityTest,
        EnabledZimbraUsersLoginTest $enabledZimbraUsersLoginTest
    )
    {
        parent::__construct(
            $appName,
            $request
        );

        $this->logger = $logger;

        $this->tests = array(
            $cloudConnectivityTest,
            $enabledZimbraUsersTest,
            $enabledZimbraUsersLoginTest,
            $isServerUrlSetTest,
            $isServerPortSetTest,
            $zimbraConnectionTest,
            $zimbraAuthenticationServiceConnectionTest,
            $zimbraDriveExtensionConnectivityTest
        );
    }

    /**
     * @CORS
     * @NoCSRFRequired
     * @PublicPage
     */
    public function connectivityTest()
    {
        return new DataDisplayResponse("OK");
    }

    /**
     * @NoCSRFRequired
     */
    public function all()
    {
        $this->logger->info('allTest');

        $testResults = $this->getTestResults($this->tests);

        $htmlResults = $this->createHtmlResults($testResults);

        return new DataDisplayResponse($htmlResults);
    }

    /**
     * @param $tests array of test
     * @return array of testresult
     */
    private function getTestResults($tests)
    {
        $testResults = array();

        /** @var Test $test */
        foreach ($tests as $test)
        {
            $testResults[] = $test->run();
        }
        return $testResults;
    }

    /**
     * @param $testResults array of testresult
     * @return string
     */
    private function createHtmlResults($testResults)
    {
        $htmlResults = "";
        /** @var TestResult $testResult */
        foreach ($testResults as $testResult)
        {
            if($testResult->isPassed())
            {
                $testStatus = "OK";
            } else
            {
                $testStatus = "FAILED";
            }
            $htmlResults = $htmlResults . sprintf("[%s] %s : %s <br /> <br /> \n\n", $testStatus, $testResult->getTestName(), $testResult->getMessage());
        }
        return $htmlResults;
    }
}