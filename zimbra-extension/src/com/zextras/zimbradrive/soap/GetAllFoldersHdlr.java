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

package com.zextras.zimbradrive.soap;


import com.zextras.zimbradrive.*;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.impl.client.BasicResponseHandler;
import org.json.JSONObject;
import org.openzal.zal.soap.*;

import java.io.IOException;
import java.util.List;

public class GetAllFoldersHdlr implements SoapHandler
{
  private static final String COMMAND = "GetAllFolders";

  public static final QName QNAME = new QName(COMMAND + "Request", ZimbraDriveExtension.SOAP_NAMESPACE);
  private static final QName RESPONSE_QNAME = new QName(COMMAND + "Response", ZimbraDriveExtension.SOAP_NAMESPACE);

  private final CloudUtils mCloudUtils;

  GetAllFoldersHdlr(CloudUtils cloudUtils)
  {
    mCloudUtils = cloudUtils;
  }

  @Override
  public void handleRequest(ZimbraContext zimbraContext, SoapResponse soapResponse, ZimbraExceptionContainer zimbraExceptionContainer)
  {
    try
    {
      HttpResponse response = queryDriveOnCloudServerServiceFolder(zimbraContext);
      BasicResponseHandler basicResponseHandler = new BasicResponseHandler();
      String responseBody = basicResponseHandler.handleResponse(response);

      soapResponse.setQName(RESPONSE_QNAME);

      appendSoapResponseFromDriveResponseFolder(soapResponse, responseBody);

    } catch (Exception e)
    {
      throw new RuntimeException(e);
    }
  }

  private HttpResponse queryDriveOnCloudServerServiceFolder(final ZimbraContext zimbraContext) throws IOException {
    List<NameValuePair> driveOnCloudParameters = mCloudUtils.createDriveOnCloudAuthenticationParams(zimbraContext);
    return mCloudUtils.sendRequestToCloud(zimbraContext, driveOnCloudParameters, COMMAND);
  }

  private void appendSoapResponseFromDriveResponseFolder(final SoapResponse soapResponse, final String responseBody)
  {
    JSONObject rootObj = new JSONObject(responseBody);
    SoapResponse nodeSoap = soapResponse.createNode(ZimbraDriveItem.NODE_ROOT);

    JsonToSoapUtils jsonToSoapUtils = new JsonToSoapUtils();
    jsonToSoapUtils.appendSoapValueFromDriveResponseFolder(nodeSoap, rootObj);
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
