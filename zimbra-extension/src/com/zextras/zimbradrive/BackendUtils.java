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


import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.openzal.zal.Account;
import org.openzal.zal.AuthToken;
import org.openzal.zal.Provisioning;
import org.openzal.zal.log.ZimbraLog;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
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
    try {
      AuthToken authToken = assertAuthToken(httpServletRequest);
      String accountId = authToken.getAccountId();
      Account account = mProvisioning.getAccountById(accountId);
      if(account == null)
      {
        ZimbraLog.extensions.debug("Unable to find account with id:", accountId);
        throw new NotValidAuthTokenException();
      }
      return account;
    }
    catch (Exception ex) {
      ZimbraLog.extensions.error("Error on authentication", ex);
      throw new RuntimeException(ex);
    }
  }

  private AuthToken assertAuthToken(HttpServletRequest httpServletRequest) {
    String zmAuthToken = assertZmAuthTokenFromCookies(httpServletRequest);
    try {
      return AuthToken.getAuthToken(zmAuthToken);
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

  public Account getAccountById(String accountId) {
    return mProvisioning.getAccountById(accountId);
  }

  public Account getAccountByName(String accountName) {
    return mProvisioning.getAccountByName(accountName);
  }

  public AccountToken getAccountToken(Account account) {
    return mTokenManager.getAccountToken(account);
  }

  public AccountToken getAccountToken(String accountId, String tokenStr) {
    return mTokenManager.getAccountToken(accountId, tokenStr);
  }


  public static Map<String, String> getJsonRequestParams(HttpServletRequest httpServletRequest)
  {
    try
    {
      StringBuilder jb = new StringBuilder();
      String line = null;
      BufferedReader reader = httpServletRequest.getReader();
      while ((line = reader.readLine()) != null)
      {
        jb.append(line);
      }
      Map<String, String> paramsMap = new HashMap<String, String>();

      String[] params = jb.toString().split("&");
      for (String param : params)
      {
        String[] subParam = param.split("=");
        paramsMap.put(subParam[0], subParam[1]);
      }

      return paramsMap;
    } catch (IOException e)
    {
      ZimbraLog.extensions.error("IO exception: error reading request to JSON", e);
      throw new RuntimeException();
    }
  }

  public static HttpEntity getEncodedForm(List<NameValuePair> driveOnCloudParameters)  throws UnsupportedEncodingException
  {
    try {
      return new UrlEncodedFormEntity(driveOnCloudParameters, "UTF-8");
    }
    catch (UnsupportedEncodingException ex) {
      ZimbraLog.extensions.error("Unsupported encoding exception: error encoding drive on cloud parameters.", ex);
      throw ex;
    }
  }
}
