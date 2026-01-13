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
