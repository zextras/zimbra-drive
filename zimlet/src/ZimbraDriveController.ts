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

import {ZmListController} from "./zimbra/zimbraMail/share/controller/ZmListController";
import {DwtControl} from "./zimbra/ajax/dwt/widgets/DwtControl";
import {ZmApp} from "./zimbra/zimbraMail/core/ZmApp";
import {ZmSearchResultsController} from "./zimbra/zimbraMail/share/controller/ZmSearchResultsController";
import {ZmSearchResult} from "./zimbra/zimbraMail/share/model/ZmSearchResult";
import {appCtxt} from "./zimbra/zimbraMail/appCtxt";
import {DwtComposite} from "./zimbra/ajax/dwt/widgets/DwtComposite";
import {ZDId} from "./ZDId";
import {PreviewPaneView} from "./view/PreviewPaneView";
import {DwtDragSource} from "./zimbra/ajax/dwt/dnd/DwtDragSource";
import {Dwt} from "./zimbra/ajax/dwt/core/Dwt";
import {ZmMailMsg} from "./zimbra/zimbraMail/mail/model/ZmMailMsg";
import {AjxCallback} from "./zimbra/ajax/boot/AjxCallback";
import {ZmListView} from "./zimbra/zimbraMail/share/view/ZmListView";
import {ZmOperation} from "./zimbra/zimbraMail/core/ZmOperation";
import {ZmPopupMenu, CreateMenuItemParams} from "./zimbra/zimbraMail/share/view/ZmPopupMenu";
import {DwtMenuItem} from "./zimbra/ajax/dwt/widgets/DwtMenuItem";
import {ZmMsg} from "./zimbra/zimbraMail/ZmMsg";
import {ZmDoublePaneController} from "./zimbra/zimbraMail/mail/controller/ZmDoublePaneController";
import {ZmSetting} from "./zimbra/zimbraMail/share/model/ZmSetting";
import {AjxListener} from "./zimbra/ajax/events/AjxListener";
import {DwtButton} from "./zimbra/ajax/dwt/widgets/DwtButton";
import {ZmControllerToolBarMap, ZmController} from "./zimbra/zimbraMail/share/controller/ZmController";
import {DwtText} from "./zimbra/ajax/dwt/widgets/DwtText";
import {ZmButtonToolBar} from "./zimbra/zimbraMail/share/view/ZmButtonToolBar";
import {DwtListViewActionEvent} from "./zimbra/ajax/dwt/events/DwtListViewActionEvent";
import {DwtTree} from "./zimbra/ajax/dwt/widgets/DwtTree";
import {ZimbraDriveItem} from "./ZimbraDriveItem";
import {DwtSelectionEvent} from "./zimbra/ajax/dwt/events/DwtSelectionEvent";
import {DwtListView} from "./zimbra/ajax/dwt/widgets/DwtListView";
import {ZimbraDriveApp} from "./ZimbraDriveApp";
import {ZmBatchCommand} from "./zimbra/zimbra/csfe/ZmBatchCommand";
import {ZimbraDriveTreeController} from "./ZimbraDriveTreeController";
import {ZimbraDriveFolder} from "./ZimbraDriveFolder";
import {ZmTreeView} from "./zimbra/zimbraMail/share/view/ZmTreeView";
import {ZimbraDriveFolderTree} from "./ZimbraDriveFolderTree";
import {ZmList} from "./zimbra/zimbraMail/share/model/ZmList";
import {ZimbraDriveFolderItem} from "./ZimbraDriveFolderItem";
import {AjxUtil} from "./zimbra/ajax/util/AjxUtil";
import {ZmZimbraMail} from "./zimbra/zimbraMail/core/ZmZimbraMail";
import {AjxStringUtil} from "./zimbra/ajax/util/AjxStringUtil";
import {AjxMessageFormat} from "./zimbra/ajax/util/AjxText";
import {AjxSoapDoc} from "./zimbra/ajax/soap/AjxSoapDoc";
import {DwtUiEvent} from "./zimbra/ajax/dwt/events/DwtUiEvent";
import {ZimbraDriveUploadDialog} from "./view/ZimbraDriveUploadDialog";
import {ZimbraDriveChooseFolderDialog} from "./view/ZimbraDriveChooseFolderDialog";
import {DwtDialog} from "./zimbra/ajax/dwt/widgets/DwtDialog";
import {ZmFolderSearchFilterGetMoveParamsValue} from "./zimbra/zimbraMail/share/view/ZmSearchResultsFilterPanel";
import {ZmOverview} from "./zimbra/zimbraMail/share/view/ZmOverview";
import {ZmStatusView} from "./zimbra/zimbraMail/share/view/ZmStatusView";
import {ZmCsfeException} from "./zimbra/zimbra/csfe/ZmCsfeException";
import {ZimbraDriveUploadManager} from "./ZimbraDriveUploadManager";
import {AjxEnv} from "./zimbra/ajax/boot/AjxEnv";
import {AjxPost} from "./zimbra/ajax/net/AjxPost";
import {DetailListView} from "./view/DetailListView";
import {DwtToolBarButton} from "./zimbra/ajax/dwt/widgets/DwtToolBar";
import {ZmComposeController} from "./zimbra/zimbraMail/mail/controller/ZmComposeController";
import {AjxDispatcher} from "./zimbra/ajax/boot/AjxDispatcher";
import {DwtMessageDialog} from "./zimbra/ajax/dwt/widgets/DwtMessageDialog";
import {ZimbraDriveWaitingDialog} from "./view/ZimbraDriveWaitingDialog";
import {DwtTreeItem} from "./zimbra/ajax/dwt/widgets/DwtTreeItem";

