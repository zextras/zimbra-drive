<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */

namespace OCA\ZimbraDrive\Controller;

use OCA\ZimbraDrive\Settings\AppSettings;
use OCP\AppFramework\Http\RedirectResponse;
use OCP\AppFramework\Controller;

use OCP\IRequest;

class PageController extends Controller
{
    private $userId;
    private $zimbra_url;
    private $zimbra_port;
    private $use_ssl;
    private $zimbra_preauth_key;

    /**
     * PageController constructor.
     * @param string $AppName
     * @param IRequest $request
     * @param $UserId
     * @param AppSettings $appSettings
     */
    public function __construct(
        $AppName,
        IRequest $request,
        $UserId,
        AppSettings $appSettings
    )
    {
        parent::__construct($AppName, $request);
        $this->userId = $UserId;

        $this->zimbra_url = $appSettings->getServerUrl();
        $this->zimbra_port = $appSettings->getServerPort();
        $this->zimbra_preauth_key = $appSettings->getZimbraPreauthKey();
        $this->use_ssl = $appSettings->useSSLDuringZimbraAuthentication();
    }

    /**
     * CAUTION: the @Stuff turns off security checks; for this page no admin is
     *          required and no CSRF check "NoCSRFRequired". If you don't know what CSRF is, read
     *          it up in the docs or you might create a security hole. This is
     *          basically the only required method to add this exemption, don't
     *          add it to any other method if you don't exactly know what it does
     *
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function index()
    {
        $baseUrl = sprintf(
            "http%s://%s:%s",
            ($this->use_ssl ? "s" : ""),
            $this->zimbra_url,
            $this->zimbra_port);
        $loginUrlPart = "";

        if($this->zimbra_preauth_key !== '')
        {
            $timestamp = time()*1000;
            $preauthToken = hash_hmac("sha1", $this->userId."|id|0|".$timestamp, $this->zimbra_preauth_key);
            $loginUrlPart = sprintf(
                "/service/preauth?account=%s&by=id&timestamp=%s&expires=0&preauth=%s",
                $this->userId,
                $timestamp,
                $preauthToken
            );
        }
        return new RedirectResponse($baseUrl . $loginUrlPart);
    }
}
