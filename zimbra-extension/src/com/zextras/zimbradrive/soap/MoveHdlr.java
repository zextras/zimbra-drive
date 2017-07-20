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
import org.apache.http.message.BasicNameValuePair;
import org.openzal.zal.soap.*;

import java.io.IOException;
import java.util.List;

public class MoveHdlr implements SoapHandler
{
  private static final String COMMAND = "Move";

  public static final QName QNAME = new QName(COMMAND + "Request", ZimbraDriveExtension.SOAP_NAMESPACE);
  private static final QName RESPONSE_QNAME = new QName(COMMAND + "Response", ZimbraDriveExtension.SOAP_NAMESPACE);

  private final static int HTTP_LOWEST_ERROR_STATUS = 300;

  private final CloudRequestUtils mCloudUtils;

  MoveHdlr(CloudRequestUtils cloudUtils)
  {
    mCloudUtils = cloudUtils;
  }

  @Override
  public void handleRequest(ZimbraContext zimbraContext, SoapResponse soapResponse, ZimbraExceptionContainer zimbraExceptionContainer)
  {
    try
    {
      String sourcePath = zimbraContext.getParameter(ZimbraDriveItem.F_SOURCE_PATH, "");
      String targetPath = zimbraContext.getParameter(ZimbraDriveItem.F_TARGET_PATH, "");
      HttpResponse response =sendMoveToDriveOnCloudServerService(zimbraContext, sourcePath, targetPath);

      soapResponse.setQName(RESPONSE_QNAME);

      final int responseStatusCode = response.getStatusLine().getStatusCode();
      if(responseStatusCode >= HTTP_LOWEST_ERROR_STATUS)
      {
        throw new Exception(Integer.toString(responseStatusCode));
      }

    } catch (Exception e)
    {
      throw new RuntimeException(e);
    }
  }

  private HttpResponse sendMoveToDriveOnCloudServerService(final ZimbraContext zimbraContext, final String sourcePath, final String targetPath) throws IOException {
    List<NameValuePair> driveOnCloudParameters = mCloudUtils.createDriveOnCloudAuthenticationParams(zimbraContext);
    driveOnCloudParameters.add(new BasicNameValuePair(ZimbraDriveItem.F_SOURCE_PATH, sourcePath));
    driveOnCloudParameters.add(new BasicNameValuePair(ZimbraDriveItem.F_TARGET_PATH, targetPath));
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