declare let window: {
  csrfToken: string
  XMLHttpRequest: any,
  ActiveXObject: any,
  open(url?: string, target?: string, features?: string, replace?: boolean): Window
};

export class ZimbraDriveController extends ZmListController {

// reading pane options
  private static MAP_ZIMBRADRIVE: string = "zimbradrive";
  private static PREVIEW_PANE_TEXT: {[id: string]: string} = {
    [ZmSetting.RP_OFF]: ZmMsg.previewPaneOff,
    [ZmSetting.RP_BOTTOM]: ZmMsg.previewPaneAtBottom,
    [ZmSetting.RP_RIGHT]: ZmMsg.previewPaneOnRight
  };
  private static PREVIEW_PANE_ICON: {[id: string]: string} = {
    [ZmSetting.RP_OFF]: "SplitPaneOff",
    [ZmSetting.RP_BOTTOM]: "SplitPane",
    [ZmSetting.RP_RIGHT]: "SplitPaneVertical"
  };

  private _dragSrc: DwtDragSource;
  private _folderId: number = 0;
  private _currentFolder: ZimbraDriveFolder;
  private _parentView: {[name: string]: DwtComposite} = {};
  private _readingPaneLoc: string;
  private _itemCountText: {[name: string]: DwtText};
  private _uploadDialog: ZimbraDriveUploadDialog;
  private _waitingDialog: ZimbraDriveWaitingDialog;
  private query: string;

  private static _currentFolderInstance: ZimbraDriveFolder;
  private static _uploadManager: ZimbraDriveUploadManager|AjxPost;

