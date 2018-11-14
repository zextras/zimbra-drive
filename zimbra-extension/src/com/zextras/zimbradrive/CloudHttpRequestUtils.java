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

import com.zextras.zimbradrive.soap.ZimbraDriveItem;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONArray;
import org.json.JSONObject;
import org.openzal.zal.Account;
import org.openzal.zal.Provisioning;
import org.openzal.zal.soap.SoapResponse;
import org.openzal.zal.soap.ZimbraContext;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class CloudHttpRequestUtils
{

  private static final String DRIVE_ON_CLOUD_URL = "/apps/zimbradrive/api/"; //1.0/
  private static final String GET_FILE_URL = DRIVE_ON_CLOUD_URL + "GetFile";

  private final Provisioning mProvisioning;
  private final TokenManager mTokenManager;
  private final DriveProxy   mDriveProxy;

  public CloudHttpRequestUtils(Provisioning provisioning, TokenManager tokenManager, DriveProxy driveProxy)
  {
    mProvisioning = provisioning;
    mTokenManager = tokenManager;
    mDriveProxy = driveProxy;
  }

  public List<NameValuePair> createDriveOnCloudAuthenticationParams(final ZimbraContext zimbraContext) {
    Account account = mProvisioning.getAccountById(zimbraContext.getAuthenticatedAccontId());

    AccountToken token = mTokenManager.getAccountToken(account);

    List<NameValuePair> driveOnCloudParameters = new ArrayList<>();
    driveOnCloudParameters.add(new BasicNameValuePair("username", account.getId()));
    driveOnCloudParameters.add(new BasicNameValuePair("token", token.getToken()));
    return driveOnCloudParameters;
  }

  public HttpResponse sendRequestToCloud(
    final ZimbraContext zimbraContext,
    List<NameValuePair> driveOnCloudParameters,
    String driveCommand,
    String apiVersion)
    throws IOException
  {
    String authenticatedAccountId = zimbraContext.getAuthenticatedAccontId();
    Account authenticatedUser = mProvisioning.assertAccountById(authenticatedAccountId);
    String userDomain = authenticatedUser.getDomainName();
    String driveOnCloudDomain = mDriveProxy.getDriveDomainAssociatedToDomain(userDomain);
    String searchRequestUrl = driveOnCloudDomain + DRIVE_ON_CLOUD_URL + apiVersion + "/" + driveCommand;

    HttpPost post = new HttpPost(searchRequestUrl);
    post.setEntity(BackendUtils.getEncodedForm(driveOnCloudParameters));

    HttpClient client = HttpClientBuilder.create().build();
    return client.execute(post);
  }

  public HttpResponse queryCloudServerService(final Account account, final String filePath) throws IOException
  {
    AccountToken token = mTokenManager.getAccountToken(account);

    List<NameValuePair> driveOnCloudParameters = new ArrayList<>();
    driveOnCloudParameters.add(new BasicNameValuePair("username", account.getId()));
    driveOnCloudParameters.add(new BasicNameValuePair("token", token.getToken()));
    driveOnCloudParameters.add(new BasicNameValuePair("path", filePath));

    String driveOnCloudDomain = mDriveProxy.getDriveDomainAssociatedToDomain(account.getDomainName());
    String searchRequestUrl = driveOnCloudDomain + GET_FILE_URL;

    HttpPost post = new HttpPost(searchRequestUrl);
    post.setEntity(BackendUtils.getEncodedForm(driveOnCloudParameters));

    HttpClient client = HttpClientBuilder.create().build();
    return client.execute(post);
  }

  public void appendArrayNodesAttributeToSoapResponse(SoapResponse soapResponse, String jsonNodeArray) {
    JSONArray driveOnCloudResponseJsons = new JSONArray(jsonNodeArray);

    for (int i = 0; i < driveOnCloudResponseJsons.length(); i++)
    {
      JSONObject nodeJson = driveOnCloudResponseJsons.getJSONObject(i);

      SoapResponse nodeSoap = soapResponse.createNode(ZimbraDriveItem.NODE_NAME);

      nodeSoap.setValue(ZimbraDriveItem.F_NAME, nodeJson.getString(ZimbraDriveItem.F_NAME));
      nodeSoap.setValue(ZimbraDriveItem.F_SHARED, nodeJson.getBoolean(ZimbraDriveItem.F_SHARED));
      nodeSoap.setValue(ZimbraDriveItem.F_DATE, nodeJson.getInt(ZimbraDriveItem.F_DATE));

      nodeSoap.setValue(ZimbraDriveItem.F_ID, nodeJson.getInt(ZimbraDriveItem.F_ID));
      nodeSoap.setValue(ZimbraDriveItem.F_AUTHOR, nodeJson.getString(ZimbraDriveItem.F_AUTHOR));
      nodeSoap.setValue(ZimbraDriveItem.F_SIZE, nodeJson.getInt(ZimbraDriveItem.F_SIZE));
      nodeSoap.setValue(ZimbraDriveItem.F_PATH, nodeJson.getString(ZimbraDriveItem.F_PATH));

      JSONObject driveOnCloudNodePermissions = nodeJson.getJSONObject(ZimbraDriveItem.F_PERMISSIONS);
      SoapResponse nodeSoapPermission = nodeSoap.createNode(ZimbraDriveItem.F_PERMISSIONS);
      nodeSoapPermission.setValue(ZimbraDriveItem.F_PERM_READABLE, driveOnCloudNodePermissions.getBoolean(ZimbraDriveItem.F_PERM_READABLE));
      nodeSoapPermission.setValue(ZimbraDriveItem.F_PERM_WRITABLE, driveOnCloudNodePermissions.getBoolean(ZimbraDriveItem.F_PERM_WRITABLE));
      nodeSoapPermission.setValue(ZimbraDriveItem.F_PERM_SHAREABLE, driveOnCloudNodePermissions.getBoolean(ZimbraDriveItem.F_PERM_SHAREABLE));

      String nodeType = nodeJson.getString(ZimbraDriveItem.F_NODE_TYPE);
      nodeSoap.setValue(ZimbraDriveItem.F_NODE_TYPE, nodeType);
      if(nodeType.equals(ZimbraDriveItem.F_NODE_TYPE_FILE))
      {
        nodeSoap.setValue(ZimbraDriveItem.F_MIMETYPE, nodeJson.getString(ZimbraDriveItem.F_MIMETYPE));
      }

    }
    if (driveOnCloudResponseJsons.length() == 0) {
      soapResponse.createNode(ZimbraDriveItem.NODE_NAME);
    }
  }
}
