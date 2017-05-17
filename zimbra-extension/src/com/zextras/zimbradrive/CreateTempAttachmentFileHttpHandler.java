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
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.conn.ssl.TrustStrategy;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.ssl.SSLContextBuilder;
import org.openzal.zal.Account;
import org.openzal.zal.http.HttpHandler;
import org.openzal.zal.log.ZimbraLog;

import javax.servlet.ServletException;
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
  private final static String CONTENT_DISPOSITION_HTTP_HEADER = "Content-Disposition";
  private final static int HTTP_LOWEST_ERROR_STATUS = 300;

  private final CloudUtils mCloudUtils;
  private final BackendUtils mBackendUtils;

  public CreateTempAttachmentFileHttpHandler(CloudUtils cloudServerUtils, BackendUtils backendUtils)
  {
    mCloudUtils = cloudServerUtils;
    mBackendUtils = backendUtils;
  }

  @Override
  public void doPost(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws IOException
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

  public void doInternalPost(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws IOException, KeyStoreException, NoSuchAlgorithmException, KeyManagementException
  {
    Account account = mBackendUtils.assertAccountFromAuthToken(httpServletRequest);
    String path;
    BufferedReader reader = httpServletRequest.getReader();
    while ((path = reader.readLine()) != null) {
      HttpResponse fileRequestResponse = mCloudUtils.queryCloudServerService(account, path);

      int responseCode = fileRequestResponse.getStatusLine().getStatusCode();
      if (responseCode < HTTP_LOWEST_ERROR_STATUS) {
        HttpPost post = new HttpPost(
            mBackendUtils.getServerServiceUrl("/service/upload?fmt=extended,raw")
        );
        post.setHeader(
            CONTENT_DISPOSITION_HTTP_HEADER,
            "attachment; filename=\" " + convertToUnicode(path.substring(path.lastIndexOf("/") + 1)) + " \""
        );
        post.setHeader("Cache-Control", "no-cache");
        post.setHeader("Cookie", httpServletRequest.getHeader("Cookie"));
        post.setHeader("X-Zimbra-Csrf-Token", httpServletRequest.getHeader("X-Zimbra-Csrf-Token"));
        post.setEntity(fileRequestResponse.getEntity());

        SSLContextBuilder builder = new SSLContextBuilder();
        builder.loadTrustMaterial(null, new TrustStrategy() {
          @Override
          public boolean isTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException {
            return true;
          }
        });
        SSLConnectionSocketFactory sslSocketFactory = new SSLConnectionSocketFactory(builder.build());
        CloseableHttpClient client = HttpClients.custom().setSSLSocketFactory(sslSocketFactory).build();

        HttpResponse response = client.execute(post);

        response.getEntity().writeTo(httpServletResponse.getOutputStream());
      } else {
        httpServletResponse.setStatus(responseCode);
        PrintWriter respWriter = httpServletResponse.getWriter();
        respWriter.println("Error");
        respWriter.close();
        break;
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

  private String convertToUnicode(String source) {
    String result = "";
    if (source.length() == 0) return source;
    for (int i = 0; i < source.length(); i++) {
      int charCode = (int) source.charAt(i);
      // Encode non-ascii or double quotes
      if ((charCode > 127) || (charCode == 34)) {
        String temp = Integer.toString(charCode);
        while (temp.length() < 4) {
          temp = "0" + temp;
        }
        result += "&#" + temp + ";";
      } else {
        result += source.charAt(i);
      }
    }
    return result;
  }
}
