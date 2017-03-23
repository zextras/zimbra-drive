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

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.openzal.zal.Account;
import org.openzal.zal.Provisioning;
import org.openzal.zal.soap.ZimbraContext;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class CloudUtils
{

  private static final String DRIVE_ON_CLOUD_URL = "/apps/zimbradrive/api/1.0/";
  private static final String GET_FILE_URL = DRIVE_ON_CLOUD_URL + "GetFile";

  private final Provisioning mProvisioning;
  private final TokenManager mTokenManager;

  public CloudUtils(Provisioning provisioning, TokenManager tokenManager)
  {
    mProvisioning = provisioning;
    mTokenManager = tokenManager;
  }

  public List<NameValuePair> createDriveOnCloudAuthenticationParams(final ZimbraContext zimbraContext) {
    Account account = mProvisioning.getAccountById(zimbraContext.getAuthenticatedAccontId());

    AccountToken token = mTokenManager.getAccountToken(account);

    List<NameValuePair> driveOnCloudParameters = new ArrayList<NameValuePair>();
    driveOnCloudParameters.add(new BasicNameValuePair("username", token.getAccount().getId()));
    driveOnCloudParameters.add(new BasicNameValuePair("token", token.getToken()));
    return driveOnCloudParameters;
  }

  public HttpResponse sendRequestToCloud(final ZimbraContext zimbraContext, List<NameValuePair> driveOnCloudParameters, String driveCommand)  
    throws IOException
  {
    String driveOnCloudDomain = ConfigUtils.getNcDomain(mProvisioning.getAccountById(zimbraContext.getAuthenticatedAccontId()).getDomainName());
    String searchRequestUrl = driveOnCloudDomain + DRIVE_ON_CLOUD_URL + driveCommand;

    HttpPost post = new HttpPost(searchRequestUrl);
    post.setEntity(BackendUtils.getEncodedForm(driveOnCloudParameters));

    HttpClient client = HttpClientBuilder.create().build();
    return client.execute(post);
  }

  public HttpResponse queryCloudServerService(final Account account, final String filePath) throws IOException
  {
    AccountToken token = mTokenManager.getAccountToken(account);

    List<NameValuePair> driveOnCloudParameters = new ArrayList<NameValuePair>();
    driveOnCloudParameters.add(new BasicNameValuePair("username", token.getAccount().getId()));
    driveOnCloudParameters.add(new BasicNameValuePair("token", token.getToken()));
    driveOnCloudParameters.add(new BasicNameValuePair("path", filePath));

    String driveOnCloudDomain = ConfigUtils.getNcDomain(account.getDomainName());
    String searchRequestUrl = driveOnCloudDomain + GET_FILE_URL;

    HttpPost post = new HttpPost(searchRequestUrl);
    post.setEntity(BackendUtils.getEncodedForm(driveOnCloudParameters));

    HttpClient client = HttpClientBuilder.create().build();
    HttpResponse response = client.execute(post);

    return response;
  }
}
