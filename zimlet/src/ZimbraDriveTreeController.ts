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

import {ZimbraDriveApp} from "./ZimbraDriveApp";
import {ZmTreeView, ZmTreeViewParams} from "./zimbra/zimbraMail/share/view/ZmTreeView";
import {ZimbraDriveTreeView} from "./view/ZimbraDriveTreeView";
import {ZmTreeControllerShowParams, ZmTreeController} from "./zimbra/zimbraMail/share/controller/ZmTreeController";
import {ZmFolder} from "./zimbra/zimbraMail/share/model/ZmFolder";
import {ZmDragAndDrop} from "./zimbra/zimbraMail/share/view/ZmDragAndDrop";
import {ZimbraDriveFolder} from "./ZimbraDriveFolder";
import {appCtxt} from "./zimbra/zimbraMail/appCtxt";
import {ZmBatchCommand} from "./zimbra/zimbra/csfe/ZmBatchCommand";
import {AjxCallback} from "./zimbra/ajax/boot/AjxCallback";
import {ZmOperation} from "./zimbra/zimbraMail/core/ZmOperation";
import {AjxListener} from "./zimbra/ajax/events/AjxListener";
import {DwtSelectionEvent} from "./zimbra/ajax/dwt/events/DwtSelectionEvent";
import {ZmZimbraMail} from "./zimbra/zimbraMail/core/ZmZimbraMail";
import {Dwt} from "./zimbra/ajax/dwt/core/Dwt";
import {DwtTreeItem} from "./zimbra/ajax/dwt/widgets/DwtTreeItem";
import {DwtUiEvent} from "./zimbra/ajax/dwt/events/DwtUiEvent";
import {ZmController} from "./zimbra/zimbraMail/share/controller/ZmController";
import {DwtDialog} from "./zimbra/ajax/dwt/widgets/DwtDialog";
import {AjxSoapDoc} from "./zimbra/ajax/soap/AjxSoapDoc";
import {ZimbraDriveItem} from "./ZimbraDriveItem";
import {ZmRenameFolderDialog} from "./zimbra/zimbraMail/share/view/dialog/ZmRenameFolderDialog";
import {ZimbraDriveFolderItem} from "./ZimbraDriveFolderItem";
import {ZmMsg} from "./zimbra/zimbraMail/ZmMsg";
import {ZimbraDriveNewFolderDialog} from "./view/ZimbraDriveNewFolderDialog";
import {ZmCsfeResult} from "./zimbra/zimbra/csfe/ZmCsfeResult";
import {DwtDropEvent} from "./zimbra/ajax/dwt/dnd/DwtDropEvent";
import {ZimbraDriveController} from "./ZimbraDriveController";
import {ZDId} from "./ZDId";
import {AjxMessageFormat} from "./zimbra/ajax/util/AjxText";
import {AjxStringUtil} from "./zimbra/ajax/util/AjxStringUtil";
import {PreviewPaneView} from "./view/PreviewPaneView";
import {DwtTree} from "./zimbra/ajax/dwt/widgets/DwtTree";
import {ZimbraDriveChooseFolderDialog} from "./view/ZimbraDriveChooseFolderDialog";
import {ZmFolderSearchFilterGetMoveParamsValue} from "./zimbra/zimbraMail/share/view/ZmSearchResultsFilterPanel";
import {ZmOverview} from "./zimbra/zimbraMail/share/view/ZmOverview";
import {DwtHeaderTreeItem} from "./zimbra/ajax/dwt/widgets/DwtHeaderTreeItem";
import {AjxImg} from "./zimbra/ajax/core/AjxImg";
import {ZmStatusView} from "./zimbra/zimbraMail/share/view/ZmStatusView";
import {ZmCsfeException} from "./zimbra/zimbra/csfe/ZmCsfeException";
import {ZimbraDriveFolderTree} from "./ZimbraDriveFolderTree";

export class ZimbraDriveTreeController extends ZmTreeController {

  private _dnd: ZmDragAndDrop;
  private _pendingActionData: ZimbraDriveFolder;
  private _renameCb: AjxCallback;
  private _newFolderDialog: ZimbraDriveNewFolderDialog;
  private _currentFolder: ZimbraDriveFolder;
  private _moveToDialog: ZimbraDriveChooseFolderDialog;

