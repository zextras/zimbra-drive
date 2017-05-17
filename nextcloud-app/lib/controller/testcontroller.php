<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
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