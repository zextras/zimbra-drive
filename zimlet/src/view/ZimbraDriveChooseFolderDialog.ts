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

import {ZmChooseFolderDialog} from "../zimbra/zimbraMail/share/view/dialog/ZmChooseFolderDialog";
import {DwtTreeItem} from "../zimbra/ajax/dwt/widgets/DwtTreeItem";
import {ZimbraDriveFolderItem} from "../ZimbraDriveFolderItem";
import {AjxTemplate} from "../zimbra/ajax/boot/AjxTemplate";
import {ZimbraDriveFolder} from "../ZimbraDriveFolder";
import {ZmMsg} from "../zimbra/zimbraMail/ZmMsg";
import {ZimbraDriveTreeController} from "../ZimbraDriveTreeController";
import {AjxListener} from "../zimbra/ajax/events/AjxListener";
import {DwtEvent} from "../zimbra/ajax/dwt/events/DwtEvent";
import {DwtControl} from "../zimbra/ajax/dwt/widgets/DwtControl";

export class ZimbraDriveChooseFolderDialog extends ZmChooseFolderDialog {

  private _treeController: ZimbraDriveTreeController;
  private _actionedItem: DwtTreeItem|ZimbraDriveFolderItem;

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

  public setActionedFolder(actionedItem: DwtTreeItem|ZimbraDriveFolderItem): void {
    this._actionedItem = actionedItem;
  }

  public getActionedFolder(): DwtTreeItem|ZimbraDriveFolderItem {
    return this._actionedItem;
  }

  public _contentHtml(): string {
    this._inputDivId = this._htmlElId + "_inputDivId";
    this._folderDescDivId = this._htmlElId + "_folderDescDivId";
    this._folderTreeDivId = this._htmlElId + "_folderTreeDivId";

    return AjxTemplate.expand("com_btactic_drive_open.ZimbraDrive#ChooseFolderDialog", {id: this._htmlElId});
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
