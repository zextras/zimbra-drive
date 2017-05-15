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

import {ZimbraDriveBaseView} from "./ZimbraDriveBaseView";
import {ZimbraDriveItem} from "../ZimbraDriveItem";
import {ZmMimeTable, ZmMimeInfoData} from "../zimbra/zimbraMail/core/ZmMimeTable";
import {AjxStringUtil} from "../zimbra/ajax/util/AjxStringUtil";

export class ZimbraDriveIconView extends ZimbraDriveBaseView {

  public _createItemHtml(item: ZimbraDriveItem): HTMLElement {

    let name: string = item.getName();
    let contentType: string = item.getMimetype();

    if (contentType && contentType.match(/;/)) {
      contentType = contentType.split(";")[0];
    }
    let mimeInfo: ZmMimeInfoData = contentType ? ZmMimeTable.getInfo(contentType) : null;
    let icon: string = ( mimeInfo ? mimeInfo.image : "UnknownDoc_16");

    if (item.isFolder()) {
      icon = "Briefcase_16";
    }
    if (name.length > 27) {
      name = name.substring(0, 24) + "...";
    }

    let div = document.createElement("div");
    div.className = "ZimbraDriveItemSmall";

    let htmlArr: string[] = [];
    let idx: number = 0;

    if (!icon) {
      if (contentType && contentType.match(/;/)) {
        contentType = contentType.split(";")[0];
      }
      mimeInfo = contentType ? ZmMimeTable.getInfo(contentType) : null;
      icon = mimeInfo ? mimeInfo.image : "UnknownDoc" ;
    }

    htmlArr[idx++] = "<table><tr>";
    htmlArr[idx++] = "<td><div class='Img";
    htmlArr[idx++] = icon;
    htmlArr[idx++] = "'></div></td><td nowrap>";
    htmlArr[idx++] = AjxStringUtil.htmlEncode(name);
    htmlArr[idx++] = "</td><tr></table>";

    div.innerHTML = htmlArr.join("");

    this.associateItemWithElement(item, div);
    return div;
  }

}