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


package com.zextras.lib;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;

public class ZimbraDrive
{
  public static void main(String[] args)
  {
    try
    {
      StringBuilder infoBuilder = new StringBuilder();
      infoBuilder.append("Zimbra Drive Zimbra Extension")
          .append("\n")
          .append(" Version: ").append(BuildInfo.Version)
          .append("\n")
          .append(" Commit: ").append(BuildInfo.COMMIT)
          .append("\n")
          .append("Zimbra Drive Zimlet")
          .append("\n");

      File zimletVersionFile = new File("/opt/zimbra/zimlets-deployed/com_btactic_drive_open/VERSION");
      if (zimletVersionFile.exists() && zimletVersionFile.canRead())
      {
        BufferedReader reader = new BufferedReader(new FileReader(zimletVersionFile));
        infoBuilder.append(" Version: ").append(reader.readLine())
            .append("\n")
            .append(" Commit: ").append(reader.readLine());
      }
      else
      {
        infoBuilder.append(" Not available.");
      }


      System.out.println(infoBuilder.toString());
    }
    catch (Exception e)
    {
      System.out.println(e.getMessage());
      System.exit(1);
    }

    System.exit(0);
  }
}
