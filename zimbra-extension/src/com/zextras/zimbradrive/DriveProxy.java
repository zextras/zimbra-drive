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

import org.json.JSONObject;
import org.openzal.zal.Provisioning;
import org.openzal.zal.lib.ZimbraVersion;
import org.openzal.zal.log.ZimbraLog;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;

public class DriveProxy
{

  private static String CONFIG_FILE = "/opt/zimbra/lib/ext/zimbradrive/zimbradrive-extension.conf";
  private static String KEY_DRIVE_DOMAIN = "zimbraDriveOwnCloudURL";

  private final Provisioning mProvisioning;

  public DriveProxy(Provisioning provisioning) {
    mProvisioning = provisioning;
  }

  public String getDriveDomainAssociatedToDomain(String domainName) throws IOException {
    if (ZimbraVersion.current.isAtLeast(8, 7, 6)) {
      return assertDriveDomainAssociatedToDomain(domainName);
    }
    else {
      return getDriveDomainFromConfigurationFile(domainName);
    }
  }

  private String assertDriveDomainAssociatedToDomain(String domainName) throws IOException
  {
    try
    {
      String driveDomain = this.mProvisioning.assertDomainByName(domainName).getAttr(KEY_DRIVE_DOMAIN, "");
      if (driveDomain.isEmpty()) 
      {
        throw new RuntimeException("Domain attribute zimbraDriveOwnCloudURL is empty");
      }
      return driveDomain;
    }
    catch (Exception ex) {
      ZimbraLog.extensions.error("Unable to get Drive Domain", ex);
      throw new RuntimeException(ex);
    }
  }


  private String getDriveDomainFromConfigurationFile(String domain) throws IOException
  {
    JSONObject jsonConf;
    try
    {
      jsonConf = new JSONObject(readFile(CONFIG_FILE, Charset.defaultCharset()));
    } catch (IOException e)
    {
      ZimbraLog.extensions.error("Unable to get Drive Domain", e);
      throw e;
    }
    JSONObject domainMap = jsonConf.getJSONObject("domains");
    return domainMap.getString(domain);
  }

  private static String readFile(String path, Charset encoding) throws IOException
  {
    byte[] encoded;
    try
    {
      encoded = Files.readAllBytes(Paths.get(path));
    } catch (IOException e)
    {
      ZimbraLog.extensions.info("IO exception: error reading file" + path, e);
      throw e;
    }
    return new String(encoded, encoding);
  }
}

