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

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONException;
import org.json.JSONObject;
import org.openzal.zal.*;
import org.openzal.zal.exceptions.ZimbraException;
import org.openzal.zal.http.HttpHandler;
import org.openzal.zal.log.ZimbraLog;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class NcUserZimbraBackendHttpHandler implements HttpHandler
{
  private final static String KEY_USERNAME = "username";
  private final static String KEY_PASSWORD = "password";
  private final BackendUtils mBackendUtils;
  private final ZimbraDriveLog mZimbraDriveLog;
  private Provisioning mProvisioning;

  public NcUserZimbraBackendHttpHandler(
    BackendUtils backendUtils,
    ZimbraDriveLog zimbraDriveLog,
    Provisioning provisioning)
  {
    mBackendUtils = backendUtils;
    mZimbraDriveLog = zimbraDriveLog;
    mProvisioning = provisioning;
  }

  @Override
  public void doPost(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws IOException
  {
    mZimbraDriveLog.setLogContext(httpServletRequest);
    try
    {
      internalDoPost(httpServletRequest, httpServletResponse);
    }
    catch (Exception exception)
    {
      String errorMessage = mZimbraDriveLog.getLogIntroduction() + "Unable to authenticate the user";
      ZimbraLog.extensions.error(errorMessage, exception);
      httpServletResponse.sendError(500, errorMessage);
    }
    finally
    {
      ZimbraLog.clearContext();
    }
  }

  private void internalDoPost(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse)
    throws
    IOException
  {
    final Map<String, String> paramsMap = BackendUtils.getJsonRequestParams(httpServletRequest);
    String userId = paramsMap.get(KEY_USERNAME);
    String password = paramsMap.get(KEY_PASSWORD);

    ZimbraLog.addAccountNameToContext(userId);
    Account account;

    boolean areTokenCredentials = areTokenCredentials(userId);
    if (areTokenCredentials)
    {
      account = mProvisioning.assertAccountById(userId);
    }
    else
    {
      account = mProvisioning.assertAccountByName(userId);
    }


    if (areTokenCredentials)
    {
      if (account.isLocalAccount())
      {
        authenticateByToken(account,
                            password);
      }
      else
      {
        ZimbraLog.extensions.debug(
          mZimbraDriveLog.getLogIntroduction() + "user: " + account.getName() +
          ", redirect request to " + account.getMailHost());
        redirectRequestToRemoteServer(account,
                                      userId,
                                      password,
                                      httpServletResponse);
      }
    }
    else
    {
      authenticateByLogin(account,
                          password);
    }
    printUserAttributesResponse(httpServletResponse,
                                account);

  }

  private void redirectRequestToRemoteServer(
    Account account,
    String userId,
    String password,
    HttpServletResponse httpServletResponse)
    throws IOException
  {
    List<NameValuePair> remoteAuthRequestParameters = new ArrayList<>();
    remoteAuthRequestParameters.add(new BasicNameValuePair(KEY_USERNAME, userId));
    remoteAuthRequestParameters.add(new BasicNameValuePair(KEY_PASSWORD, password));

    Server remoteServer = mProvisioning.getServerByName(account.getMailHost());
    String authRequestUrl = remoteServer.getServiceURL("/service/extension/" + getPath());

    HttpPost post = new HttpPost(authRequestUrl);
    post.setEntity(BackendUtils.getEncodedForm(remoteAuthRequestParameters));

    HttpClient client = HttpClientBuilder.create().build();
    HttpResponse response = client.execute(post);
    try (OutputStream responseOutputStream = httpServletResponse.getOutputStream())
    {
      response.getEntity().writeTo(responseOutputStream);
    }

  }

  private void authenticateByToken(
    Account account,
    String tokenStr)
  {
    AccountToken token = mBackendUtils.getAccountToken(account.getId(),
                                                       tokenStr);
    if (token == null || token.isExpired())
    {
      ZimbraLog.security.warn(mZimbraDriveLog.getLogIntroduction() +
                              "Authentication failed for user '" +
                              account.getName() + "': token not valid");
      throw new RuntimeException("Token not valid.");
    }
  }

  private void authenticateByLogin(
    Account account,
    String password)
  {
    try
    {
      account.authAccount(password,
                          Protocol.zsync);
    }
    catch (ZimbraException ignore)
    {
      ZimbraLog.security.warn(mZimbraDriveLog.getLogIntroduction() +
                              "Authentication failed for user '" +
                              account.getName() + "': password not valid");
      throw new RuntimeException("Password not valid.");
    }
    ZimbraLog.security.info(mZimbraDriveLog.getLogIntroduction() + "Authentication success for user '" + account.getName() + "'");
  }

  private void printUserAttributesResponse(HttpServletResponse httpServletResponse, Account userAccount) throws IOException {
    JSONObject userAttributesJson = getUserAttributesJson(userAccount);
    httpServletResponse.setContentType("application/json; charset=UTF-8");
    httpServletResponse.getOutputStream().println(userAttributesJson.toString());
  }

  private JSONObject getUserAttributesJson(Account account) {
    JSONObject userAttributesJson = new JSONObject();
    try
    {
      userAttributesJson.put("accountId", account.getId());
      userAttributesJson.put("displayName", account.getDisplayName());
      userAttributesJson.put("email", account.getName());
    }
    catch (JSONException e)
    {
      throw new RuntimeException(e);
    }
    return userAttributesJson;
  }

  @Override
  public void doGet(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse)
  {
    throw new RuntimeException();
  }

  @Override
  public void doOptions(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse)
  {
    throw new RuntimeException();
  }

  @Override
  public String getPath()
  {
    return "ZimbraDrive_NcUserZimbraBackend";
  }

  private boolean areTokenCredentials(String userId) {
    return !userId.contains("@");
  }

}
