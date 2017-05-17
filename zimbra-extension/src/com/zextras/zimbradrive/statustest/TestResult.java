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

public class TestResult {
  final private boolean mIsPassed;
  final private String mTestName;
  final private String mMessage;

  public TestResult(String testName, boolean isPassed, String message)
  {
    mIsPassed = isPassed;
    mTestName = testName;
    mMessage = message;
  }

  public boolean isPassed()
  {
    return mIsPassed;
  }

  public String getTestName()
  {
    return mTestName;
  }

  public String getMessage()
  {
    return mMessage;
  }
}
