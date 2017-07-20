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

import org.openzal.zal.http.HttpHandler;
import org.openzal.zal.log.ZimbraLog;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class ConnectivityTestHttpHandler implements HttpHandler
{

  private ZimbraDriveLog mZimbraDriveLog;

  public ConnectivityTestHttpHandler(ZimbraDriveLog zimbraDriveLog) {
    mZimbraDriveLog = zimbraDriveLog;
  }

  @Override
  public void doGet(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
  {
    throw new RuntimeException();
  }

  @Override
  public void doPost(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse) throws ServletException, IOException
  {
    mZimbraDriveLog.setLogContext(httpServletRequest);
    try
    {
      httpServletResponse.getOutputStream().println("ok");
    } catch (IOException e)
    {
      ZimbraLog.extensions.error(mZimbraDriveLog.getIntroductionLog() + "Unable to print connectivity test page. " + e.getMessage(), e);
    }
    finally
    {
      ZimbraLog.clearContext();
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
    return "ZimbraDrive_ConnectivityTest";
  }

}
