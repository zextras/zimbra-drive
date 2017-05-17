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

import org.json.JSONArray;
import org.json.JSONObject;
import org.openzal.zal.soap.SoapResponse;

public class JsonToSoapUtils {

    public void  appendSoapValueFromDriveResponseFolder(final SoapResponse soapDirectory, final JSONObject jsonDirectory)
    {
        soapDirectory.setValue(ZimbraDriveItem.F_NAME, jsonDirectory.getString(ZimbraDriveItem.F_NAME));
        soapDirectory.setValue(ZimbraDriveItem.F_SHARED, jsonDirectory.getBoolean(ZimbraDriveItem.F_SHARED));
        soapDirectory.setValue(ZimbraDriveItem.F_ID, jsonDirectory.getInt(ZimbraDriveItem.F_ID));
        soapDirectory.setValue(ZimbraDriveItem.F_AUTHOR, jsonDirectory.getString(ZimbraDriveItem.F_AUTHOR));
        soapDirectory.setValue(ZimbraDriveItem.F_PATH, jsonDirectory.getString(ZimbraDriveItem.F_PATH));

        JSONObject driveOnCloudNodePermissions = jsonDirectory.getJSONObject(ZimbraDriveItem.F_PERMISSIONS);
        SoapResponse nodeSoapPermission = soapDirectory.createNode(ZimbraDriveItem.F_PERMISSIONS);
        nodeSoapPermission.setValue(ZimbraDriveItem.F_PERM_READABLE, driveOnCloudNodePermissions.getBoolean(ZimbraDriveItem.F_PERM_READABLE));
        nodeSoapPermission.setValue(ZimbraDriveItem.F_PERM_WRITABLE, driveOnCloudNodePermissions.getBoolean(ZimbraDriveItem.F_PERM_WRITABLE));
        nodeSoapPermission.setValue(ZimbraDriveItem.F_PERM_SHAREABLE, driveOnCloudNodePermissions.getBoolean(ZimbraDriveItem.F_PERM_SHAREABLE));

        JSONArray driveOnCloudNodeChildrenJson = jsonDirectory.getJSONArray(ZimbraDriveItem.F_CHILDREN);

        final int numberOfChildrenDirectory = driveOnCloudNodeChildrenJson.length();
        if (numberOfChildrenDirectory > 0)
        {
            for (int k = 0; k < numberOfChildrenDirectory; k++)
            {
                SoapResponse nodeSoapChildren = soapDirectory.createNode(ZimbraDriveItem.F_CHILDREN);
                JSONObject nodeJsonChildren = driveOnCloudNodeChildrenJson.getJSONObject(k);
                appendSoapValueFromDriveResponseFolder(nodeSoapChildren, nodeJsonChildren);
            }
        }
    }
}
