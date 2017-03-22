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

package com.zextras.zimbradrive.soap;


import com.zextras.zimbradrive.*;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONArray;
import org.json.JSONObject;
import org.openzal.zal.soap.*;

import java.io.IOException;
import java.util.List;

import com.zextras.zimbradrive.soap.ZimbraDriveItem;

public class SearchRequestHdlr implements SoapHandler
{
  private static final String COMMAND = "Search";

  public static final QName QNAME = new QName(COMMAND +"Request", ZimbraDriveExtension.SOAP_NAMESPACE);
  private static final QName RESPONSE_QNAME = new QName(COMMAND + "Response", ZimbraDriveExtension.SOAP_NAMESPACE);

  private final CloudUtils mCloudUtils;

  public SearchRequestHdlr(CloudUtils cloudUtils)
  {
    mCloudUtils = cloudUtils;
  }

  @Override
  public void handleRequest(ZimbraContext zimbraContext, SoapResponse soapResponse, ZimbraExceptionContainer zimbraExceptionContainer)
  {
    try
    {
      String query = zimbraContext.getParameter("query", "");
      if (query.equals("")) { return; }
      soapResponse.setValue("query", query);
  
      String requestedTypesCsv = zimbraContext.getParameter("types", "");
      soapResponse.setValue("types", requestedTypesCsv);
  
      String[] requestedTypesArray = requestedTypesCsv.split(",");
      if(requestedTypesArray.length == 0)
      {
        requestedTypesArray = new String[]{ZimbraDriveItem.F_NODE_TYPE_FILE,
          ZimbraDriveItem.F_NODE_TYPE_FOLDER};
      }
      
      JSONArray defaultTypesJsonArray = new JSONArray(requestedTypesArray);
      requestedTypesCsv = defaultTypesJsonArray.toString();
      
  
      HttpResponse response = queryDriveOnCloudServerService(zimbraContext,
                                                             query,
                                                             requestedTypesCsv);
      BasicResponseHandler basicResponseHandler = new BasicResponseHandler();
      String responseBody = basicResponseHandler.handleResponse(response);  //throw HttpResponseException if status code >= 300
      
      soapResponse.setQName(RESPONSE_QNAME);
      appendSoapResponseFromDriveResponse(soapResponse, responseBody);

    } catch (Exception e)
    {
      throw new RuntimeException(e);
    }
  }

  private HttpResponse queryDriveOnCloudServerService(final ZimbraContext zimbraContext,
                                                      final String query,
                                                      final String types) throws IOException {
    List<NameValuePair> driveOnCloudParameters = mCloudUtils.createDriveOnCloudAuthenticationParams(zimbraContext);
    driveOnCloudParameters.add(new BasicNameValuePair("query", query));
    driveOnCloudParameters.add(new BasicNameValuePair("types", types));
    return mCloudUtils.sendRequestToCloud(zimbraContext, driveOnCloudParameters, COMMAND + "Request");
  }

  private void appendSoapResponseFromDriveResponse(final SoapResponse soapResponse, final String responseBody)
  {
    JSONArray driveOnCloudResponseJsons = new JSONArray(responseBody);

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

  @Override
  public boolean needsAdminAuthentication(ZimbraContext zimbraContext)
  {
    return false;
  }

  @Override
  public boolean needsAuthentication(ZimbraContext zimbraContext)
  {
    return true;
  }

}
