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

import org.openzal.zal.log.ZimbraLog;

import javax.servlet.http.HttpServletRequest;

public class ZimbraDriveLog {
  private static String introductionLog = "ZimbraDrive: ";

  public String getLogIntroduction() {
    return introductionLog;
  }

  public void setLogContext(HttpServletRequest httpServletRequest) {
    String ip = getIp(httpServletRequest);
    ZimbraLog.addIpToContext(ip);
    String userAgent = httpServletRequest.getHeader("User-Agent");
    ZimbraLog.addUserAgentToContext(userAgent);
  }

  private String getIp(HttpServletRequest httpServletRequest) {
    String ip = httpServletRequest.getHeader("X-FORWARDED-FOR");
    if (ip == null)
    {
      ip = httpServletRequest.getRemoteAddr();
    }
    return ip;
  }
}
