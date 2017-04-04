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


import com.zextras.zimbradrive.CloudUtils;
import com.zextras.zimbradrive.ZimbraDriveExtension;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONArray;
import org.openzal.zal.soap.*;

import java.io.IOException;
import java.util.List;

public class GetFolderChildrenHdlr implements SoapHandler
{
  private static final String COMMAND = "GetFolderChildren";

  public static final QName QNAME = new QName(COMMAND +"Request", ZimbraDriveExtension.SOAP_NAMESPACE);
  private static final QName RESPONSE_QNAME = new QName(COMMAND + "Response", ZimbraDriveExtension.SOAP_NAMESPACE);

  private final CloudUtils mCloudUtils;

  public GetFolderChildrenHdlr(CloudUtils cloudUtils)
  {
    mCloudUtils = cloudUtils;
  }

  @Override
  public void handleRequest(ZimbraContext zimbraContext, SoapResponse soapResponse, ZimbraExceptionContainer zimbraExceptionContainer)
  {
    try
    {
      soapResponse.setQName(RESPONSE_QNAME);

      String path = zimbraContext.getParameter("path", "");
      soapResponse.setValue("path", path);

      String requestedTypesCsv = zimbraContext.getParameter("types", "");
      soapResponse.setValue("types", requestedTypesCsv);

      String[] requestedTypesArray = requestedTypesCsv.split(",");
      if(requestedTypesArray.length == 1)
      {
        requestedTypesArray = new String[]{ZimbraDriveItem.F_NODE_TYPE_FILE,
          ZimbraDriveItem.F_NODE_TYPE_FOLDER};
      }
      
      JSONArray defaultTypesJsonArray = new JSONArray(requestedTypesArray);
      requestedTypesCsv = defaultTypesJsonArray.toString();

      HttpResponse response = queryDriveOnCloudServerService(zimbraContext,
          path,
          requestedTypesCsv);
      BasicResponseHandler basicResponseHandler = new BasicResponseHandler();
      String responseBody = basicResponseHandler.handleResponse(response);  //throw HttpResponseException if status code >= 300

      mCloudUtils.appendArrayNodesAttributeToSoapResponse(soapResponse, responseBody);

    } catch (Exception e)
    {
      throw new RuntimeException(e);
    }
  }

  private HttpResponse queryDriveOnCloudServerService(final ZimbraContext zimbraContext,
                                                      final String path,
                                                      final String types) throws IOException {
    List<NameValuePair> driveOnCloudParameters = mCloudUtils.createDriveOnCloudAuthenticationParams(zimbraContext);
    driveOnCloudParameters.add(new BasicNameValuePair("path", path));
    driveOnCloudParameters.add(new BasicNameValuePair("types", types));
    return mCloudUtils.sendRequestToCloud(zimbraContext, driveOnCloudParameters, COMMAND);
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
