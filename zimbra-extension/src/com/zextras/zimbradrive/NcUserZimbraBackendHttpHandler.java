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

import org.json.JSONObject;
import org.openzal.zal.*;
import org.openzal.zal.exceptions.ZimbraException;
import org.openzal.zal.http.HttpHandler;
import org.openzal.zal.log.ZimbraLog;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;

public class NcUserZimbraBackendHttpHandler implements HttpHandler
{
  private final static String KEY_USERNAME = "username";
  private final static String KEY_PASSWORD = "password";
  private final BackendUtils mBackendUtils;
  private final ZimbraDriveLog mZimbraDriveLog;

  public NcUserZimbraBackendHttpHandler(BackendUtils backendUtils, ZimbraDriveLog zimbraDriveLog)
  {
    mBackendUtils = backendUtils;
    mZimbraDriveLog = zimbraDriveLog;
  }

  @Override
  public void doPost(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
  {
    mZimbraDriveLog.setLogContext(httpServletRequest);
    try {
      internalDoPost(httpServletRequest, httpServletResponse);
    }
    catch (Exception ex)
    {
      ZimbraLog.extensions.warn(mZimbraDriveLog.getIntroductionLog() + "Unable to authenticate the user", ex);
    }
    finally
    {
      ZimbraLog.clearContext();
    }
  }

  private void internalDoPost(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
  {
    final Map<String, String> paramsMap = BackendUtils.getJsonRequestParams(httpServletRequest);
    String userId = paramsMap.get(KEY_USERNAME);
    String password = paramsMap.get(KEY_PASSWORD);

    ZimbraLog.addAccountNameToContext(userId);

    Account userAccount = getAccount(userId, password);

    if (userAccount != null)
    {
    ZimbraLog.security.info(mZimbraDriveLog.getIntroductionLog() + "Authentication success for user '" + userAccount.getName() + "'");
    printUserAttributesResponse(httpServletResponse, userAccount);
    } else
    {
      ZimbraLog.security.info(mZimbraDriveLog.getIntroductionLog() + "Authentication failed for user '" + userId + "'");
    }
  }

  private Account getAccount(String userId, String password) {
    Account userAccount;
    if (handleCredentialAsToken(userId)) {
      userAccount = getAccountByToken(userId, password);
    } else {
      userAccount = getAccountByCredentials(userId, password);
    }
    return userAccount;
  }

  private void printUserAttributesResponse(HttpServletResponse httpServletResponse, Account userAccount) throws IOException {
    JSONObject userAttributesJson = getUserPropertiesJson(userAccount);
    httpServletResponse.setContentType("application/json; charset=UTF-8");
    httpServletResponse.getOutputStream().println(userAttributesJson.toString());
  }

  private boolean handleCredentialAsToken(String userId) {
    Account accountById = mBackendUtils.getAccountById(userId);
    return accountById != null;
  }

  private Account getAccountByToken(String username, String tokenStr)
  {
    AccountToken token = mBackendUtils.getAccountToken(username, tokenStr);
    if (token != null && !token.isExpired())
    {
      return token.getAccount();
    }
    return null;
  }

  private JSONObject getUserPropertiesJson(Account account) {
    JSONObject returnObj = new JSONObject();
    returnObj.put("accountId", account.getId());
    returnObj.put("displayName", account.getDisplayName());
    returnObj.put("email", account.getName());
    return returnObj;
  }

  private Account getAccountByCredentials(String username, String password)
  {
    if (username.contains("@"))
    { // Must be an email address
      Account account = mBackendUtils.getAccountByName(username);
      if(account != null)
      {
        try
        {
          account.authAccount(password, Protocol.zsync);
          return account;
        } catch (ZimbraException ignore){}
      }
    }
    return null;
  }

  @Override
  public void doGet(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
  {
    throw new RuntimeException();
  }

  @Override
  public void doOptions(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
  {
    throw new RuntimeException();
  }

  @Override
  public String getPath()
  {
    return "ZimbraDrive_NcUserZimbraBackend";
  }

}
