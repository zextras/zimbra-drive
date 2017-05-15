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

package com.zextras.zimbradrive.statustest;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;

public class ZimbraDriveCloudAppConnectionTest implements ConnectionTest {
  private final ConnectionTestUtils mConnectionTestUtils;

  public ZimbraDriveCloudAppConnectionTest(ConnectionTestUtils connectionTestUtils) {
    mConnectionTestUtils = connectionTestUtils;
  }

  @Override
  public TestResult runOnTarget(URL cloudDomainUrl) {
    boolean isCloudAppConnected;
    try {
      isCloudAppConnected = isCloudAppConnected(cloudDomainUrl);
    } catch (IOException | URISyntaxException e) {
      return new TestNotPassed(getName(), "Zimbra Drive app is not reachable, (" + e.getMessage() + ").");
    }
    if(isCloudAppConnected)
    {
      return new TestPassed(getName(), "Zimbra Drive app is reachable.");
    } else
    {
      return new TestNotPassed(getName(), "Zimbra Drive app is not reachable.");
    }
  }

  private boolean isCloudAppConnected(URL cloudDomainUrl) throws IOException, URISyntaxException {
    final URL cloudAppSearchUrl  = new URL(cloudDomainUrl.toString() + "/apps/zimbradrive/test/ConnectivityTest");
    final String responseBody = mConnectionTestUtils.assertHttpGetRequestResponse(cloudAppSearchUrl);
    return responseBody.equals("OK");
  }

  @Override
  public String getName() {
    return "Zimbra Drive Cloud App connection test";
  }
}