  constructor(type: string) {
    super(type || ZimbraDriveApp.APP_NAME);
    this._listeners[ZDId.ZD_NEW_FILE]   = new AjxListener(this, this._uploadListener);
    this._listeners[ZDId.ZD_SAVE_FOLDER]   = new AjxListener(this, this._downloadListener);
    this._listeners[ZDId.ZD_NEW_FOLDER] = new AjxListener(this, this._newListener);
    this._listeners[ZmOperation.RENAME_FOLDER] = new AjxListener(this, this._renameListener);
  }

  public _createTreeView(params: ZmTreeViewParams): ZmTreeView {
    return new ZimbraDriveTreeView(params);
  }

  public show(params: ZmTreeControllerShowParams): ZmTreeView {
    params.include = {};
    params.include[ZmFolder.ID_TRASH] = false;
    params.showUnread = false;
    // params.forceCreate = true;
    this._dataTree[appCtxt.getActiveAccount().id] = undefined;
    let treeView: ZmTreeView = super.show(params),
      headerItem: DwtHeaderTreeItem = treeView.getHeaderItem();
    headerItem.getChildren()[0].setExpanded(true);
    headerItem.enableSelection(false);
    headerItem.enableAction(false);
    AjxImg.setImage(headerItem._nodeCell);
    treeView._controller = this;
    // Finder to BriefcaseTreeView drag and drop
    this._initDragAndDrop(treeView);

    this._treeView[ZimbraDriveApp.TREE_ID] = treeView;
    return this._treeView[ZimbraDriveApp.TREE_ID];
  }

  public _initDragAndDrop(treeView: ZmTreeView) {
    this._dnd = new ZmDragAndDrop(treeView);
  }

  public _itemClicked(folder: ZimbraDriveFolder) {
    ZimbraDriveController.goToFolder(folder.getPath(true));
  }

  public _getActionMenuOps(): string[] {
    return [
      ZDId.ZD_NEW_FILE,
      ZDId.ZD_NEW_FOLDER,
      ZmOperation.SEP,
      ZDId.ZD_SAVE_FOLDER,
      ZmOperation.SEP,
      ZmOperation.DELETE_WITHOUT_SHORTCUT,
      ZmOperation.MOVE,
      ZmOperation.RENAME_FOLDER
    ];
  }

  public getCurrentFolder(): ZimbraDriveFolder {
    return this._currentFolder;
  }

  public setCurrentFolder(folder: ZimbraDriveFolder): void {
    this._currentFolder = folder;
  }

  /**************
   ** Listeners *
   **************/
  // Upload in actioned folder
  private _uploadListener(ev: DwtSelectionEvent) {
    let folder: ZimbraDriveFolder = <ZimbraDriveFolder> this._getActionMenu(ev, ev.item).getData(Dwt.KEY_OBJECT);
    (<ZimbraDriveController> appCtxt.getCurrentController())._uploadFileListener(ev, folder);
  }

  // Download Folder
  private _downloadListener(ev: DwtSelectionEvent) {
    let folder: ZimbraDriveFolder = <ZimbraDriveFolder> this._getActionMenu(ev, ev.item).getData(Dwt.KEY_OBJECT);
    this.downloadFolderAsZip(folder.getPath(true));
  }

  public downloadFolderAsZip(folderPath: string) {
    let url: string = `${ZimbraDriveApp.DOWNLOAD_URL}${folderPath}`;
    ZmZimbraMail.unloadHackCallback();
    location.href = url;
  }

  // New Folder
  public _newListener(ev: DwtSelectionEvent) {
    let folder: ZimbraDriveFolder = <ZimbraDriveFolder> this._getActionMenu(ev, ev.item).getData(Dwt.KEY_OBJECT);
    this.popupNewFolderDialog(folder);
  }

