/*
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

  public NcUserZimbraBackendHttpHandler(BackendUtils backendUtils)
  {
    mBackendUtils = backendUtils;
  }

  @Override
  public void doGet(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
  {
    throw new RuntimeException();
  }

  @Override
  public void doPost(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
  {
    final Map<String, String> paramsMap = BackendUtils.getJsonRequestParams(httpServletRequest);
    
    final JSONObject returnObj = new JSONObject();
    Account accountById = mBackendUtils.getAccountById(paramsMap.get(KEY_USERNAME));
    if (accountById != null) {
      this.handleAsToken(paramsMap, returnObj);
    } else {
      this.handleAsAccount(paramsMap, returnObj);
    }
    try
    {
      httpServletResponse.getOutputStream().println(returnObj.toString());
    } catch (IOException e)
    {
      ZimbraLog.mailbox.error("IO exception: error getting response output stream.", e);
      throw e;
    }
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

  private void handleAsToken(Map<String, String> paramsMap, JSONObject returnObj)
  {
    String username = paramsMap.get(KEY_USERNAME);
    String tokenStr = paramsMap.get(KEY_PASSWORD);

    AccountToken token = mBackendUtils.getAccountToken(username, tokenStr);
    if (token == null || token.isExpired())
    {
      throw new RuntimeException();
    }
    Account account = token.getAccount();

    ZimbraLog.mailbox.info("NcUserZimbraBackend: [TOKEN] Authenticated " + account.getId());
    returnObj.put("accountId", account.getId());
    returnObj.put("displayName", account.getDisplayName());
    returnObj.put("email", account.getName());
  }

  private void handleAsAccount(Map<String, String> paramsMap, JSONObject returnObj)
  {
    String username = paramsMap.get(KEY_USERNAME);
    String password = paramsMap.get(KEY_PASSWORD);

    if (!username.contains("@"))
    { // Must be an email address
      throw new RuntimeException();
    }
    Account account = mBackendUtils.getAccountByName(username);
    try {
      account.authAccount(password, Protocol.zsync);
    } catch (ZimbraException ex) {
      mBackendUtils.getAccountToken(account.getId(), password);
    }
    ZimbraLog.mailbox.info("NcUserZimbraBackend: [PASSW] Authenticated " + account.getId());
    returnObj.put("accountId", account.getId());
    returnObj.put("displayName", account.getDisplayName());
    returnObj.put("email", account.getName());
  }

}
