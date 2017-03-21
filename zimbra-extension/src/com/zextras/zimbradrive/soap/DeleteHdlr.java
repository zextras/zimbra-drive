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
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONArray;
import org.json.JSONException;
import org.openzal.zal.soap.*;

import java.io.IOException;
import java.util.List;

public class DeleteHdlr implements SoapHandler
{
  private static final String COMMAND = "Delete";

  public static final QName QNAME = new QName(COMMAND + "Request", ZimbraDriveExtension.SOAP_NAMESPACE);
  private static final QName RESPONSE_QNAME = new QName(COMMAND + "Response", ZimbraDriveExtension.SOAP_NAMESPACE);

  private final static int HTTP_LOWEST_ERROR_STATUS = 300;

  private final CloudUtils mCloudUtils;

  DeleteHdlr(CloudUtils cloudUtils)
  {
    mCloudUtils = cloudUtils;
  }

  @Override
  public void handleRequest(ZimbraContext zimbraContext, SoapResponse soapResponse, ZimbraExceptionContainer zimbraExceptionContainer)
  {
    try
    {
      String[] targetPath;
      String recPath = zimbraContext.getParameter(ZimbraDriveItem.F_PATH, "");
      try {
        JSONArray recArray = new JSONArray(recPath);
        targetPath = new String[recArray.length()];
        for (int i = 0; i < recArray.length(); i++) {
          targetPath[i] = recArray.getString(i);
        }
      } catch (JSONException ex) {
        targetPath = new String[1];
        targetPath[0] = recPath;
      }

      for (String target : targetPath)
      {
        // TODO: Investigate about the `files/` prefix
        HttpResponse response = sendDeleteDriveOnCloudServerService(zimbraContext, target);

        soapResponse.setQName(RESPONSE_QNAME);

        final int responseStatusCode = response.getStatusLine().getStatusCode();
        if (responseStatusCode >= HTTP_LOWEST_ERROR_STATUS)
        {
          throw new Exception(Integer.toString(responseStatusCode));
        }
      }
    } catch (Exception e)
    {
      throw new RuntimeException(e);
    }
  }

  private HttpResponse sendDeleteDriveOnCloudServerService(final ZimbraContext zimbraContext, final String targetPath) throws IOException {
    List<NameValuePair> driveOnCloudParameters = mCloudUtils.createDriveOnCloudParams(zimbraContext);
    driveOnCloudParameters.add(new BasicNameValuePair(ZimbraDriveItem.F_PATH, targetPath));
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