  public popupNewFolderDialog(folder: ZimbraDriveFolder): void {
    if (!this._newFolderDialog) {
      this._newFolderDialog = new ZimbraDriveNewFolderDialog(appCtxt.getShell(), undefined, ZmMsg.createNewFolder, ZimbraDriveApp.APP_NAME);
      this._newFolderDialog.registerCallback(DwtDialog.OK_BUTTON, this.newFolderCallback, this);
    }
    this._newFolderDialog.setFolder(folder);
    this._newFolderDialog.popup(folder);
  }

  public newFolderCallback(dialogParams: {name: string}): void {
    this._newFolderDialog.popdown();
    let soapDoc = AjxSoapDoc.create("NewDirectoryRequest", "urn:zimbraDrive");
    soapDoc.set(ZDId.F_NEW_NAME, dialogParams.name);
    soapDoc.set(ZDId.F_PATH, this._newFolderDialog.getFolder().getPath(true) + dialogParams.name);
    (<ZmZimbraMail>appCtxt.getAppController()).sendRequest({
      soapDoc: soapDoc,
      asyncMode: true,
      callback: new AjxCallback(this, this.setNewFolder, [this._newFolderDialog.getFolder(), dialogParams.name]),
      errorCallback: new AjxCallback(this, this._newFolderDialog.popdown, [])
    });
  }

  public setNewFolder(parentFolder: ZimbraDriveFolder, newFolderName: string, result: ZmCsfeResult): void {
    let parentNode: DwtTreeItem = this._treeView["ZIMBRA_DRIVE"].getTreeItemById(parentFolder.id),
      newFolder: ZimbraDriveFolder = new ZimbraDriveFolder();
    parentFolder.children.add(newFolder);
    newFolder.parent = parentFolder;
    newFolder.name = newFolderName;
    newFolder.id = `${(result.getResponse()[ZimbraDriveApp.NEW_DIRECTORY_RESP])[ZDId.F_NEW_FOLDER][0].id}_zd`;
    newFolder.resetPath();
    this._treeView[ZimbraDriveApp.TREE_ID]._addNew(parentNode, newFolder, parentFolder.findIndexForNewChild(newFolderName));
    // send batch command due to refresh view
    if (parentFolder.getPath() === ZimbraDriveController.getCurrentFolder().getPath()) {
      let batchCommand = new ZmBatchCommand();
      batchCommand.add(new AjxCallback(null, ZimbraDriveApp.loadSearchRequestParams, [`in:"${ZimbraDriveController.getCurrentFolder().getPath(true)}"`, false]));
      batchCommand.run();
    }
    this._newFolderDialog.popdown();
  }

  // Rename folder
  public renameFolderItemListener(ev: DwtUiEvent, item: ZimbraDriveFolderItem): void {
    let backupActionData: ZmFolder = this._actionedOrganizer;
    this._actionedOrganizer = (<ZimbraDriveFolderTree> appCtxt.getTree(ZimbraDriveApp.APP_NAME)).getFolderById(item.id);
    this._renameListener(ev);
    this._actionedOrganizer = backupActionData;
  }

