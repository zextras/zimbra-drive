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

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.InputStreamEntity;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.protocol.HTTP;
import org.json.JSONObject;
import org.openzal.zal.Account;
import org.openzal.zal.http.HttpHandler;
import org.openzal.zal.log.ZimbraLog;

import javax.servlet.ServletException;
import javax.servlet.http.*;
import java.io.*;
import java.util.*;

public class UploadFileHttpHandler extends HttpServlet implements HttpHandler {
  private final static int HTTP_LOWEST_ERROR_STATUS = 300;
  private final static String NEXT_CLOUD_UPLOAD_FILE_URL = "/apps/zimbradrive/api/1.0/UploadFile";

  private final BackendUtils mBackendUtils;
  private final DriveProxy   mDriveProxy;

  public UploadFileHttpHandler(BackendUtils backendUtils, DriveProxy driveProxy)
  {
    mBackendUtils = backendUtils;
    mDriveProxy = driveProxy;
  }

  @Override
  public void doGet(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
  {
    throw new RuntimeException();
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
      ZimbraLog.extensions.warn("Unable to upload file", ex);
      throw new RuntimeException(ex);
    }
  }

  public void doInternalPost(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws IOException 
  {
    HttpResponse fileRequestResponseFromDrive = uploadFileToDrive(httpServletRequest);


    int responseCode = fileRequestResponseFromDrive.getStatusLine().getStatusCode();
    httpServletResponse.setStatus(responseCode);
    if (responseCode < HTTP_LOWEST_ERROR_STATUS){
      String responseForZimlet = createResponseForZimlet(fileRequestResponseFromDrive);
      httpServletResponse.getWriter().write(responseForZimlet);
    }
  }

  private String createResponseForZimlet(HttpResponse fileRequestResponseFromDrive) {
    BasicResponseHandler basicResponseHandler = new BasicResponseHandler();
    String responseBody = null;
    try {
      responseBody = basicResponseHandler.handleResponse(fileRequestResponseFromDrive);
    } catch (IOException e) {
      ZimbraLog.extensions.debug("Unable to create response for zimlet", e);
      throw new RuntimeException();
    }

    JSONObject jsonResponse = new JSONObject(responseBody);

    int responseCode = fileRequestResponseFromDrive.getStatusLine().getStatusCode();

    return htmlResponse(jsonResponse.toString(), responseCode);
  }

  private String htmlResponse(String response, int status) {
    return "<html>\n" +
            "\t<head>\n" +
            "\t\t<meta name='uploadedFilesStatus' content='" + response + "'>\n" +
            "\t</head>\n" +
            "\t<body onload='window.parent.appCtxt.getUploadManager().loaded(" + status + ");'>\n" +
            "\t</body>\n" +
            "</html>\n";
  }

  private String createUserInfoInFormStyle(Account userAccount, String boundaryOfParts)
  {
    AccountToken token = mBackendUtils.getAccountToken(userAccount);

    String usernamePartsString =
            "Content-Disposition: form-data; name=\"username\"\r\n" +
                    "\r\n" +
                    userAccount.getName();
    String tokenPartsString =
            "Content-Disposition: form-data; name=\"token\"\r\n" +
                    "\r\n" +
                    token.getToken();

    String userInfoParts =  getFirstBodyBoundary(boundaryOfParts) +
            usernamePartsString +
            getInternalBodyBoundary(boundaryOfParts) +
            tokenPartsString;
    return userInfoParts;
  }

  private String getFirstBodyBoundary(String boundary)
  {
    return "--" + boundary + "\r\n";
  }

  private String getInternalBodyBoundary(String boundary)
  {
    return "\r\n--" + boundary + "\r\n";
  }

  private String getFormPartsBoundary(HttpServletRequest httpServletRequest) throws IOException {
    try (InputStream userRequestInputStream = httpServletRequest.getInputStream()) {
      String firstLineOfBodyForm = readFirstLineOf(userRequestInputStream);
      return firstLineOfBodyForm.substring(2, firstLineOfBodyForm.length());
    }
  }

  private String readFirstLineOf(InputStream inputStream) throws IOException
  {
    StringBuilder firstLineBuilder = new StringBuilder();
    int nextByteValue;
    nextByteValue = inputStream.read();
    while(nextByteValue != -1 && nextByteValue != '\r' && nextByteValue != '\n') {
      firstLineBuilder.append((char) nextByteValue);
      nextByteValue = inputStream.read();
    }
    if(nextByteValue == '\r') //next byte is "\n"
    {
      inputStream.read();
    }
    return firstLineBuilder.toString();
  }

  private HttpResponse uploadFileToDrive(HttpServletRequest httpServletRequest) throws IOException {
    String formBoundary = getFormPartsBoundary(httpServletRequest);
    Account userAccount = mBackendUtils.assertAccountFromAuthToken(httpServletRequest);
    HttpEntity requestToSendToDrive = createUploadFileRequest(httpServletRequest, formBoundary, userAccount);
//    String driveOnCloudDomain = ConfigUtils.getNcDomain(userAccount.getDomainName());
    String driveOnCloudDomain = mDriveProxy.getDriveDomainAssociatedToDomain(userAccount.getDomainName());
    String fileUploadRequestUrl = driveOnCloudDomain + NEXT_CLOUD_UPLOAD_FILE_URL;
    HttpPost post = new HttpPost(fileUploadRequestUrl);
    post.setEntity(requestToSendToDrive);
    post.setHeader(HTTP.CONTENT_TYPE, "multipart/form-data; boundary=" + formBoundary);
    HttpClient client = HttpClientBuilder.create().build();
    return client.execute(post);
  }

  private HttpEntity createUploadFileRequest(HttpServletRequest httpServletRequest, String formBoundary, Account userAccount) throws IOException {
    InputStream userRequestInputStream = httpServletRequest.getInputStream();
    String userInfoPartsString = createUserInfoInFormStyle(userAccount, formBoundary);
    String internalFormPartsBoundary = getInternalBodyBoundary(formBoundary);
    List<InputStream> payloadStreamToSendToDrive = Arrays.asList(
      new ByteArrayInputStream(userInfoPartsString.getBytes()),
      new ByteArrayInputStream(internalFormPartsBoundary.getBytes()),
      userRequestInputStream // TODO: This inputStreams will be closed?
    );

    SequenceInputStream payloadToSendToDriveInputStream = new SequenceInputStream(Collections.enumeration(payloadStreamToSendToDrive));

    int contentLength = httpServletRequest.getIntHeader(HTTP.CONTENT_LEN);
    int diffInternalFormPartsBoundaryAndFirstBodyBoundary = 2; // getFirstBodyBoundary(boundaryOfParts) - getInternalBodyBoundary(formBoundary)
    contentLength = contentLength + userInfoPartsString.length() + diffInternalFormPartsBoundaryAndFirstBodyBoundary;
    return new InputStreamEntity(payloadToSendToDriveInputStream, contentLength);
  }


  @Override
  public void doOptions(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
  {
    super.doOptions(httpServletRequest, httpServletResponse);
  }

  @Override
  public String getPath()
  {
    return "ZimbraDrive_Upload";
  }

}
