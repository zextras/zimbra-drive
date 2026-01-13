/*
 * Copyright (C) 2017 ZeXtras SRL
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

package com.zextras.zimbradrive;

import java.nio.charset.StandardCharsets;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.utils.URLEncodedUtils;
import org.openzal.zal.Account;
import org.openzal.zal.AuthProvider;
import org.openzal.zal.AuthToken;
import org.openzal.zal.Provisioning;
import org.openzal.zal.exceptions.NoSuchAccountException;
import org.openzal.zal.log.ZimbraLog;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BackendUtils
{

  private static final String AUTH_TOKEN = "ZM_AUTH_TOKEN";

  private final Provisioning mProvisioning;
  private final TokenManager mTokenManager;


  public BackendUtils(Provisioning provisioning, TokenManager tokenManager) {
    mProvisioning = provisioning;
    mTokenManager = tokenManager;
  }

  public Account assertAccountFromAuthToken(HttpServletRequest httpServletRequest)
  {
    String accountId = "null";
    try {
      AuthToken authToken = assertAuthToken(httpServletRequest);
      accountId = authToken.getAccountId();
      return mProvisioning.assertAccountById(accountId);
    }
    catch (NoSuchAccountException ignore)
    {
      ZimbraLog.extensions.debug("Unable to find account with id:", accountId);
      throw new NotValidAuthTokenException();
    }
    catch (Exception ex) {
      ZimbraLog.extensions.error("Error on authentication", ex);
      throw new RuntimeException(ex);
    }
  }

  private AuthToken assertAuthToken(HttpServletRequest httpServletRequest) {
    String zmAuthToken = assertZmAuthTokenFromCookies(httpServletRequest);
    try {
      AuthProvider authProvider = new AuthProvider();
      return authProvider.decodeAuthToken(zmAuthToken);
    }
    catch (Exception ex) {
      ZimbraLog.extensions.debug("Unable to create authToken", ex);
      throw new NotValidAuthTokenException();
    }
  }

  private class NotValidAuthTokenException extends RuntimeException
  {}

  private String assertZmAuthTokenFromCookies(HttpServletRequest httpServletRequest)  {
    Cookie[] cookies = httpServletRequest.getCookies();
    for (Cookie cookie : cookies) {
      if (cookie.getName().equals(AUTH_TOKEN)) {
        return cookie.getValue();
      }
    }
    throw new NoZmAuthTokenCookieFoundException();
  }

  private class NoZmAuthTokenCookieFoundException extends RuntimeException
  {}

  public String getServerServiceUrl(String path) {
    return mProvisioning.getLocalServer().getServiceURL(path);
  }

  public AccountToken getAccountToken(Account account) {
    return mTokenManager.getAccountToken(account);
  }

  public AccountToken getAccountToken(String accountId, String tokenStr) {
    return mTokenManager.getAccountToken(accountId, tokenStr);
  }


  public static Map<String, String> getJsonRequestParams(HttpServletRequest httpServletRequest) throws IOException
  {
    String body = IOUtils.toString(httpServletRequest.getReader());
    List<NameValuePair> requestParameters = URLEncodedUtils.parse(body, StandardCharsets.UTF_8);

    Map<String, String> paramsMap = new HashMap<String, String>();
    for (NameValuePair item : requestParameters)
    {
      paramsMap.put(item.getName(), item.getValue());
    }
    return paramsMap;
  }

  public static HttpEntity getEncodedForm(List<NameValuePair> driveOnCloudParameters)
  {
    return new UrlEncodedFormEntity(driveOnCloudParameters, StandardCharsets.UTF_8);
  }
}
