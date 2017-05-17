<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */

namespace OCA\ZimbraDrive\Controller;

use OCA\ZimbraDrive\Service\LogService;
use OCP\AppFramework\ApiController;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IConfig;
use OCP\IRequest;
use OCP\AppFramework\Http\Response;

class AdminApiController extends ApiController
{
    const USER_BACKEND_VAR_NAME = 'user_backends';
    const ZIMBRA_USER_BACKEND_CLASS_VALUE = 'OC_User_Zimbra';
    private $logger;
    /**
     * @var IConfig
     */
    private $config;

    /**
     * AdminApiController constructor.
     * @param string $appName
     * @param IRequest $request
     * @param IConfig $config
     * @param LogService $logger
     */
    public function __construct(
        $appName,
        IRequest $request,
        IConfig $config,
        LogService $logger
    )
    {
        parent::__construct(
            $appName,
            $request,
            'POST'
        );

        $this->logger = $logger;
        $this->config = $config;
    }

    /**
     * @return Response
     */
    public function enableZimbraAuthentication()
    {
        $userBackends = $this->config->getSystemValue(self::USER_BACKEND_VAR_NAME, array());

        $zimbraUserBackend = array(
            'class' => self::ZIMBRA_USER_BACKEND_CLASS_VALUE,
            'arguments' => array (),
        );
        $userBackends[] = $zimbraUserBackend;

        $this->config->setSystemValue(self::USER_BACKEND_VAR_NAME, $userBackends);
        return $this->successResponse();
    }

    /**
     * @return Response
     */
    public function disableZimbraAuthentication()
    {
        $userBackends = $this->config->getSystemValue(self::USER_BACKEND_VAR_NAME, array());

        $userBackendsWithoutZimbra = array();
        foreach($userBackends as $userBackend)
        {
            if($userBackend['class'] !== self::ZIMBRA_USER_BACKEND_CLASS_VALUE)
            {
                $userBackendsWithoutZimbra[] = $userBackend;
            }
        }
        if(count($userBackendsWithoutZimbra) === 0)
        {
            $this->config->deleteSystemValue(self::USER_BACKEND_VAR_NAME);
        }else
        {
            $this->config->setSystemValue(self::USER_BACKEND_VAR_NAME, $userBackendsWithoutZimbra);
        }
        return $this->successResponse();
    }

    private function successResponse()
    {
        return new JSONResponse(array("status" => "success"));
    }
}