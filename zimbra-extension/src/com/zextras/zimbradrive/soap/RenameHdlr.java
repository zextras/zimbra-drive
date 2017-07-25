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

package com.zextras.zimbradrive.soap;


import com.zextras.zimbradrive.ZimbraDriveExtension;
import org.openzal.zal.soap.*;

import java.util.Map;

public class RenameHdlr implements SoapHandler
{
  private static final String COMMAND = "Rename";

  public static final QName QNAME = new QName(COMMAND + "Request", ZimbraDriveExtension.SOAP_NAMESPACE);

  private final MoveHdlr mMoveHdlr;

  RenameHdlr(MoveHdlr moveHdlr)
  {
    mMoveHdlr = moveHdlr;
  }

  @Override
  public void handleRequest(ZimbraContext zimbraContext, SoapResponse soapResponse, ZimbraExceptionContainer zimbraExceptionContainer)
  {
    try
    {
      privateHandleRequest(zimbraContext, soapResponse, zimbraExceptionContainer);
    } catch (Exception exception)
    {
      zimbraExceptionContainer.setException(exception);
    }
  }

  private void privateHandleRequest(ZimbraContext zimbraContext, SoapResponse soapResponse, ZimbraExceptionContainer zimbraExceptionContainer)
  {
    String fileNewName = zimbraContext.getParameter(ZimbraDriveItem.F_NEW_NAME, "");
    String sourcePath = zimbraContext.getParameter(ZimbraDriveItem.F_SOURCE_PATH, "");

    final int startNameIndex = sourcePath.lastIndexOf("/");
    String sourceDirectory;
    if(startNameIndex == -1)
    {
      sourceDirectory = "";
    }
    else
    {
      sourceDirectory = sourcePath.substring(0, startNameIndex + 1);
    }
    String moveTargetPath = sourceDirectory + fileNewName;

    Map<String, String> parameters = zimbraContext.getParameterMap();
    parameters.put(ZimbraDriveItem.F_TARGET_PATH, moveTargetPath);

    ZimbraContext moveZimbraContex = new ZimbraContextSimple(zimbraContext.getTargetAccountId(),
            zimbraContext.getAuthenticatedAccontId(),
            zimbraContext.getRequesterIp(),
            zimbraContext.isDelegatedAuth(),
            parameters);

    mMoveHdlr.handleRequest(moveZimbraContex, soapResponse, zimbraExceptionContainer);
  }

  @Override
  public boolean needsAdminAuthentication(ZimbraContext zimbraContext) {
    return mMoveHdlr.needsAdminAuthentication(zimbraContext);
  }

  @Override
  public boolean needsAuthentication(ZimbraContext zimbraContext) {
    return mMoveHdlr.needsAuthentication(zimbraContext);
  }

}
