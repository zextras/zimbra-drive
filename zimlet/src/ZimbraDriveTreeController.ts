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
import {ZimbraDriveFolder, ZimbraDriveFolderObj} from "./ZimbraDriveFolder";
import {appCtxt} from "./zimbra/zimbraMail/appCtxt";
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
import {ZmStatusView} from "./zimbra/zimbraMail/share/view/ZmStatusView";
import {ZmCsfeException} from "./zimbra/zimbra/csfe/ZmCsfeException";
import {ZimbraDriveFolderTree} from "./ZimbraDriveFolderTree";
import {ZmFolderTreeController} from "./zimbra/zimbraMail/share/controller/ZmFolderTreeController";
import {ZmOrganizer} from "./zimbra/zimbraMail/share/model/ZmOrganizer";
import {DwtHeaderTreeItem} from "./zimbra/ajax/dwt/widgets/DwtHeaderTreeItem";
import {DwtMenu} from "./zimbra/ajax/dwt/widgets/DwtMenu";
import {AjxImg} from "./zimbra/ajax/core/AjxImg";
import {ZmApp} from "./zimbra/zimbraMail/core/ZmApp";

export class ZimbraDriveTreeController extends ZmFolderTreeController {

  private _dnd: ZmDragAndDrop;
  private _pendingActionData: ZimbraDriveFolder;
  private _newFolderDialog: ZimbraDriveNewFolderDialog;
  private _moveToDialog: ZimbraDriveChooseFolderDialog;

  constructor(type: string) {
    super(type || ZDId.ZIMBRADRIVE_ITEM);
    this._listeners[ZDId.ZD_NEW_FILE]   = new AjxListener(this, this._uploadListener);
    this._listeners[ZDId.ZD_SAVE_FOLDER]   = new AjxListener(this, this._downloadListener);
    this._listeners[ZDId.ZD_NEW_FOLDER] = new AjxListener(this, this._newListener);
    this._listeners[ZmOperation.RENAME_FOLDER] = new AjxListener(this, this._renameListener);
  }

  // No more used. Left in code due to reference
  public _createTreeView(params: ZmTreeViewParams): ZmTreeView {
    return new ZimbraDriveTreeView(params);
  }

  public show(params: ZmTreeControllerShowParams): ZmTreeView {
    params.include = {};
    params.include[ZmFolder.ID_TRASH] = false;
    params.showUnread = false;

    let treeView: ZmTreeView = super.show(params),
      headerItem: DwtHeaderTreeItem = treeView.getHeaderItem();

    treeView._controller = this;
    this._initDragAndDrop(treeView);
    if (headerItem.getChildren().length > 0) {
      headerItem.getChildren()[0].setExpanded(true);
    }
    headerItem.enableSelection(false);
    headerItem.enableAction(false);
    AjxImg.setImage(headerItem._nodeCell);

    return treeView;
  }

  public _initDragAndDrop(treeView: ZmTreeView) {
    this._dnd = new ZmDragAndDrop(treeView);
  }

