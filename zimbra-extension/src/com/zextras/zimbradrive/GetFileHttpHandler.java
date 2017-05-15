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

import org.apache.http.Header;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.openzal.zal.Account;
import org.openzal.zal.http.HttpHandler;
import org.openzal.zal.log.ZimbraLog;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.util.*;


public class GetFileHttpHandler implements HttpHandler {
  private final static String CONTENT_DISPOSITION_HTTP_HEADER = "Content-Disposition";
  private final static int HTTP_LOWEST_ERROR_STATUS = 300;

  private CloudUtils mCloudUtils;
  private BackendUtils mBackendUtils;

  public GetFileHttpHandler(CloudUtils cloudUtils, BackendUtils backendUtils)
  {
    mCloudUtils = cloudUtils;
    mBackendUtils = backendUtils;
  }

  @Override
  public void doGet(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws IOException {
    try {
      doInternalGet(httpServletRequest, httpServletResponse);
    } catch (Exception ex) {
      ZimbraLog.extensions.warn("Unable to get file", ex);
      throw new RuntimeException(ex);
    }
  }

  public void doInternalGet(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws IOException {
    Map<String, String> paramsMap = new HashMap<>();
    String queryString = httpServletRequest.getQueryString();
    if (queryString != null)
    {
      String[] params = queryString.split("&");
      for (String param : params)
      {
        String[] paramPair = param.split("=");
        if (paramPair.length > 1)
        {
          paramsMap.put(paramPair[0], paramPair[1]);
        }
      }
    }
    Account account = mBackendUtils.assertAccountFromAuthToken(httpServletRequest);
    String requestedUrl = httpServletRequest.getPathInfo();
    int lengthOfBaseUrl = this.getPath().length()+2; //   "/" + this.getPath() + "/"
    String path = requestedUrl.substring(lengthOfBaseUrl);

    // Don't trigger *cloud if param preview=1
    if (paramsMap.containsKey("previewcallback")) {
      httpServletResponse.getWriter().print(this.triggerCallback(paramsMap.get("previewcallback")));
    }
    else
    {
      HttpResponse fileRequestResponse = mCloudUtils.queryCloudServerService(account, path);

      int responseCode = fileRequestResponse.getStatusLine().getStatusCode();
      if (responseCode < HTTP_LOWEST_ERROR_STATUS)
      {
        Header[] headers = fileRequestResponse.getAllHeaders();
        for (Header header : headers)
        {
          String headerName = header.getName();
          switch (header.getName())
          {
            case CONTENT_DISPOSITION_HTTP_HEADER:
              if (paramsMap.containsKey("viewonly") && (paramsMap.get("viewonly").equals("1")))
              {
                httpServletResponse.setHeader(headerName, header.getValue().replace("attachment", "inline"));
              } else
              {
                httpServletResponse.setHeader(headerName, header.getValue());
              }
              break;
            case HttpHeaders.CONTENT_LENGTH:
            case HttpHeaders.CONTENT_TYPE:
              httpServletResponse.setHeader(headerName, header.getValue());
              break;
          }
        }
        try (OutputStream responseOutputStream = httpServletResponse.getOutputStream()) {
          fileRequestResponse.getEntity().writeTo(responseOutputStream);
        }
      }
      else {
        httpServletResponse.setStatus(responseCode);
        if (paramsMap.containsKey("errorcallback"))
        {
          httpServletResponse.getWriter().print(this.triggerCallback(paramsMap.get("errorcallback")));
        }
      }
    }
  }

  @Override
  public void doPost(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
  {
    throw new RuntimeException();
  }

  @Override
  public void doOptions(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
  {
    throw new RuntimeException();
  }

  @Override
  public String getPath()
  {
    return "ZimbraDrive_Download";
  }

  public String triggerCallback(String callback) {
    return
            "<html>\n" +
            "\t<head>\n" +
            "\t</head>\n" +
            "\t<body onload='onLoad()'>\n" +
            "\t\t<script>\n" +
            "\t\t\tfunction onLoad() {\n" +
            "\t\t\t\twindow.parent." + callback + "('','');\n" +
            "\t\t\t}\n" +
            "\t\t</script>\n" +
            "\t</body>\n" +
            "</html>\n";
  }

}
