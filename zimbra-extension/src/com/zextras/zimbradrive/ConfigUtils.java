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

package com.zextras.zimbradrive;

import org.json.JSONObject;
import org.openzal.zal.log.ZimbraLog;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;

public class ConfigUtils
{

  private static String CONFIG_FILE = "/opt/zimbra/lib/ext/zimbradrive/zimbradrive-extension.conf";

  public static String getNcDomain(String domain) throws IOException
  {
    JSONObject jsonConf;
    try
    {
      jsonConf = new JSONObject(readFile(CONFIG_FILE, Charset.defaultCharset()));
    } catch (IOException e)
    {
      ZimbraLog.mailbox.error("IO exception: error reading configFile.", e);
      throw e;
    }
    JSONObject domainMap = jsonConf.getJSONObject("domains");
    return domainMap.getString(domain);
  }

  static String readFile(String path, Charset encoding) throws IOException
  {
    byte[] encoded;
    try
    {
      encoded = Files.readAllBytes(Paths.get(path));
    } catch (IOException e)
    {
      ZimbraLog.mailbox.info("IO exception: error reading file" + path, e);
      throw e;
    }
    return new String(encoded, encoding);
  }

}