  public _itemClicked(folder: ZimbraDriveFolder) {
    let zdApp: ZimbraDriveApp = <ZimbraDriveApp> appCtxt.getApp(ZimbraDriveApp.APP_NAME),
      mainController: ZimbraDriveController = zdApp.getZimbraDriveController(ZmApp.MAIN_SESSION);
    if (!mainController.getCurrentFolder() || mainController.getCurrentFolder().getPath(true) !== folder.getPath(true)) {
      ZimbraDriveController.goToFolder(folder.getPath(true), false);
    }
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
      this._newFolderDialog.registerCallback(DwtDialog.OK_BUTTON, this._sendNewFolderRequest, this);
    }
    this._newFolderDialog.setFolder(folder);
    this._newFolderDialog.popup(folder);
  }

  private _sendNewFolderRequest(dialogParams: {name: string}): void {
    this._newFolderDialog.popdown();
    let soapDoc = AjxSoapDoc.create("NewDirectoryRequest", "urn:zimbraDrive");
    soapDoc.set(ZDId.F_NEW_NAME, dialogParams.name);
    soapDoc.set(ZDId.F_PATH, this._newFolderDialog.getFolder().getPath(true) + dialogParams.name);
    (<ZmZimbraMail>appCtxt.getAppController()).sendRequest({
      soapDoc: soapDoc,
      asyncMode: true,
      callback: new AjxCallback(this, this._newFolderCallback, [this._newFolderDialog.getFolder()]),
      errorCallback: new AjxCallback(this, this._newFolderDialog.popdown, [])
    });
  }

  private _newFolderCallback(parentFolder: ZimbraDriveFolder, result: ZmCsfeResult): void {
    let newFolder: ZimbraDriveFolder = new ZimbraDriveFolder();
    let currentController: ZimbraDriveController = <ZimbraDriveController>appCtxt.getCurrentController();
    let mainController: ZimbraDriveController =
      (<ZimbraDriveApp> appCtxt.getApp(ZimbraDriveApp.APP_NAME)).getZimbraDriveController(ZmApp.MAIN_SESSION);
    newFolder.parent = parentFolder;
    newFolder._loadFromDom(
      <ZimbraDriveFolderObj>(result.getResponse()[ZimbraDriveApp.NEW_DIRECTORY_RESP])[ZDId.F_NEW_FOLDER][0],
      appCtxt.getTree(ZmOrganizer.FOLDER)
    );
    parentFolder.children.add(newFolder);
    newFolder._notify("CREATE");
    if (!currentController.isSearchResults) {
      if (currentController.getCurrentFolder() && currentController.getCurrentFolder().getPath() === parentFolder.getPath()) {
        ZimbraDriveController.addItemToCurrentList(newFolder.getFolderItem());
      }
    }
    else {
      currentController.refreshList(false);
    }
  }

  // Rename folder
  public renameFolderItemListener(ev: DwtUiEvent, item: ZimbraDriveFolderItem): void {
    let backupActionData: ZmFolder = this._actionedOrganizer;
    this._actionedOrganizer = <ZimbraDriveFolder> appCtxt.getTree(ZmOrganizer.FOLDER).root.getById(item.id);
    // this._actionedOrganizer = (<ZimbraDriveFolderTree> appCtxt.getTree(ZmOrganizer.FOLDER)).getFolderById(item.id);
    this._renameListener(ev);
    this._actionedOrganizer = backupActionData;
  }

  public _renameListener(ev: DwtUiEvent): void {
    this._pendingActionData = <ZimbraDriveFolder> this._getActionedOrganizer(ev);
    let renameDialog: ZmRenameFolderDialog = appCtxt.getRenameFolderDialog();
    ZmController.showDialog(
      renameDialog,
      new AjxCallback(this, this._sendRenameRequest, [renameDialog]),
      this._pendingActionData
    );
    renameDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, renameDialog);
    renameDialog._getInputFields()[0].focus();
  }

  private _sendRenameRequest(renameDialog: ZmRenameFolderDialog, folder: ZimbraDriveFolder, newFolderName: string): void {
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
    folder.notifyModify({name: newFolderName, id: folder.id});
    let mainController: ZimbraDriveController = (<ZimbraDriveApp> appCtxt.getApp(ZimbraDriveApp.APP_NAME)).getZimbraDriveController(ZmApp.MAIN_SESSION);
    // if ((<ZimbraDriveController>appCtxt.getCurrentController()).getCurrentFolder().containsTargetPath(folder.getParentPath())) {
    if (mainController.getCurrentFolder().containsTargetPath(folder.getParentPath())) {
      mainController.refreshList(true);
    }

    else {
      // set folder item name if exists
      let currentViewFolderItem: ZimbraDriveItem = <ZimbraDriveItem> (<PreviewPaneView> appCtxt.getCurrentView()).getListView().getItemList().getById(folder.id);
      if (currentViewFolderItem && currentViewFolderItem.getNameElId && currentViewFolderItem.getNameElId()) {
        document.getElementById(currentViewFolderItem.getNameElId()).textContent = newFolderName;
      }
    }
    this._clearDialog(renameDialog);
    let msg: string = ZimbraDriveApp.getMessage("successfulRename"),
      level: number = ZmStatusView.LEVEL_INFO;
    appCtxt.setStatusMsg({msg: msg, level: level});
    ZimbraDriveController.sortCurrentList();
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
    if (!this._actionMenu) {
      this._initializeActionMenus();
    }
    if ((<DwtSelectionEvent>ev).detail === DwtTree.ITEM_ACTIONED) {
      let itemActioned: any = (<DwtSelectionEvent>ev).item,
        folder: ZimbraDriveFolder = itemActioned.getData(Dwt.KEY_OBJECT),
        menu: DwtMenu = this._getActionMenu(ev, folder);
      menu.setData(ZDId.ZIMBRADRIVE_ITEM_ACTIONED, itemActioned);
      menu.setData(Dwt.KEY_OBJECT, folder);
      if (!folder.parent) {
        menu.getItemById("menuItemId", ZDId.ZD_SAVE_FOLDER).setEnabled(false);
        menu.getItemById("menuItemId", ZmOperation.DELETE_WITHOUT_SHORTCUT).setEnabled(false);
        menu.getItemById("menuItemId", ZmOperation.MOVE).setEnabled(false);
        menu.getItemById("menuItemId", ZmOperation.RENAME_FOLDER).setEnabled(false);
      }
    }
  }

  // Drop Folder Listener
  public _dropListener(ev: DwtDropEvent): boolean {
    let dropFolder = ev.targetControl.getData(Dwt.KEY_OBJECT);
    let data = ev.srcData.data;
    if (ev.action === DwtDropEvent.DRAG_DROP) {
      let items = (data instanceof Array) ? data : [data];
      (<ZimbraDriveController>appCtxt.getCurrentController()).doMove(items, dropFolder);
    }
    return true;
  }

  // Move Folder Listener
  public _moveListener(ev: DwtSelectionEvent): boolean {
    this._pendingActionData = <ZimbraDriveFolder> this._getActionedOrganizer(ev);
    this.getChooseFolderDialog().setActionedFolder(this._getActionMenu(ev, ev.item).getData(ZDId.ZIMBRADRIVE_ITEM_ACTIONED));

    let moveParams: ZmFolderSearchFilterGetMoveParamsValue = this._getMoveParams(this._moveToDialog);
    let moveDialogOverview: ZmOverview = appCtxt.getOverviewController().getOverview(moveParams.overviewId);
    if (moveDialogOverview) {
      moveDialogOverview.setTreeView(ZimbraDriveApp.TREE_ID);
    }
    // moveParams.hideNewButton = true;
    moveParams.noRootSelect = true;
    ZmController.showDialog(this._moveToDialog, new AjxCallback(this, this._moveCallback), moveParams);
    this._moveToDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, this._moveToDialog);
    return true;
  }

  /** Used by
   *  @see ZmTreeController._moveCallback */
  public _doMove(movingFolder: ZimbraDriveFolder, targetFolder: ZimbraDriveFolder): void {
    let currentController: ZimbraDriveController = <ZimbraDriveController>appCtxt.getCurrentController();
    if (this._moveToDialog.getActionedFolder().isDwtTreeItem) {
      currentController.doMove([movingFolder], targetFolder);
    }
    else {
      currentController.doMove(currentController.getSelectedItems(), targetFolder);
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
    let items: (ZimbraDriveFolder | ZimbraDriveItem)[];
    let folder: ZimbraDriveFolder = <ZimbraDriveFolder> this._getActionMenu(ev, ev.item).getData(Dwt.KEY_OBJECT),
      itemActioned:
        DwtTreeItem
        | ZimbraDriveFolderItem = this._getActionMenu(ev, ev.item).getData(ZDId.ZIMBRADRIVE_ITEM_ACTIONED);
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
    (<ZimbraDriveController> appCtxt.getCurrentController()).deleteItems(items);
  }

  public _setupOptButton(params: ZmTreeControllerShowParams): void {
    params.optButton = null;
  }

  // Override ZmFolderTreeController.prototype._getMoveDialogTitle (which throws exception)
  //   with ZmTreeController.prototype._getMoveDialogTitle
  private _getMoveDialogTitle(): string {
    return "";
  }
}