  constructor(container: DwtControl, app: ZmApp, type?: string, sessionId?: string, searchResultsController?: ZmSearchResultsController) {
    super(container, app, type, sessionId, searchResultsController);

    this._listeners[ZDId.ZD_NEW_FILE]   = new AjxListener(this, this._uploadFileListener);
    this._listeners[ZDId.ZD_SAVE_FILE]   = new AjxListener(this, this._saveFileListener);
    this._listeners[ZDId.ZD_NEW_FOLDER] = new AjxListener(this, this._newListener);
    this._listeners[ZDId.ZD_DELETE] = new AjxListener(this, this._deleteListener);
    this._listeners[ZDId.ZD_MOVE] = new AjxListener(this, this._moveListener);
    this._listeners[ZDId.ZD_RENAME] = new AjxListener(this, this._renameFileListener);
    this._listeners[ZmOperation.SEND_FILE_AS_ATT] = new AjxListener(this, this._sendFileListener);

    // let dropDownMenu: ZmPopupMenu = (<ZimbraDriveApp>app).getZDNewButtonMenu();
    // dropDownMenu.addSelectionListener(ZDId.ZD_NEW_FILE, this._listeners[ZDId.ZD_NEW_FILE]);
    // dropDownMenu.addSelectionListener(ZDId.ZD_NEW_FOLDER, this._listeners[ZDId.ZD_NEW_FOLDER]);

    // init on selection
    this.operationsToEnableOnZeroSelection = [
      ZmOperation.NEW_FILE,
      ZmOperation.VIEW_MENU
    ];
    this.operationsToDisableOnSingleSelection = [];
    this.operationsToEnableOnMultiSelection = [
      ZmOperation.NEW_FILE,
      ZDId.ZD_SAVE_FILE,
      ZDId.ZD_DELETE,
      ZDId.ZD_MOVE,
      ZmOperation.SEND_FILE_AS_ATT,
      ZmOperation.VIEW_MENU
    ];
    if (!this.isSearchResults) {
      this.operationsToEnableOnZeroSelection.push(ZDId.ZD_NEW_FOLDER);
      this.operationsToEnableOnMultiSelection.push(ZDId.ZD_NEW_FOLDER);
    }
    else {
      this.operationsToDisableOnSingleSelection.push(ZDId.ZD_NEW_FOLDER);
    }

    // Use briefcase current reading panel
    this._readingPaneLoc = appCtxt.get(ZmSetting.READING_PANE_LOCATION_BRIEFCASE) || "off";

    if (this.supportsDnD()) {
      this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
      this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));
    }
  }

  public show(results: ZmSearchResult): void;
  public show(results: ZmMailMsg, parentController: ZmListController, callback: AjxCallback, markRead: boolean, hidePagination: boolean, forceLoad: boolean, noTruncate: boolean): void;
  public show(results: any, p2?: ZmListController, p3?: AjxCallback, p4?: boolean, p5?: boolean, p6?: boolean, p7?: boolean): void {
    this.query = results.search.query;
    let itemsResults: ZmList = results.getResults(ZDId.ZIMBRADRIVE_ITEM),
      tree: ZimbraDriveFolderTree = <ZimbraDriveFolderTree> appCtxt.getTree(ZimbraDriveApp.APP_NAME);
    if (!this.isSearchResults) {
      let currentFolderPath = this.query.replace("in:\"", "").replace("\"", ""),
        treeFolder: ZimbraDriveFolder = <ZimbraDriveFolder> tree.root.getChildByPath("Drive" + currentFolderPath.slice(0, -1));
      this.setCurrentFolder(treeFolder);
      if (treeFolder.children.size() > 0) {
        for (let i = treeFolder.children.size() - 1; i >= 0; i--) {
          itemsResults.add((<ZimbraDriveFolder>treeFolder.children.getArray()[i]).getFolderItem(), 0);
        }
      }
    }
    let firstItem: ZimbraDriveItem = itemsResults.getArray().length > 0 && <ZimbraDriveItem> itemsResults.getArray()[0];
    if (firstItem && firstItem.getName && !firstItem.getName()) {
      itemsResults.getArray().pop();
    }
    itemsResults.getArray().sort(ZimbraDriveController.sortItems);
    this.setList(itemsResults);
    this._list.setHasMore(false);

    super.show(results);
    this._setup(this._currentViewId);

    // start fresh with search results
    let lv: ZmListView = this._listView[this._currentViewId];
    lv.offset = 0;
    lv._folderId = this._folderId;

    let elements = this.getViewElements(this._currentViewId, this._parentView[this._currentViewId]);

    this._setView({
      view: this._currentViewId,
      viewType: this._currentViewType,
      noPush: this.isSearchResults,
      elements: elements,
      isAppView: true
    });
    // if (this.isSearchResults) {
    //   // if we are switching views, make sure app view mgr is up to date on search view's components
    //   appCtxt.getAppViewMgr().setViewComponents(this.searchResultsController.getCurrentViewId(), elements, true);
    // }
    if (!this.isSearchResults) {
      // refresh overview tree!
      let treeController: ZimbraDriveTreeController = <ZimbraDriveTreeController> appCtxt.getOverviewController().getTreeController(ZimbraDriveApp.APP_NAME);
      treeController.show({overviewId: "main_ZIMBRA_DRIVE"});
      let treeItem: DwtTreeItem = treeController._treeView["ZIMBRA_DRIVE"].getTreeItemById(this._currentFolder.id);
      treeItem.setExpanded(true, true, true);
      treeItem._setSelected(true);
    }
    else {
      this.getParentView(this._currentViewId);
    }
    this._resetNavToolBarButtons();
  }

  public getParentView(id: string): DwtComposite {
    return this._parentView[id];
  }

  public getViewMgr(): PreviewPaneView {
    return <PreviewPaneView> this._parentView[this._currentViewId];
  }

  public _listSelectionListener(ev: DwtSelectionEvent): void {
    super._listSelectionListener(ev);

    if (ev.detail === DwtListView.ITEM_DBL_CLICKED) {
      let item = ev.item;

      if (item.isFolder()) {
        ZimbraDriveController.goToFolder(item.getPath());
      }
    }
  }

  public _resetOperations(parent: ZmButtonToolBar, itemSelectedCount: number): void {
    if (!parent) {
      return;
    }
    let keepUploadButtonStatus: boolean = this.getCurrentToolbar().getOp(ZDId.ZD_NEW_FILE).getEnabled();
    super._resetOperations(parent, itemSelectedCount);
    parent.enable([ZmOperation.VIEW_MENU], true);
    this.getCurrentToolbar().getOp(ZDId.ZD_NEW_FILE).setEnabled(keepUploadButtonStatus);
  }

  public _getToolBarOps(): string[] {
    return [
      ZDId.ZD_SAVE_FILE,
      ZmOperation.SEP,
      ZmOperation.SEP,
      ZDId.ZD_NEW_FOLDER,
      ZmOperation.SEP,
      ZDId.ZD_DELETE,
      ZmOperation.SEP,
      ZDId.ZD_MOVE,
      ZDId.ZD_RENAME,
      ZmOperation.SEP,
      ZDId.ZD_NEW_FILE,
    ];
  }

  public _getRightSideToolBarOps(): string[] {
    return [ZmOperation.VIEW_MENU];
  }

  public _initializeToolBar(view: string ): void {
    if (!(<ZmControllerToolBarMap>this._toolbar)[view]) {
      super._initializeToolBar(view);
      this._setupViewMenu(view, true);
      let toolbar: ZmButtonToolBar = (<ZmControllerToolBarMap>this._toolbar)[view];
      toolbar.addFiller();
      this._itemCountText[view] = toolbar.getButton(ZmOperation.TEXT);
      appCtxt.notifyZimlets("initializeToolbar", [this._app, toolbar, this, view], { waitUntilLoaded: true });
      // remove any style in upload button element
      let uploadButton: DwtToolBarButton = <DwtToolBarButton>toolbar.getButton(ZDId.ZD_NEW_FILE),
        uploadButtonEl: HTMLElement = uploadButton.getHtmlElement();
      uploadButton.setText("");
      uploadButton.setImage("");
      uploadButtonEl.className = "";
      uploadButtonEl. children[0].className = "";
    } else {
      this._setupDeleteButton((<ZmControllerToolBarMap>this._toolbar)[view]);
      this._setupViewMenu(view, false);
    }
  }

  public _setupViewMenu(view: string, firstTime: boolean): void {
    let btn: DwtButton, menu: ZmPopupMenu;
    if (firstTime) {
      btn = (<ZmControllerToolBarMap>this._toolbar)[view].getButton(ZmOperation.VIEW_MENU);
      menu = <ZmPopupMenu> btn.getMenu();
      if (!menu) {
        menu = new ZmPopupMenu(btn);
        btn.setMenu(menu);

        this._setupPreviewPaneMenu(menu, btn);
      }
    }
    if (!menu) {
      btn = (<ZmControllerToolBarMap>this._toolbar)[view].getButton(ZmOperation.VIEW_MENU);
      menu = <ZmPopupMenu> (btn && btn.getMenu());
    }
    this._resetPreviewPaneMenu(menu, view);
  }

  public isReadingPaneOn(): boolean {
    return (this._getReadingPanePref() !== ZmSetting.RP_OFF);
  }

  public isReadingPaneOnRight(): boolean {
    return (this._getReadingPanePref() === ZmSetting.RP_RIGHT);
  }

  public _getReadingPanePref(): string {
    return this._readingPaneLoc;
  }

  public _setupPreviewPaneMenu(menu: ZmPopupMenu, btn: DwtButton): void {
    if (menu.getItemCount() > 0) {
      new DwtMenuItem({parent: menu, style: DwtMenuItem.SEPARATOR_STYLE, id: "PREVIEW_SEPERATOR"});
    }
    let miParams: CreateMenuItemParams = {
      text: ZmMsg.readingPaneAtBottom,
      style: DwtMenuItem.RADIO_STYLE,
      radioGroupId: "RP",
      image: ""
    };
    let ids: string[] = ZmDoublePaneController.RP_IDS;
    for (let i = 0; i < ids.length; i++) {
      let id: string = ids[i];
      if (!menu._menuItems[id]) {
        miParams.text = ZimbraDriveController.PREVIEW_PANE_TEXT[id];
        miParams.image = ZimbraDriveController.PREVIEW_PANE_ICON[id];
        let mi = menu.createMenuItem(id, miParams);
        mi.setData(ZmOperation.MENUITEM_ID, id);
        mi.addSelectionListener(new AjxListener(this, this._previewPaneListener, id));
        if (id === this._readingPaneLoc) {
          mi.setChecked(true, true);
          btn.setImage(mi.getImage());
        }
      }
    }
  }

  public _setReadingPanePref(value: string): void {
    this._readingPaneLoc = value;
  }

  public _previewPaneListener(newPreviewStatus: string): void {
    let oldPreviewStatus = this._getReadingPanePref();
    this._setReadingPanePref(newPreviewStatus);
    let lv: PreviewPaneView = <PreviewPaneView>this._parentView[this._currentViewId];
    lv.resetPreviewPane(newPreviewStatus, oldPreviewStatus);
    let btn = (<ZmControllerToolBarMap>this._toolbar)[this._currentViewId].getButton(ZmOperation.VIEW_MENU);
    if (btn) {
      btn.setImage(ZimbraDriveController.PREVIEW_PANE_ICON[newPreviewStatus]);
    }
  }

  public _resetPreviewPaneMenu(menu: ZmPopupMenu, view: string = this._currentViewId): void {
    let ids = ZmDoublePaneController.RP_IDS;
    for (let i = 0; i < ids.length; i++) {
      let id = ids[i];
      if (menu._menuItems[id]) {
        menu._menuItems[id].setEnabled(true);
      }
    }
  }

  public _createNewView(view: string): DwtControl {
    this._parentView[view] = new PreviewPaneView(this._container, this, this._dropTgt);
    let listView: ZmListView = (<PreviewPaneView>this._parentView[view]).getListView();
    if (this._dragSrc) {
      listView.setDragSource(this._dragSrc);
    }
    return listView;
  }

  public _setViewContents(view: string): void {
    if (this._parentView[view]) {
      (<PreviewPaneView> this._parentView[view]).set(this._list);
    }
  }

  private setCurrentFolder(currentFolder: ZimbraDriveFolder): void {
    this._currentFolder = currentFolder;
    (<ZimbraDriveTreeController> appCtxt.getOverviewController().getTreeController(ZimbraDriveApp.APP_NAME)).setCurrentFolder(currentFolder);
    ZimbraDriveController._currentFolderInstance = currentFolder;
  }

  private _setupDeleteButton(parent: ZmButtonToolBar): void {
    let deleteButton = parent.getButton(ZDId.ZD_DELETE);
    if (deleteButton) {
      deleteButton.setToolTipContent(ZmOperation.getToolTip(ZDId.ZD_DELETE, this.getKeyMapName(), ZmMsg.deleteTooltip));
    }
  }

  private getKeyMapName(): string {
    return ZimbraDriveController.MAP_ZIMBRADRIVE;
  }

  public _listActionListener(ev: DwtListViewActionEvent): void {
    let item: ZimbraDriveItem = <ZimbraDriveItem> ev.item;
    if (item && item.isFolder()) {
      ev.detail = DwtTree.ITEM_ACTIONED;
      let treeController: ZimbraDriveTreeController = <ZimbraDriveTreeController> appCtxt.getOverviewController().getTreeController(ZimbraDriveApp.APP_NAME),
        itemFolder: ZimbraDriveFolderItem = <ZimbraDriveFolderItem> item;
      if (!itemFolder.setData) {
        return;
      }
      itemFolder.setData(ZmTreeView.KEY_TYPE, ZDId.ZIMBRADRIVE_ITEM);
      itemFolder.setData(Dwt.KEY_OBJECT, itemFolder.getFolder()); // ZimbraDriveFolder
      itemFolder.setData(ZmTreeView.KEY_ID, "main_" + ZimbraDriveApp.APP_NAME);
      itemFolder.setData(Dwt.KEY_ID, item.id);
      treeController._treeViewListener(ev);
      treeController._getActionMenu(ev, itemFolder).setData(Dwt.KEY_OBJECT, itemFolder.getFolder());
      return;
    }

    super._listActionListener(ev);

    let actionMenu: ZmPopupMenu = <ZmPopupMenu> this.getActionMenu();
    actionMenu.popup(0, ev.docX, ev.docY);
  }

  public _getActionMenuOps(): string[] {
    return [
      ZDId.ZD_SAVE_FILE,
      ZmOperation.SEND_FILE_AS_ATT,
      ZmOperation.SEP,
      ZDId.ZD_DELETE,
      ZDId.ZD_MOVE,
      ZDId.ZD_RENAME
    ];
  }

  public getSelectedItems(): any[] {
    const view: ZmListView = this._listView[this._currentViewId];
    let items = view.getSelection();
    if (!items) { return[]; }
    return AjxUtil.toArray(items);
  }

  private _saveFileListener(ev: DwtSelectionEvent): void {
    const items = this.getSelectedItems();
    if (items.length === 0) { return; }
    // If only one element was selected then proceed as default
    else if (items.length === 1) {
      const item: ZimbraDriveItem = items[0];
      if (!item.isFolder()) {
        let url: string = `${ZimbraDriveApp.DOWNLOAD_URL}${item.getPath()}`;
        this._downloadFile(AjxStringUtil.urlComponentEncode(url));
      }
      else {
        let itemFolder: ZimbraDriveFolderItem = <ZimbraDriveFolderItem> item;
        let treeController: ZimbraDriveTreeController = <ZimbraDriveTreeController> appCtxt.getOverviewController().getTreeController(ZimbraDriveApp.APP_NAME);
        treeController.downloadFolderAsZip(itemFolder.getPath());
      }
    }
    else {
      let urlArray: string[] = [];
      for (let item of items) {
        if (!item.isFolder()) {
          urlArray.push(`${ZimbraDriveApp.DOWNLOAD_URL}${item.getPath()}`);
        }
        else {
          let itemFolder: ZimbraDriveFolderItem = <ZimbraDriveFolderItem> item;
          urlArray.push(`${ZimbraDriveApp.DOWNLOAD_URL}${itemFolder.getPath()}`);
        }
      }
      ZmZimbraMail.unloadHackCallback();
      this._downloadNextFile(urlArray);
    }
  }

  private _delayedDownloadNextFile(urlArray: string[]): void {
    setTimeout(AjxCallback.simpleClosure(this._downloadNextFile, this, urlArray), 10);
  }

  private _downloadNextFile(urlArray: string[]): void {
    if (urlArray.length === 0) return;
    let url: string = urlArray[0],
      reducedArray: string[] = urlArray.slice(1, urlArray.length),
      downloadNextFile: Function = AjxCallback.simpleClosure(this._delayedDownloadNextFile, this, reducedArray);
    let childWindow: Window = window.open(url, "_blank");
    childWindow.onbeforeunload = <(this: Window, ev: BeforeUnloadEvent) => any> downloadNextFile;
  }

  private _downloadFile(url: string): void {
    ZmZimbraMail.unloadHackCallback();
    location.href = url;
  }

  public _uploadFileListener(ev: DwtSelectionEvent, folder?: ZimbraDriveFolder): void {
    folder = folder || ZimbraDriveController.getCurrentFolder() || (<ZimbraDriveFolder> (<ZimbraDriveFolderTree> appCtxt.getTree(ZimbraDriveApp.APP_NAME)).root.getChildByPath("Drive"));
    if (!this._uploadDialog) {
      this._uploadDialog = new ZimbraDriveUploadDialog(appCtxt.getShell());
    }
    this._uploadDialog.popup(this, folder, undefined, ZmMsg.uploadDocs + " - " + folder.getName(), null, !AjxEnv.supportsHTML5File);
  }

  private _deleteListener(): void {
    const items = this.getSelectedItems();
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
    dialog.popup(message, new AjxCallback(this, this._doDeleteItems, [items]));
  }

  private _doDeleteItems(items: any[]): void {
    const paths: string[] = [];
    for (let item of items) {
      paths.push(item.getPath());
    }
    let soapDoc = AjxSoapDoc.create("DeleteRequest", "urn:zimbraDrive");
    soapDoc.set(ZDId.F_PATH, JSON.stringify(paths));
    (<ZmZimbraMail>appCtxt.getAppController()).sendRequest({
      soapDoc: soapDoc,
      asyncMode: true,
      callback: new AjxCallback(this, this._onDeleteDone, [items])
    });
  }

  private _onDeleteDone(items: ZimbraDriveItem[]): void {
    let treeController: ZimbraDriveTreeController = <ZimbraDriveTreeController> appCtxt.getOverviewController().getTreeController(ZimbraDriveApp.APP_NAME),
      promiseRefreshSearch: boolean = false;
    for (let item of items) {
      if (item.isFolder()) {
        if (treeController._treeView["ZIMBRA_DRIVE"] && treeController._treeView["ZIMBRA_DRIVE"].getTreeItemById(item.id)) {
          treeController._treeView["ZIMBRA_DRIVE"].getTreeItemById(item.id).dispose();
        }
        // need refresh because a lot of items can be changed
        promiseRefreshSearch = this.isSearchResults;
      }
      (<PreviewPaneView> this._parentView[this._currentViewId]).getListView().removeItem(item);
    }
    if (promiseRefreshSearch) {
      let batchCommand = new ZmBatchCommand();
      batchCommand.add(new AjxCallback(null, ZimbraDriveApp.loadGetAllFolderRequestParams));
      batchCommand.add(new AjxCallback(null, ZimbraDriveApp.loadSearchRequestParams, [this.query, true]));
      batchCommand.run();
    }
    (<PreviewPaneView> this._parentView[this._currentViewId]).getPreviewView().enablePreview(false);
  }

  private _renameFileListener(ev: DwtUiEvent): void {
    let view: ZmListView = this._listView[this._currentViewId];
    let items: ZimbraDriveItem[] = view.getSelection();
    if (!items) { return; }

    if (!(<ZimbraDriveItem> items[0]).isFolder()) {
      (<DetailListView> view).renameFile(items[0]);
    } else {
      (<ZimbraDriveTreeController> appCtxt.getOverviewController().getTreeController(ZimbraDriveApp.APP_NAME)).renameFolderItemListener(ev, <ZimbraDriveFolderItem>items[0]);
    }
  }

  private _newListener(ev: DwtSelectionEvent): void {
    let treeController: ZimbraDriveTreeController = <ZimbraDriveTreeController> appCtxt.getOverviewController().getTreeController(ZimbraDriveApp.APP_NAME);
    treeController.popupNewFolderDialog(ZimbraDriveController.getCurrentFolder());
  }

  private _moveListener(ev: DwtSelectionEvent): void {
    let treeController: ZimbraDriveTreeController = <ZimbraDriveTreeController> appCtxt.getOverviewController().getTreeController(ZimbraDriveApp.APP_NAME),
      moveDialog: ZimbraDriveChooseFolderDialog = treeController.getChooseFolderDialog();
    let moveParams: ZmFolderSearchFilterGetMoveParamsValue = treeController._getMoveParams(moveDialog);
    let moveDialogOverview: ZmOverview = appCtxt.getOverviewController().getOverview(moveParams.overviewId);
    if (moveDialogOverview) {
      moveDialogOverview.setTreeView("ZIMBRA_DRIVE");
    }
    moveParams.hideNewButton = true;
    ZmController.showDialog(moveDialog, new AjxCallback(this, this._moveCallback, [this._listView[this._currentViewId].getSelection(), moveDialog]), moveParams);
    moveDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, moveDialog);
  }

  private _moveCallback(items: ZimbraDriveItem[], moveDialog: ZimbraDriveChooseFolderDialog, folder: ZimbraDriveFolder): void {
    ZimbraDriveController.doMove(items, folder, this.isSearchResults);
    moveDialog.popdown();
  }

  private _sendFileListener(ev: DwtSelectionEvent): void {
    let view: ZmListView = this._listView[this._currentViewId];
    let items: ZimbraDriveItem[] = view.getSelection();
    this.sendFilesAsAttachment(items);
  }

  public sendFilesAsAttachment(items: ZimbraDriveItem[], composeController?: ZmComposeController): void {
    items = AjxUtil.toArray(items);
    let filesPaths: string[] = [],
      checkSumFiles: number = 0;
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      if (!item.isFolder()) {
        checkSumFiles += item.getSize();
        if (item.getSize() > appCtxt.get(ZmSetting.MESSAGE_SIZE_LIMIT)) {
          let msgDlg = appCtxt.getMsgDialog();
          let errorMsg = AjxMessageFormat.format(ZmMsg.attachmentSizeError, AjxUtil.formatSize(appCtxt.get(ZmSetting.MESSAGE_SIZE_LIMIT)));
          msgDlg.setMessage(errorMsg, DwtMessageDialog.WARNING_STYLE);
          msgDlg.popup();
          return;
        }
        else {
          filesPaths.push(item.getPath());
        }
      }
    }

    try {
      let req: XMLHttpRequest;
      if (window.XMLHttpRequest) {
        req = new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        req = new ActiveXObject("Microsoft.XMLHTTP");
      }
      req.open("POST", ZimbraDriveApp.CREATE_TEMP_FILES_URL, true);
      req.setRequestHeader("Cache-Control", "no-cache");
      req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      if (window.csrfToken) {
        req.setRequestHeader("X-Zimbra-Csrf-Token", window.csrfToken);
      }
      req.onreadystatechange = <(() => any)> AjxCallback.simpleClosure(this._handleCreateTempFilesResponse, this, req, composeController);
      req.send(filesPaths.join("\n"));
      this._getWaitingDialog().popup();
    }
    catch (exp) {
      this._errorOnCreatingTempFiles();
    }
  }

  private _handleCreateTempFilesResponse(req: XMLHttpRequest, composeController: ZmComposeController, ev: Event): void {
    if (req.readyState !== 4) {
      return;
    }
    // parse response
    this._getWaitingDialog().popdown();
    let responses: string[] = req.responseText.split("\n"),
      filesArray: ZimbraDriveAttachFileInfo[] = [],
      serverError: boolean = false;
    for (let response of responses) {
      if (response.length > 0) {
        let idxArrayStart: number = response.indexOf("["),
          idxArrayEnd: number = response.lastIndexOf("]"),
          respParts: string[] = response.substring(0, idxArrayStart).split(","),
          status: number = parseInt(respParts[0]),
          file: ZimbraDriveAttachFileInfo = JSON.parse(response.substring(idxArrayStart + 1, idxArrayEnd));
        if (status !== 200) {
          serverError = true;
        }
        try {
          file.filename = decodeURIComponent(file.filename);
        } catch (ex) {}
        filesArray.push(file);
      }
    }
    let action = ZmOperation.NEW_MESSAGE,
      msg: ZmMailMsg = new ZmMailMsg({});

    if (!serverError) {
      if (!composeController) {
        composeController = <ZmComposeController> AjxDispatcher.run("GetComposeController");
        composeController._setView({
          action: action,
          msg: msg,
          inNewWindow: false
        });
      }
      composeController._initAutoSave();
      composeController.saveDraft(ZmComposeController.DRAFT_TYPE_AUTO, filesArray, null);
    } else {
      this._errorOnCreatingTempFiles();
    }
  }

  private _errorOnCreatingTempFiles(): void {
    appCtxt.setStatusMsg({msg: ZimbraDriveApp.getMessage("errorServer"), level: ZmStatusView.LEVEL_CRITICAL});
  }

  // Static methods
  public static getDefaultViewType(): string {
    return ZDId.VIEW_ZIMBRADRIVE_DETAIL;
  }

  public static goToFolder(folderPath: string, givenBatchCommand?: ZmBatchCommand): void {
    // folder path must have last slash
    let batchCommand: ZmBatchCommand;
    if (!givenBatchCommand) {
      batchCommand = new ZmBatchCommand();
    }
    else {
      batchCommand = givenBatchCommand;
    }
    batchCommand.add(new AjxCallback(null, ZimbraDriveApp.loadGetAllFolderRequestParams));
    batchCommand.add(new AjxCallback(null, ZimbraDriveApp.loadSearchRequestParams, [`in:"${folderPath}"`, false]));
    batchCommand.run();
  }

  public static getCurrentFolder(): ZimbraDriveFolder {
    return ZimbraDriveController._currentFolderInstance;
  }

  public static getCurrentFolderPath(): string {
    return ZimbraDriveController.getCurrentFolder().getPath(true);
  }

  public static doMove(items: ZimbraDriveItem[]|ZimbraDriveFolder[], folder: ZimbraDriveFolder, skipGoToFolder?: boolean): void {
    let batchCommand: ZmBatchCommand = new ZmBatchCommand(),
      moveParams: ZimbraDriveMoveParams = {itemsName: [], itemsAlreadyExist: [], itemsError: [], countResponses: 0},
      changeCurrentFolder: boolean = false;
    for (let item of items) {
      if (!ZimbraDriveController.checkMoveFeasible(item, folder.getPath(true))) {
        appCtxt.setStatusMsg({msg: item.getName() + " cannot be moved in target destination.", level: ZmStatusView.LEVEL_WARNING});
        return;
      }
      moveParams.itemsName.push(item.getName());
      batchCommand.add(new AjxCallback(null, ZimbraDriveApp.loadMoveRequestParams, [item, folder, batchCommand, moveParams]));
    // check if the current folder view has to change
      if (!skipGoToFolder && !changeCurrentFolder) {
        changeCurrentFolder =
          item.getPath().length <= ZimbraDriveController.getCurrentFolderPath().length &&
          item.getPath() === ZimbraDriveController.getCurrentFolderPath().substring(0, item.getPath().length);
      }
    }
    if (!skipGoToFolder) {
      let nextFolderView: string = changeCurrentFolder ? folder.getPath(true) : ZimbraDriveController.getCurrentFolderPath();
      ZimbraDriveController.goToFolder(nextFolderView, batchCommand);
    }
    else {
      batchCommand.run();
    }
  }

  public static moveCallback(item: ZimbraDriveItem, destinationFolder: ZimbraDriveFolder, moveParams: ZimbraDriveMoveParams): boolean {
    moveParams.countResponses++;
    // show toast only on each move is done
    if (moveParams.countResponses >= moveParams.itemsName.length) {
      ZimbraDriveController.displayMoveDoneMessage(moveParams);
    }
    if (item.isItem()) {
      item.setPath(destinationFolder.getPath(true) + item.getName());
      document.getElementById(item.getParentNameElId()).textContent = item.getParentName();
    }
    return true;
  }

  public static moveErrorCallback(item: ZimbraDriveItem|ZimbraDriveFolder, moveParams: ZimbraDriveMoveParams, exception: ZmCsfeException): boolean {
    // find index:
    let index: number;
    for (let i = 0; i < moveParams.itemsName.length; i++) {
      if (item.getName() === moveParams.itemsName[i]) {
        index = i;
      }
    }
    let exceptionMessage = exception.msg;
    if (exceptionMessage.substring(exceptionMessage.length - 3) === "405") {
      moveParams.itemsAlreadyExist.push(index);
    }
    else {
      moveParams.itemsError.push(index);
    }
    moveParams.countResponses++;
    if (moveParams.countResponses >= moveParams.itemsName.length) {
      ZimbraDriveController.displayMoveDoneMessage(moveParams);
    }
    return true;
  }

  public static displayMoveDoneMessage(moveParams: ZimbraDriveMoveParams): void {
    if (moveParams.itemsAlreadyExist.length + moveParams.itemsError.length === 0) {
      appCtxt.setStatusMsg({msg: ZimbraDriveApp.getMessage("successfulMove"), level: ZmStatusView.LEVEL_INFO});
    }
    else {
      let notificationMessage: string = "",
        level: number = ZmStatusView.LEVEL_WARNING;

      // calculate message
      if (moveParams.itemsAlreadyExist.length > 0) {
        let itemsNames: string[] = [],
          lastItemName: string = moveParams.itemsName[moveParams.itemsAlreadyExist[moveParams.itemsAlreadyExist.length - 1]];
        if (moveParams.itemsAlreadyExist.length  === 1) {
          notificationMessage += ZimbraDriveApp.getMessage("errorMoveAlreadyExists", [lastItemName, "s"]);
        }
        else {
          for (let i = 0; i < moveParams.itemsAlreadyExist.length - 1; i++) {
            itemsNames.push(moveParams.itemsName[moveParams.itemsAlreadyExist[i]]);
          }
          let itemsString: string = itemsNames.join(", ") + " and " + lastItemName;
          notificationMessage += ZimbraDriveApp.getMessage("errorMoveAlreadyExists", [itemsString, ""]);
        }
      }

      if (moveParams.itemsError.length > 0) {
        level = ZmStatusView.LEVEL_CRITICAL;
        let itemsNames: string[] = [],
          lastItemName: string = moveParams.itemsName[moveParams.itemsError[moveParams.itemsError.length - 1]];
        if (moveParams.itemsError.length  === 1) {
          notificationMessage += ZimbraDriveApp.getMessage("errorMove", [lastItemName]);
        }
        else {
          for (let i = 0; i < moveParams.itemsError.length - 1; i++) {
            itemsNames.push(moveParams.itemsName[moveParams.itemsError[i]]);
          }
          let itemsString: string = itemsNames.join(", ") + " and " + lastItemName;
          notificationMessage += ZimbraDriveApp.getMessage("errorMove", [itemsString]);
        }
      }

      appCtxt.setStatusMsg({
        msg: notificationMessage,
        level: level
      });
    }
  }

  public static checkMoveFeasible(item: ZimbraDriveItem|ZimbraDriveFolder, destinationPath: string): boolean {
    // check if item is folder and contains destination
    if (item.containsTargetPath(destinationPath)) {
      return false;
    }
    // at last check if move is useless return
    return item.getParentPath() !== destinationPath;
  }

  public static getUploadManager(): ZimbraDriveUploadManager|AjxPost {
    if (!ZimbraDriveController._uploadManager) {
      if (AjxEnv.supportsHTML5File) {
        ZimbraDriveController._uploadManager = new ZimbraDriveUploadManager();
      }
      else {
        ZimbraDriveController._uploadManager = appCtxt.getUploadManager();
      }
    }
    return ZimbraDriveController._uploadManager;
  }

  private _getWaitingDialog(): ZimbraDriveWaitingDialog {
    if (!this._waitingDialog) {
      this._waitingDialog = new ZimbraDriveWaitingDialog();
    }
    return this._waitingDialog;
  }

  private static sortItems(itemA: ZimbraDriveItem, itemB: ZimbraDriveItem): number {
    if (itemA.isFolder() && !itemB.isFolder()) { return -1; }
    if (!itemA.isFolder() && itemB.isFolder()) { return 1; }
    if (itemA.getName() > itemB.getName()) { return 1; }
    if (itemA.getName() < itemB.getName()) { return -1; }
    return 0; // TODO: Update this function.
  }
}

export interface ZimbraDriveMoveParams {
  itemsName: string[];
  itemsAlreadyExist: number[];
  itemsError: number[];
  countResponses: number;
}

interface ZimbraDriveAttachFileInfo {
  filename: string;
  ct: string;
  id: string;
  s: number;
  ver: string;
}
