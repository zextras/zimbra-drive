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

import com.zextras.zimbradrive.statustest.*;
import org.openzal.zal.Account;
import org.openzal.zal.http.HttpHandler;
import org.openzal.zal.log.ZimbraLog;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URL;
import java.util.LinkedList;
import java.util.List;

public class CloudAppTestsHttpHandler implements HttpHandler
{
  final private BackendUtils mBackendUtils;
  final private DriveProxy mDriveProxy;
  private final LinkedList<ConnectionTest> mConnectionTests;

  public CloudAppTestsHttpHandler(BackendUtils backendUtils, DriveProxy driveProxy, ConnectionTestUtils connectionTestUtils) {
    mBackendUtils = backendUtils;
    mDriveProxy = driveProxy;

    mConnectionTests = new LinkedList<>();
    mConnectionTests.add(new CloudHostConnectionConnectionTest(connectionTestUtils));
    mConnectionTests.add(new CloudAuthenticationConnectionTest(connectionTestUtils));
    mConnectionTests.add(new ZimbraDriveCloudAppConnectionTest(connectionTestUtils));
  }

  @Override
  public void doPost(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
  {
    throw new RuntimeException();
  }

  @Override
  public void doGet(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
  {
    try
    {
      internalDoGet(httpServletRequest, httpServletResponse);
    } catch (Exception e)
    {
      ZimbraLog.mailbox.warn("Unable to print test page", e);
      ZimbraLog.mailbox.debug(e.getMessage(), e);
      throw new RuntimeException(e);
    }
  }

  private void internalDoGet(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
  {
    assertAdmin(httpServletRequest);

    Account userAccount = mBackendUtils.assertAccountFromAuthToken(httpServletRequest);
    String userDomain = userAccount.getDomainName();
    String driveOnCloudDomain = mDriveProxy.getDriveDomainAssociatedToDomain(userDomain);
    URL driveOnCloudUrl = new URL(driveOnCloudDomain);

    ServletOutputStream servletOutputStream = httpServletResponse.getOutputStream();

    for (ConnectionTest connectionTest: mConnectionTests) {
      TestResult testResult = connectionTest.runOnTarget(driveOnCloudUrl);
      String htmlTestResult = createHtmlPageTestResult(testResult);
      servletOutputStream.println(htmlTestResult);
    }
  }

  private String createHtmlPageTestResult(TestResult testResult) {
    String passedMessage = testResult.isPassed() ? "OK" : "FAILED";
    return "[" + passedMessage + "] " + testResult.getTestName() + " : " + testResult.getMessage() + "\n";
  }

  private void assertAdmin(HttpServletRequest httpServletRequest) {
    Account userAccount = mBackendUtils.assertAccountFromAuthToken(httpServletRequest);
    if(!userAccount.isIsAdminAccount())
    {
      throw new RuntimeException("Not authorized, only admin can call /service/extension/" + getPath() + ".");
    }
  }

  @Override
  public void doOptions(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
  {
    throw new RuntimeException();
  }

  @Override
  public String getPath()
  {
    return "ZimbraDrive_CloudAppTests";
  }

}
