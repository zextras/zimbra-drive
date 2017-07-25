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


import com.zextras.zimbradrive.CloudHttpRequestUtils;
import com.zextras.zimbradrive.ZimbraDriveLog;
import org.openzal.zal.soap.QName;
import org.openzal.zal.soap.SoapHandler;
import org.openzal.zal.soap.SoapService;

import java.util.HashMap;
import java.util.Map;

public class NcSoapService implements SoapService
{
  private final Map<QName, SoapHandler> mServiceMap;

  public NcSoapService(final CloudHttpRequestUtils cloudHttpRequestUtils)
  {
    MoveHdlr moveHdlr = new MoveHdlr(cloudHttpRequestUtils);
    mServiceMap = new HashMap<>();
    mServiceMap.put(SearchRequestHdlr.QNAME, new SearchRequestHdlr(cloudHttpRequestUtils));
    mServiceMap.put(GetAllFoldersHdlr.QNAME, new GetAllFoldersHdlr(cloudHttpRequestUtils));
    mServiceMap.put(DeleteHdlr.QNAME, new DeleteHdlr(cloudHttpRequestUtils));
    mServiceMap.put(MoveHdlr.QNAME, moveHdlr);
    mServiceMap.put(RenameHdlr.QNAME, new RenameHdlr(moveHdlr));
    mServiceMap.put(NewDirectoryHdlr.QNAME, new NewDirectoryHdlr(cloudHttpRequestUtils));
  }

  @Override
  public Map<QName, ? extends SoapHandler> getServices()
  {
    return mServiceMap;
  }

  @Override
  public String getServiceName()
  {
    return "SoapServlet";
  }

  @Override
  public boolean isAdminService()
  {
    return false;
  }
}