  public _renameListener(ev: DwtUiEvent): void {
    this._pendingActionData = <ZimbraDriveFolder> this._getActionedOrganizer(ev);
    let renameDialog: ZmRenameFolderDialog = appCtxt.getRenameFolderDialog();
    if (!this._renameCb) {
      this._renameCb = new AjxCallback(this, this._sendRenameRequest, [renameDialog]);
    }
    ZmController.showDialog(renameDialog, this._renameCb, this._pendingActionData);
    renameDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, renameDialog);
    renameDialog._getInputFields()[0].focus();
  }

  public _sendRenameRequest(renameDialog: ZmRenameFolderDialog, folder: ZimbraDriveFolder, newFolderName: string): void {
    renameDialog.popdown();
    let soapDoc = AjxSoapDoc.create("RenameRequest", "urn:zimbraDrive");
    soapDoc.set(ZDId.F_NEW_NAME, newFolderName);
    soapDoc.set(ZDId.F_SOURCE_PATH, folder.getPath());
    (<ZmZimbraMail>appCtxt.getAppController()).sendRequest({
      soapDoc: soapDoc,
      asyncMode: true,
      callback: new AjxCallback(this, this._renameFolderCallback, [renameDialog, newFolderName, folder]),
      errorCallback: new AjxCallback(this, this._renameFolderErrorCallback, [renameDialog, newFolderName])
    });
  }

  public _renameFolderCallback(renameDialog: ZmRenameFolderDialog, newFolderName: string, folder: ZimbraDriveFolder): boolean {
    if (this._treeView["ZIMBRA_DRIVE"] && this._treeView["ZIMBRA_DRIVE"].getTreeItemById) {
      this._treeView["ZIMBRA_DRIVE"].getTreeItemById(folder.id).setText(newFolderName);
    }
    folder.name = newFolderName;
    folder.resetPath();
    // set folder item name if exists
    let currentViewFolderItem: ZimbraDriveItem = <ZimbraDriveItem> (<PreviewPaneView> appCtxt.getCurrentView()).getListView().getItemList().getById(folder.id);
    if (currentViewFolderItem && currentViewFolderItem.getNameElId && currentViewFolderItem.getNameElId()) {
      document.getElementById(currentViewFolderItem.getNameElId()).textContent = newFolderName;
    }
    this._clearDialog(renameDialog);
    let msg: string = ZimbraDriveApp.getMessage("successfulRename"),
      level: number = ZmStatusView.LEVEL_INFO;
    appCtxt.setStatusMsg({msg: msg, level: level});
    return true;
  }

  public _renameFolderErrorCallback(renameDialog: ZmRenameFolderDialog, newFolderName: string, exception: ZmCsfeException): boolean {
    // TODO manage error
    this._clearDialog(renameDialog);
    let exceptionMessage = exception.msg;
    let msg: string = ZimbraDriveApp.getMessage("errorServer"),
      level: number = ZmStatusView.LEVEL_CRITICAL;
    if (exceptionMessage.substring(exceptionMessage.length - 3) === "405") {
      msg = ZimbraDriveApp.getMessage("errorRenameFile", [newFolderName]);
    }
    appCtxt.setStatusMsg({msg: msg, level: level});
    return true;
  }

  // Action menu
  public _treeViewListener(ev: DwtUiEvent): void {
    super._treeViewListener(ev);
    if ((<DwtSelectionEvent>ev).detail === DwtTree.ITEM_ACTIONED) {
      let itemActioned: any = (<DwtSelectionEvent>ev).item;
      let folder: ZimbraDriveFolder = itemActioned.getData(Dwt.KEY_OBJECT);
      this._getActionMenu(ev, folder).setData(ZDId.ZIMBRADRIVE_ITEM_ACTIONED, itemActioned);
      this._getActionMenu(ev, folder).setData(Dwt.KEY_OBJECT, folder);
    }
  }

  // Drop Folder Listener
  public _dropListener(ev: DwtDropEvent): void {
    let dropFolder = ev.targetControl.getData(Dwt.KEY_OBJECT);
    let data = ev.srcData.data;
    if (ev.action === DwtDropEvent.DRAG_DROP) {
      let items = (data instanceof Array) ? data : [data];
      ZimbraDriveController.doMove(items, dropFolder);
    }
  }

  // Move Folder Listener
  public _moveListener(ev: DwtSelectionEvent): void {
    this._pendingActionData = <ZimbraDriveFolder> this._getActionedOrganizer(ev);
    this._moveToDialog = this.getChooseFolderDialog();
    this._moveToDialog.setActionedItem(this._getActionMenu(ev, ev.item).getData(ZDId.ZIMBRADRIVE_ITEM_ACTIONED));

    let moveParams: ZmFolderSearchFilterGetMoveParamsValue = this._getMoveParams(this._moveToDialog);
    let moveDialogOverview: ZmOverview = appCtxt.getOverviewController().getOverview(moveParams.overviewId);
    if (moveDialogOverview) {
      moveDialogOverview.setTreeView("ZIMBRA_DRIVE");
    }
    moveParams.hideNewButton = true;
    ZmController.showDialog(this._moveToDialog, new AjxCallback(this, this._moveCallback), moveParams);
    this._moveToDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, this._moveToDialog);
  }

  /** Used by
   *  @see ZmTreeController._moveCallback */
  public _doMove(movingFolder: ZimbraDriveFolder, targetFolder: ZimbraDriveFolder): void {
    if (this._moveToDialog.getActionedItem().isDwtTreeItem) {
      ZimbraDriveController.doMove([movingFolder], targetFolder);
    }
    else {
      ZimbraDriveController.doMove((<ZimbraDriveController> appCtxt.getCurrentController()).getSelectedItems(), targetFolder);
    }
    this._moveToDialog.popdown();
  }

  public getChooseFolderDialog(): ZimbraDriveChooseFolderDialog {
    if (!this._moveToDialog) {
      this._moveToDialog = new ZimbraDriveChooseFolderDialog(appCtxt.getShell(), null, this);
    }
    return this._moveToDialog;
  }

  // Delete Folder Listener
  private _deleteListener(ev: DwtSelectionEvent): void {
    let items: (ZimbraDriveFolder|ZimbraDriveItem)[];
    let folder: ZimbraDriveFolder = <ZimbraDriveFolder> this._getActionMenu(ev, ev.item).getData(Dwt.KEY_OBJECT),
      itemActioned: DwtTreeItem|ZimbraDriveFolderItem = this._getActionMenu(ev, ev.item).getData(ZDId.ZIMBRADRIVE_ITEM_ACTIONED);
    if ((<DwtTreeItem>itemActioned).isDwtTreeItem) {
      if (folder.getPath() === "") {
        appCtxt.setStatusMsg({
          msg: ZimbraDriveApp.getMessage("errorDeletingRootFolder"),
          level: ZmStatusView.LEVEL_WARNING
        });
        return;
      }
      items = [folder];
    }
    else {
      items = (<ZimbraDriveController> appCtxt.getCurrentController()).getSelectedItems();
    }
    if (items.length < 1) { return; }
    // TODO: These are not really deleted, are moved into the *Cloud trash
    let message: string;
    if (items.length > 1) {
      message = ZmMsg.confirmPermanentDeleteItemList;
    } else {
      let delMsgFormatter = new AjxMessageFormat(ZmMsg.confirmPermanentDeleteItem);
      message = delMsgFormatter.format(AjxStringUtil.htmlEncode(items[0].getName()));
    }
    let dialog = appCtxt.getConfirmationDialog();
    dialog.popup(message, new AjxCallback(this, this._doDeleteItems, [items, itemActioned]));
  }

  private _doDeleteItems(items: any[], itemActioned: DwtTreeItem|ZimbraDriveFolderItem): void {
    const paths: string[] = [];
    for (let item of items) {
      paths.push(item.getPath());
    }
    let soapDoc = AjxSoapDoc.create("DeleteRequest", "urn:zimbraDrive");
    soapDoc.set(ZDId.F_PATH, JSON.stringify(paths));
    (<ZmZimbraMail>appCtxt.getAppController()).sendRequest({
      soapDoc: soapDoc,
      asyncMode: true,
      callback: new AjxCallback(this, this._onDeleteDone, [items, itemActioned])
    });
  }


  private _onDeleteDone(items: (ZimbraDriveFolder|ZimbraDriveItem)[], itemActioned: DwtTreeItem|ZimbraDriveFolderItem): void {
    if ((<DwtTreeItem>itemActioned).isDwtTreeItem) {
      let queryPath: string = this._currentFolder.getPath(true);
      // eliminated folder that contains currentfolder then reset view to root
      if (items[0].containsTargetPath(this._currentFolder.getPath(true))) {
        queryPath = "/";
      }
      ZimbraDriveController.goToFolder(queryPath);
    }
    else {
      let controller: ZimbraDriveController = <ZimbraDriveController> appCtxt.getCurrentController();
      for (let item of items) {
        if (item.isFolder()) {
          this._treeView["ZIMBRA_DRIVE"].getTreeItemById(item.id).dispose();
        }
        controller.getViewMgr().getListView().removeItem(item);
      }
      controller.getViewMgr().getPreviewView().enablePreview(false);
    }
  }

  public _setupOptButton(params: ZmTreeControllerShowParams): void {
    params.optButton = null;
  }
}
