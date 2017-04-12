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

import {ZmOverview} from "../zimbra/zimbraMail/share/view/ZmOverview";
import {DwtTreeItem} from "../zimbra/ajax/dwt/widgets/DwtTreeItem";
import {ZimbraDriveApp} from "../ZimbraDriveApp";
import {ZimbraDriveTreeView} from "./ZimbraDriveTreeView";
import {appCtxt} from "../zimbra/zimbraMail/appCtxt";
import {ZimbraDriveController} from "../ZimbraDriveController";
import {ZmApp} from "../zimbra/zimbraMail/core/ZmApp";

export class ZimbraDriveOverview extends ZmOverview {
  public focus(): DwtTreeItem {
    let zdApp: ZimbraDriveApp = <ZimbraDriveApp> appCtxt.getApp(ZimbraDriveApp.APP_NAME),
      mainController: ZimbraDriveController = zdApp.getZimbraDriveController(ZmApp.MAIN_SESSION);
    let zimbraDriveTreeView: ZimbraDriveTreeView = <ZimbraDriveTreeView> this.getTreeView(ZimbraDriveApp.TREE_ID),
      currentFolderTreeItem: DwtTreeItem = zimbraDriveTreeView.getTreeItemById(mainController.getCurrentFolder().id);
    this.clearSelection();
    this.itemSelected(currentFolderTreeItem);
    zimbraDriveTreeView.setSelection(currentFolderTreeItem, true, false, true);
    return currentFolderTreeItem;
  }
}
