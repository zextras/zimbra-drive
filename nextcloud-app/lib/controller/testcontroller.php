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


use OCA\ZimbraDrive\Service\Test\EnabledConfigurationTest;
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
        EnabledConfigurationTest $enabledConfigurationTest,
        IsServerUrlSetTest $isServerUrlSetTest,
        IsServerPortSetTest $isServerPortSetTest,
        ZimbraHostConnectionTest $zimbraConnectionTest,
        ZimbraAuthenticationServiceConnectionTest $zimbraAuthenticationServiceConnectionTest,
        ZimbraDriveExtensionConnectivityTest $zimbradriveExtensionConnectivityTest
    )
    {
        parent::__construct(
            $appName,
            $request
        );

        $this->logger = $logger;

        $this->tests = array(
            $cloudConnectivityTest,
            $enabledConfigurationTest,
            $isServerUrlSetTest,
            $isServerPortSetTest,
            $zimbraConnectionTest,
            $zimbraAuthenticationServiceConnectionTest,
            $zimbradriveExtensionConnectivityTest
        );
    }

    /**
     * @CORS
     * @NoCSRFRequired
     * @PublicPage
     * todo remove publicpage
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
            $htmlResults = $htmlResults . sprintf("[%s] %s : %s <br />", $testStatus, $testResult->getTestName(), $testResult->getMessage());
        }
        return $htmlResults;
    }
}