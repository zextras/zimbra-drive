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

package com.zextras.zimbradrive.soap;


import com.zextras.zimbradrive.CloudUtils;
import org.openzal.zal.soap.QName;
import org.openzal.zal.soap.SoapHandler;
import org.openzal.zal.soap.SoapService;

import java.util.HashMap;
import java.util.Map;

public class NcSoapService implements SoapService
{
  private final Map<QName, SoapHandler> mServiceMap;

  public NcSoapService(final CloudUtils cloudUtils)
  {
    MoveHdlr moveHdlr = new MoveHdlr(cloudUtils);
    mServiceMap = new HashMap<>();
    mServiceMap.put(SearchRequestHdlr.QNAME, new SearchRequestHdlr(cloudUtils));
    mServiceMap.put(GetFolderChildrenHdlr.QNAME, new GetFolderChildrenHdlr(cloudUtils));
    mServiceMap.put(GetAllFoldersHdlr.QNAME, new GetAllFoldersHdlr(cloudUtils));
    mServiceMap.put(DeleteHdlr.QNAME, new DeleteHdlr(cloudUtils));
    mServiceMap.put(MoveHdlr.QNAME, moveHdlr);
    mServiceMap.put(RenameHdlr.QNAME, new RenameHdlr(moveHdlr));
    mServiceMap.put(NewDirectoryHdlr.QNAME, new NewDirectoryHdlr(cloudUtils));
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
