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

namespace OCA\ZimbraDrive\Auth;
use OCA\ZimbraDrive\Settings\AppSettings;
use OCP\IServerContainer;

class ZimbraAuthenticationBackendImpl implements ZimbraAuthenticationBackend
{
    protected $zimbra_url;
    protected $zimbra_port;
    protected $use_ssl;
    protected $trust_invalid_certs;

    /**
     * @param IServerContainer $server
     */
    public function __construct($server)
    {
        $config = $server->getConfig();
        $appSettings = new AppSettings($config);

        $this->zimbra_url =$appSettings->getServerUrl();
        $this->zimbra_port = $appSettings->getServerPort();
        $this->use_ssl = $appSettings->useSSLDuringZimbraAuthentication();
        $this->trust_invalid_certs = $appSettings->trustInvalidCertificatesDuringZimbraAuthentication();
    }

    public function getZimbraUser($uid, $password)
    {
        $httpRequestResponse = $this->doZimbraAuthenticationRequest($uid, $password);

        if (200 !== $httpRequestResponse->getHttpCode())
        {
            throw new AuthenticationException();
        }
        $response = json_decode($httpRequestResponse->getRawResponse());
        $userId = $response->{'accountId'};
        $userDisplayName = $response->{'displayName'};
        $userEmail = $response->{'email'};

        $this->assertNotEmpty($userId, $userDisplayName, $userEmail);

        return new ZimbraUser($userId, $userDisplayName, $userEmail);
    }

    /**
     * @param $uid string
     * @param $password string
     * @return HttpRequestResponse
     */
    public function doZimbraAuthenticationRequest($uid, $password)
    {
        $postFields = $this->buildPostFields($uid, $password);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->ZimbraUserBackendHandlerUrl());
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        if ($this->trust_invalid_certs) {
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
        } else {
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 2);
        }

        $raw_response = curl_exec($ch);
        $response_info = curl_getinfo($ch);
        curl_close($ch);
        $http_code = $response_info["http_code"];

        $httpRequestResponseBuilder = new HttpRequestResponseBuilder();
        $httpRequestResponseBuilder->setRawResponse($raw_response);
        $httpRequestResponseBuilder->setHttpCode($http_code);
        $httpRequestResponse = $httpRequestResponseBuilder->build();
        return $httpRequestResponse;
    }

    /**
     * @param $uid string
     * @param $password string
     * @return string
     */
    private function buildPostFields($uid, $password)
    {
        $fields = array(
            "username" => $uid,
            "password" => $password
        );

        return http_build_query($fields);
    }

    private function ZimbraUserBackendHandlerUrl()
    {
        return sprintf(
            "%s://%s:%s/service/extension/ZimbraDrive_NcUserZimbraBackend",
            "http" . ($this->use_ssl ? "s" : ""),
            $this->zimbra_url,
            $this->zimbra_port
        );
    }

    private function assertNotEmpty()
    {
        foreach (func_get_args() as $string)
        {
            if(strlen($string) === 0)
            {
                throw new \Exception();
            }
        }
    }
}