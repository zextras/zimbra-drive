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

import {ZmChooseFolderDialog} from "../zimbra/zimbraMail/share/view/dialog/ZmChooseFolderDialog";
import {DwtTreeItem} from "../zimbra/ajax/dwt/widgets/DwtTreeItem";
import {ZimbraDriveFolderTree} from "../ZimbraDriveFolderTree";
import {ZimbraDriveTreeController} from "../ZimbraDriveTreeController";
import {DwtControl} from "../zimbra/ajax/dwt/widgets/DwtControl";
import {ZimbraDriveApp} from "../ZimbraDriveApp";
import {ZimbraDriveFolderItem} from "../ZimbraDriveFolderItem";
import {ZmTreeView} from "../zimbra/zimbraMail/share/view/ZmTreeView";
import {Dwt} from "../zimbra/ajax/dwt/core/Dwt";
import {ZmOrganizer} from "../zimbra/zimbraMail/share/model/ZmOrganizer";
import {ZimbraDriveFolder} from "../ZimbraDriveFolder";
import {ZmOverview} from "../zimbra/zimbraMail/share/view/ZmOverview";
import {appCtxt} from "../zimbra/zimbraMail/appCtxt";
import {AjxTemplate} from "../zimbra/ajax/boot/AjxTemplate";
import {DwtEvent} from "../zimbra/ajax/dwt/events/DwtEvent";
import {AjxListener} from "../zimbra/ajax/events/AjxListener";
import {ZmMsg} from "../zimbra/zimbraMail/ZmMsg";

export class ZimbraDriveChooseFolderDialog extends ZmChooseFolderDialog {

  private _treeController: ZimbraDriveTreeController;
  private _actionedItem: DwtTreeItem|ZimbraDriveFolderItem;
  private _accountId: string;

  constructor(parent: DwtControl, className: string, treeController: ZimbraDriveTreeController) {
    super(parent, className);
    this._treeController = treeController;
    this._getNewButton().removeAllListeners(DwtEvent.SELECTION);
    this._getNewButton().addSelectionListener(
      new AjxListener(
        this,
        this.newFolderListener
      )
    );
  }

  public _resetTree(treeIds: string[], overview: ZmOverview): void {
    let account = overview.account || appCtxt.getActiveAccount() || appCtxt.accountList.mainAccount;
    this._accountId = account.id;
    let folderTree: ZimbraDriveFolderTree = <ZimbraDriveFolderTree> this._treeController.getDataTree(),
      acctTreeView: {[treeViewId: string]: ZmTreeView} = this._treeView[this._accountId]  = {};
    acctTreeView[ZimbraDriveApp.TREE_ID] = this._treeController._treeView[ZimbraDriveApp.TREE_ID];

    let headerItem = acctTreeView[ZimbraDriveApp.TREE_ID].getHeaderItem();
    headerItem.setVisible(false, true);

    let ti: DwtTreeItem = acctTreeView[ZimbraDriveApp.TREE_ID].getTreeItemById(folderTree.root.id);
    ti.setExpanded(true);
    acctTreeView[ZimbraDriveApp.TREE_ID].removeSelectionListener(this._treeViewListener);
    acctTreeView[ZimbraDriveApp.TREE_ID].addSelectionListener(this._treeViewListener);

    folderTree.removeChangeListener(this._changeListener);
    folderTree.addChangeListener(this._changeListener);

    this._loadFolders();
    this._resetTreeView(true);
    this._inputField.setVisible(false);
  }

  public _loadFolders(): void {
    this._folders = [];
    let treeView: ZmTreeView = this._treeController._treeView[ZimbraDriveApp.TREE_ID];
    let items: DwtTreeItem[] = <DwtTreeItem[]> treeView.getTreeItemList();
    for (let ti of items) {
      let folder: ZimbraDriveFolder = <ZimbraDriveFolder> ti.getData(Dwt.KEY_OBJECT);
      if (!folder || folder.nId === ZmOrganizer.ID_ROOT) {
        continue;
      }
      let name = folder.getName();
      let path = folder.getPath();
      this._folders.push({id: folder.id, type: ZimbraDriveApp.TREE_ID, name: name, path: path, accountId: this._accountId});
    }
  }

  public setActionedItem(actionedItem: DwtTreeItem|ZimbraDriveFolderItem): void {
    this._actionedItem = actionedItem;
  }

  public getActionedItem(): DwtTreeItem|ZimbraDriveFolderItem {
    return this._actionedItem;
  }

  public _contentHtml(): string {
    this._inputDivId = this._htmlElId + "_inputDivId";
    this._folderDescDivId = this._htmlElId + "_folderDescDivId";
    this._folderTreeDivId = this._htmlElId + "_folderTreeDivId";

    return AjxTemplate.expand("com_zextras_drive_open.ZimbraDrive#ChooseFolderDialog", {id: this._htmlElId});
  }

  private newFolderListener(): void {
    let targetFolder: ZimbraDriveFolder = <ZimbraDriveFolder> this._getOverview().getSelected();
    if (!targetFolder) {
      this._showError(ZmMsg.noTargetFolder);
    }
    else {
      this._treeController.popupNewFolderDialog(targetFolder);
    }
  }
}
