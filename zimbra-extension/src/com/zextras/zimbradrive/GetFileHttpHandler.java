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

import org.apache.http.*;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;
import org.openzal.zal.*;
import org.openzal.zal.http.HttpHandler;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.util.*;


public class GetFileHttpHandler implements HttpHandler {
  private final static String AUTH_TOKEN = "ZM_AUTH_TOKEN";
  private final static String NEXT_CLOUD_GET_FILE_URL = "/apps/zimbradrive/api/1.0/GetFile";
  private final static String CONTENT_DISPOSITION_HTTP_HEADER = "Content-Disposition";
  private final static int HTTP_LOWEST_ERROR_STATUS = 300;

  private final Provisioning mProvisioning;
  private final TokenManager mTokenManager;

  public GetFileHttpHandler(Provisioning provisioning, TokenManager tokenManager)
  {
    mProvisioning = provisioning;
    mTokenManager = tokenManager;
  }

  @Override
  public void doGet(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
  {
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

    String zmAuthToken = null;
    Cookie[] cookies = httpServletRequest.getCookies();
    for(int i = 0; i < cookies.length; ++i)
    {
      Cookie cookie = cookies[i];
      if(cookie.getName().equals(AUTH_TOKEN) )
      {
        zmAuthToken = cookie.getValue();
        break;
      }
    }
    if(zmAuthToken != null)
    {
      AuthToken authToken = AuthToken.getAuthToken(zmAuthToken);

      if (authToken != null)
      {
        String accountId = authToken.getAccountId(); //todo what if the session is elapsed or the token is not valid?
        Account account = mProvisioning.getAccountById(accountId);

        String requestedUrl = httpServletRequest.getPathInfo();
        int lengthOfBaseUrl = this.getPath().length()+2; //   "/" + this.getPath() + "/"
        String path = requestedUrl.substring(lengthOfBaseUrl);

        // Don't trigger nextcloud if param preview=1
        if (paramsMap.containsKey("previewcallback")) {
          httpServletResponse.getWriter().print(this.triggerCallback(paramsMap.get("previewcallback")));
        }
        else
        {
          HttpResponse fileRequestResponse = queryDriveOnCloudServerService(account, path);

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
            OutputStream responseOutputStream = httpServletResponse.getOutputStream();
            try {
              fileRequestResponse.getEntity().writeTo(responseOutputStream);
            } finally {
              responseOutputStream.close();
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
    }
  }

  private HttpResponse queryDriveOnCloudServerService(final Account account, final String filePath) throws IOException
  {

    AccountToken token = mTokenManager.getAccountToken(account);

    List<NameValuePair> driveOnCloudParameters = new ArrayList<NameValuePair>();
    driveOnCloudParameters.add(new BasicNameValuePair("username", token.getAccount().getId()));
    driveOnCloudParameters.add(new BasicNameValuePair("token", token.getToken()));
    driveOnCloudParameters.add(new BasicNameValuePair("path", filePath));

    String driveOnCloudDomain = ConfigUtils.getNcDomain(account.getDomainName());
    String searchRequestUrl = driveOnCloudDomain + NEXT_CLOUD_GET_FILE_URL;

    HttpPost post = new HttpPost(searchRequestUrl);
    post.setEntity(BackendUtils.getEncodedForm(driveOnCloudParameters));

    HttpClient client = HttpClientBuilder.create().build();
    HttpResponse response = client.execute(post);

    return response;
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
    return "<html>\n" +
      "<head>\n" +
      "</head>\n" +
      "<body onload='onLoad()'>\n" +
      "<script>\n" +
      "function onLoad() {\n" +
      "    window.parent." + callback + "('','');\n" +
      "}\n" +
      "</script>\n" +
      "</body>\n" +
      "</html>\n";
  };

}
