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

import java.net.MalformedURLException;
import java.net.URL;

public class CloudHostConnectionConnectionTest implements ConnectionTest {
  final private int connectionTimeout = 5000;
  private final ConnectionTestUtils mConnectionTestUtils;

  public CloudHostConnectionConnectionTest(ConnectionTestUtils connectionTestUtils) {
    mConnectionTestUtils = connectionTestUtils;
  }

  @Override
  public TestResult runOnTarget(URL cloudDomainUrl) {
    boolean isDriveOnCloudDomainReachable;
    try {
      isDriveOnCloudDomainReachable = mConnectionTestUtils.pingHost(cloudDomainUrl, connectionTimeout);
    } catch (MalformedURLException e) {
      return new TestNotPassed(getName(), "Cloud domain is not reachable,  (" + e.getMessage() + ").");
    }
    TestResult testResult;
    if(isDriveOnCloudDomainReachable)
    {
      testResult = new TestPassed(getName(), "Cloud domain is reachable.");
    } else
    {
      testResult = new TestNotPassed(getName(), "Cloud domain is not reachable (" + cloudDomainUrl.toString() + ").");
    }
    return testResult;
  }

  @Override
  public String getName() {
    return "Cloud host connection test";
  }

}
