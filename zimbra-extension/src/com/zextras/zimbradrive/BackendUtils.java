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


import org.apache.http.HttpEntity;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.openzal.zal.log.ZimbraLog;

import javax.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BackendUtils
{

  public static Map<String, String> getJsonRequestParams(HttpServletRequest httpServletRequest)
  {
    try
    {
      StringBuilder jb = new StringBuilder();
      String line = null;
      BufferedReader reader = httpServletRequest.getReader();
      while ((line = reader.readLine()) != null)
      {
        jb.append(line);
      }
      Map<String, String> paramsMap = new HashMap<String, String>();

      String[] params = jb.toString().split("&");
      for (String param : params)
      {
        String[] subParam = param.split("=");
        paramsMap.put(subParam[0], subParam[1]);
      }

      return paramsMap;
    } catch (IOException e)
    {
      ZimbraLog.mailbox.error("IO exception: error reading request to JSON", e);
      throw new RuntimeException();
    }
  }

  public static HttpEntity getEncodedForm(List<NameValuePair> driveOnCloudParameters)  throws UnsupportedEncodingException
  {
    try {
      return new UrlEncodedFormEntity(driveOnCloudParameters);
    }
    catch (UnsupportedEncodingException ex) {
      ZimbraLog.mailbox.error("Unsupported encoding exception: error encoding drive on cloud parameters.", ex);
      throw ex;
    }
  }
}
