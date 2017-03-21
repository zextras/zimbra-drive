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

use OCP\AppFramework\Http\RedirectResponse;
use OCP\AppFramework\Controller;
use OCP;

use OCP\IRequest;
use OCP\IConfig;

class PageController extends Controller
{
    private $userId;
    private $zimbra_url;
    private $zimbra_port;
    private $use_ssl;
    private $zimbra_preauth_key;

    public function __construct(
        $AppName,
        IRequest $request,
        $UserId,
        IConfig $config
    )
    {
        parent::__construct($AppName, $request);
        $this->userId = $UserId;

        $this->zimbra_url = $config->getAppValue("zimbradrive", "zimbra_url");
        $this->zimbra_port = $config->getAppValue("zimbradrive", "zimbra_port");
        $this->zimbra_preauth_key = $config->getAppValue("zimbradrive", "preauth_key");
        $this->use_ssl = $config->getAppValue("zimbradrive", "use_ssl", "true") == "true";
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
        $timestamp = time()*1000;
        $preauthToken = hash_hmac("sha1", $this->userId."|id|0|".$timestamp, $this->zimbra_preauth_key);
        $url = sprintf(
            "%s://%s:%s/service/preauth?account=%s&by=id&timestamp=%s&expires=0&preauth=%s",
            "http" . ($this->use_ssl ? "s" : ""),
            $this->zimbra_url,
            $this->zimbra_port,
            $this->userId,
            $timestamp,
            $preauthToken
        );
        return new RedirectResponse($url);
    }
}
