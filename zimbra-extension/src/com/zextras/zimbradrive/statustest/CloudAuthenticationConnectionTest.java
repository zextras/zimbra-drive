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

package com.zextras.zimbradrive.statustest;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;

public class CloudAuthenticationConnectionTest implements ConnectionTest {
  private final ConnectionTestUtils mConnectionTestUtils;

  public CloudAuthenticationConnectionTest(ConnectionTestUtils connectionTestUtils) {
    mConnectionTestUtils = connectionTestUtils;
  }

  @Override
  public TestResult runOnTarget(URL cloudDomainUrl) {
    boolean isCloudAuthenticationConnected;
    try {
      isCloudAuthenticationConnected = isHttpServerReachable(cloudDomainUrl);
    } catch (IOException | URISyntaxException e) {
      return new TestNotPassed(getName(), "Cloud authentication page is not reachable (" + e.getMessage() + ").");
    }
    TestResult testResult;
    if(isCloudAuthenticationConnected)
    {
      testResult = new TestPassed(getName(), "Cloud authentication page is reachable.");
    } else
    {
      testResult = new TestNotPassed(getName(), "Cloud authentication page is not reachable (" + cloudDomainUrl.toString() + ").");
    }
    return testResult;
  }

  private boolean isHttpServerReachable(URL cloudDomainUrl) throws IOException, URISyntaxException {
    String responseBody = mConnectionTestUtils.assertHttpGetRequestResponse(cloudDomainUrl);
    return responseBody.contains("login");
  }

  @Override
  public String getName() {
    return "Cloud authentication page connection test";
  }
}
