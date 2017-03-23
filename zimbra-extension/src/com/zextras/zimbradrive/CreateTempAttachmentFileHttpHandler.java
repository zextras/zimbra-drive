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

import org.apache.http.Header;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.TrustStrategy;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.ssl.SSLContextBuilder;
import org.openzal.zal.Account;
import org.openzal.zal.AuthToken;
import org.openzal.zal.Provisioning;
import org.openzal.zal.http.HttpHandler;
import org.openzal.zal.log.ZimbraLog;

import javax.servlet.ServletException;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.security.KeyManagementException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;


public class CreateTempAttachmentFileHttpHandler implements HttpHandler {
  private final static String AUTH_TOKEN = "ZM_AUTH_TOKEN";
  private final static String CONTENT_DISPOSITION_HTTP_HEADER = "Content-Disposition";
  private final static int HTTP_LOWEST_ERROR_STATUS = 300;

  private final Provisioning mProvisioning;
  private final CloudUtils mCloudUtils;

  public CreateTempAttachmentFileHttpHandler(Provisioning provisioning, CloudUtils cloudServerUtils)
  {
    mProvisioning = provisioning;
    mCloudUtils = cloudServerUtils;
  }

  @Override
  public void doPost(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
  {
    try
    {
      doInternalPost(httpServletRequest, httpServletResponse);
    }
    catch (Exception ex)
    {
      ZimbraLog.extensions.warn("Unable to add attachment", ex);
      throw new RuntimeException(ex);
    }
  }
  
  public void doInternalPost(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException, KeyStoreException, NoSuchAlgorithmException, KeyManagementException
  {
    String zmAuthToken = null;
    Cookie[] cookies = httpServletRequest.getCookies();
    for (Cookie cookie : cookies) {
      if (cookie.getName().equals(AUTH_TOKEN)) {
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

        String path;
        BufferedReader reader = httpServletRequest.getReader();
        while ((path = reader.readLine()) != null) {
          HttpResponse fileRequestResponse = mCloudUtils.queryCloudServerService(account, path);

          int responseCode = fileRequestResponse.getStatusLine().getStatusCode();
          if (responseCode < HTTP_LOWEST_ERROR_STATUS)
          {
            HttpPost post = new HttpPost(
              mProvisioning.getLocalServer().getServiceURL("/service/upload?fmt=extended,raw")
            );
            Header[] headers = fileRequestResponse.getAllHeaders();
            for (Header header : headers)
            {
              String headerName = header.getName();
              switch (headerName)
              {
                case CONTENT_DISPOSITION_HTTP_HEADER:
                  post.setHeader(CONTENT_DISPOSITION_HTTP_HEADER, java.net.URLDecoder.decode(header.getValue(), "UTF-8"));
                  break;
                case HttpHeaders.CONTENT_TYPE:
                case HttpHeaders.CONTENT_LENGTH:
                  break;
              }
            }
            post.setHeader("Cache-Control", "no-cache");
            post.setHeader("Cookie", httpServletRequest.getHeader("Cookie"));
            post.setHeader("X-Zimbra-Csrf-Token", httpServletRequest.getHeader("X-Zimbra-Csrf-Token"));
            post.setEntity(fileRequestResponse.getEntity());

            SSLContextBuilder builder = new SSLContextBuilder();
            builder.loadTrustMaterial(null, new TrustStrategy(){
              @Override
              public boolean isTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException
              {
                return true;
              }
            });
            SSLConnectionSocketFactory sslSocketFactory = new SSLConnectionSocketFactory(
              builder.build());
            CloseableHttpClient client = HttpClients.custom().setSSLSocketFactory(
              sslSocketFactory).build();
            
            HttpResponse response = client.execute(post);

            response.getEntity().writeTo(httpServletResponse.getOutputStream());
          } else
          {
            httpServletResponse.setStatus(responseCode);
            PrintWriter respWriter = httpServletResponse.getWriter();
            respWriter.println("Error");
            respWriter.close();
            break;
          }
        }
      }
    }
  }

  @Override
  public void doGet(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
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
    return "ZimbraDrive_CreateTempFiles";
  }

}
