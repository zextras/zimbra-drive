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
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONObject;
import org.openzal.zal.soap.*;

import java.io.IOException;
import java.util.List;

public class NewDirectoryHdlr implements SoapHandler
{
  private static final String COMMAND = "NewDirectory";

  public static final QName QNAME = new QName(COMMAND + "Request", ZimbraDriveExtension.SOAP_NAMESPACE);
  private static final QName RESPONSE_QNAME = new QName(COMMAND + "Response", ZimbraDriveExtension.SOAP_NAMESPACE);

  private final static int HTTP_LOWEST_ERROR_STATUS = 300;

  private final CloudHttpRequestUtils mCloudHttpRequestUtils;

  public NewDirectoryHdlr(CloudHttpRequestUtils cloudHttpRequestUtils)
  {
    mCloudHttpRequestUtils = cloudHttpRequestUtils;
  }

  @Override
  public void handleRequest(ZimbraContext zimbraContext, SoapResponse soapResponse, ZimbraExceptionContainer zimbraExceptionContainer)
  {
    try
    {
      privateHandleRequest(zimbraContext, soapResponse);
    } catch (Exception exception)
    {
      zimbraExceptionContainer.setException(exception);
    }
  }

  private void privateHandleRequest(ZimbraContext zimbraContext, SoapResponse soapResponse) throws IOException
  {

    String path = zimbraContext.getParameter(ZimbraDriveItem.F_PATH, "");
    HttpResponse response = sendNewDirectoryToDriveOnCloudServerService(zimbraContext, path);
    soapResponse.setQName(RESPONSE_QNAME);
    final int responseStatusCode = response.getStatusLine().getStatusCode();
    if(responseStatusCode >= HTTP_LOWEST_ERROR_STATUS)
    {
      throw new RuntimeException(Integer.toString(responseStatusCode));
    }

    BasicResponseHandler basicResponseHandler = new BasicResponseHandler();
    String responseBody = basicResponseHandler.handleResponse(response);

    appendSoapResponseFromDriveResponseFolder(soapResponse, responseBody);
  }

  private void appendSoapResponseFromDriveResponseFolder(final SoapResponse soapResponse, final String responseBody)
  {
    JSONObject rootObj = new JSONObject(responseBody);
    SoapResponse nodeSoap = soapResponse.createNode(ZimbraDriveItem.F_NEW_FOLDER);

    JsonToSoapUtils jsonToSoapUtils = new JsonToSoapUtils();
    jsonToSoapUtils.appendSoapValueFromDriveResponseFolder(nodeSoap, rootObj);
  }

  private HttpResponse sendNewDirectoryToDriveOnCloudServerService(final ZimbraContext zimbraContext, final String path) throws IOException {
    List<NameValuePair> driveOnCloudParameters = mCloudHttpRequestUtils.createDriveOnCloudAuthenticationParams(zimbraContext);
    driveOnCloudParameters.add(new BasicNameValuePair(ZimbraDriveItem.F_PATH, path));
    return mCloudHttpRequestUtils.sendRequestToCloud(zimbraContext, driveOnCloudParameters, COMMAND,
      "1.0");
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
