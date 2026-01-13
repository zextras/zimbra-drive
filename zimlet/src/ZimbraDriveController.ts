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
import {ZmOrganizer} from "./zimbra/zimbraMail/share/model/ZmOrganizer";
import {ZmList} from "./zimbra/zimbraMail/share/model/ZmList";
import {DwtTreeItem} from "./zimbra/ajax/dwt/widgets/DwtTreeItem";
import {ZmSearchControllerSearchParams} from "./zimbra/zimbraMail/share/controller/ZmSearchController";
import {ZmBaseController} from "./zimbra/zimbraMail/share/controller/ZmBaseController";
import {ZmAppViewMgr} from "./zimbra/zimbraMail/core/ZmAppViewMgr";
import {AjxTemplate} from "./zimbra/ajax/boot/AjxTemplate";
import {AjxVector} from "./zimbra/ajax/util/AjxVector";
import {DwtInputField} from "./zimbra/ajax/dwt/widgets/DwtInputField";
import {DwtRectangle} from "./zimbra/ajax/dwt/graphics/DwtRectangle";
import {DwtEvent} from "./zimbra/ajax/dwt/events/DwtEvent";
import {DwtKeyEvent} from "./zimbra/ajax/dwt/events/DwtKeyEvent";
import {ZmAppCtxt} from "./zimbra/zimbraMail/core/ZmAppCtxt";

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
  private _renameField: DwtInputField;
  private _fileItem: ZimbraDriveItem;
  private _fileItemNameEl: HTMLElement;
  private query: string;

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
  public show(results: ZmSearchResult|ZmMailMsg, p2?: ZmListController, p3?: AjxCallback, p4?: boolean, p5?: boolean, p6?: boolean, p7?: boolean): void {
    let rootFolder: ZimbraDriveFolder = null;
    for (let tmpFldr of appCtxt.getTree(ZmOrganizer.FOLDER).root.children.getArray()) {
      if (tmpFldr.type === ZDId.ZIMBRADRIVE_ITEM) {
        rootFolder = <ZimbraDriveFolder>tmpFldr;
        break;
      }
    }
    let itemsResults: ZmList = (<ZmSearchResult>results).getResults(ZDId.ZIMBRADRIVE_ITEM),
      finalList: ZmList = new ZmList(ZDId.ZIMBRADRIVE_ITEM);
    // this._folderId = results && results.search && results.search.folderId;

    this.query = (<ZmSearchResult>results).getAttribute("query");
    // let itemsResults: ZmList = results.getResults(ZDId.ZIMBRADRIVE_ITEM),
    //   tree: ZimbraDriveFolderTree = <ZimbraDriveFolderTree> appCtxt.getTree(ZimbraDriveApp.APP_NAME);
    let firstItem: ZimbraDriveItem = itemsResults.getArray().length > 0 && <ZimbraDriveItem> itemsResults.getArray()[0];
    if (firstItem && firstItem.getName && !firstItem.getName()) {
      itemsResults.getArray().pop();
    }
    for (let item of itemsResults.getArray()) {
      if ((<ZimbraDriveItem> item).isFolder()) {
        // Recover folder
        let folder: ZimbraDriveFolder =  <ZimbraDriveFolder> rootFolder.getChildByPath(ZimbraDriveController.removeStartingAndEndingSlash((<ZimbraDriveItem> item).getPath()));
        finalList.add(folder.getFolderItem());
      }
      else {
        finalList.add(item);
      }
    }
    if (!this.isSearchResults) {
      // Block any promised goToFolder
      (<ZimbraDriveApp> appCtxt.getApp(ZimbraDriveApp.APP_NAME)).resetPromisedGoToFolder();

      let currentFolderPath: string = (<ZmSearchResult>results).search.query.replace("in:", "").replace(/"/g, ""),
        treeFolder: ZimbraDriveFolder = rootFolder;
      if (currentFolderPath !== "" && currentFolderPath !== "/") {
        treeFolder = <ZimbraDriveFolder>rootFolder.getChildByPath(ZimbraDriveController.removeStartingAndEndingSlash(currentFolderPath));
      }
      this.setCurrentFolder(treeFolder);
      // if (treeFolder.children.size() > 0) {
      //   for (let i = treeFolder.children.size() - 1; i >= 0; i--) {
      //     itemsResults.add((<ZimbraDriveFolder>treeFolder.children.getArray()[i]).getFolderItem(), 0);
      //   }
      // }
      if (treeFolder.children.size() > 0) {
        for (let childFolder of treeFolder.children.getArray()) {
          finalList.add((<ZimbraDriveFolder> childFolder).getFolderItem());
        }
      }
    }
    finalList.getArray().sort(ZimbraDriveController.sortItems);
    this.setList(finalList);

    this.getList().setHasMore(false);
    // this._list.setHasMore(results.getAttribute("more"));

    super.show(<ZmSearchResult> results, this._currentViewId);
    // super.show(results, this._currentViewId);

    this._setup(this._currentViewId);

    // start fresh with search results
    let lv = this._listView[this._currentViewId];
    // lv.offset = 0;
    // lv._folderId = this._folderId;

    let elements = this.getViewElements(this._currentViewId, this._parentView[this._currentViewId]);

    this.resetRenameFile();
    this._setView({
      view: this._currentViewId,
      viewType: this._currentViewType,
      noPush: this.isSearchResults,
      elements:	elements,
      isAppView: true
    });
    if (this.isSearchResults) {
      // if we are switching views, make sure app view mgr is up to date on search view's components
      appCtxt.getAppViewMgr().setViewComponents(this.searchResultsController.getCurrentViewId(), elements, true);
    }
    else {
      // refresh overview tree! TODO: ZD-32
      let mainOverview: ZmOverview = appCtxt.getOverviewController().getOverview("main_" + ZimbraDriveApp.APP_NAME);
      let treeController: ZimbraDriveTreeController = <ZimbraDriveTreeController> appCtxt.getOverviewController().getTreeController(ZimbraDriveApp.TREE_ID),
        treeView: ZmTreeView = treeController.show({overviewId: "main_" + ZimbraDriveApp.APP_NAME}),
        treeItem: DwtTreeItem = treeView.getTreeItemById(this._currentFolder.id);
      treeItem.setExpanded(true, true, true);
      treeItem._setSelected(true);
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
        ZimbraDriveController.goToFolder(item.getPath(), false);
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
    let overview: ZmOverview = appCtxt.getOverviewController().getOverview("main_" + ZimbraDriveApp.APP_NAME);
    if (overview) {
      overview.focus();
    }
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
      let treeController: ZimbraDriveTreeController = <ZimbraDriveTreeController> appCtxt.getOverviewController().getTreeController(ZimbraDriveApp.TREE_ID),
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
        let url: string = `${ZimbraDriveApp.DOWNLOAD_URL}${item.getPath(true)}`;
        this._downloadFile(url);
      }
      else {
        let itemFolder: ZimbraDriveFolderItem = <ZimbraDriveFolderItem> item;
        let treeController: ZimbraDriveTreeController = <ZimbraDriveTreeController> appCtxt.getOverviewController().getTreeController(ZimbraDriveApp.TREE_ID);
        treeController.downloadFolderAsZip(itemFolder.getPath(false));
      }
    }
    else {
      let urlArray: string[] = [];
      for (let item of items) {
        if (!item.isFolder()) {
          urlArray.push(`${ZimbraDriveApp.DOWNLOAD_URL}${item.getPath(true)}`);
        }
        else {
          let itemFolder: ZimbraDriveFolderItem = <ZimbraDriveFolderItem> item;
          urlArray.push(`${ZimbraDriveApp.DOWNLOAD_URL}${itemFolder.getPath(true)}`);
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
    folder = folder || this.getCurrentFolder() || (<ZimbraDriveFolder> appCtxt.getTree(ZmOrganizer.FOLDER).root.getChildByPath("/"));
    if (!this._uploadDialog) {
      this._uploadDialog = new ZimbraDriveUploadDialog(appCtxt.getShell());
    }
    this._uploadDialog.popup(this, folder, undefined, ZmMsg.uploadDocs + " - " + folder.getName(), null, !AjxEnv.supportsHTML5File);
  }

  private _deleteListener(ev: DwtSelectionEvent): void {
    this.deleteItems(this.getSelectedItems());
  }

  public deleteItems(items: any[]): void {
    if (items.length < 1) { return; }
    // TODO: These are not really deleted, are moved into the *Cloud trash
    let message: string;
    if (items.length > 1) {
      message = ZmMsg.confirmPermanentDeleteItemList;
    } else {
      let delMsgFormatter = new AjxMessageFormat(ZmMsg.confirmPermanentDeleteItem);
      message = delMsgFormatter.format(items[0].getName());
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
      callback: new AjxCallback(this, this._onDeleteDone, [items]),
      errorCallback: new AjxCallback(this, this._onDeleteError),
    });
  }

  private _onDeleteDone(items: (ZimbraDriveFolder|ZimbraDriveItem)[]): void {
    let zdApp: ZimbraDriveApp = <ZimbraDriveApp> appCtxt.getApp(ZimbraDriveApp.APP_NAME),
      mainController: ZimbraDriveController = zdApp.getZimbraDriveController(ZmApp.MAIN_SESSION);
    for (let item of items) {
      (<ZimbraDriveFolder> item)._notify("DELETE");
      if (item.isFolder()) {
        let folder: ZimbraDriveFolder = item.isItem() ? (<ZimbraDriveFolderItem> item).getFolder() : <ZimbraDriveFolder> item;
        folder.deleteLocal();
        folder._notify("DELETE");
      }
      else {
        mainController.getList().remove(<ZimbraDriveFolderItem> item);
      }
      mainController.getViewMgr().getListView().removeItem(item);
    }
    // If deleted folder contains current folder then reset view to root
    if (items[0].containsTargetPath && items[0].containsTargetPath(mainController.getCurrentFolder().getPath(true))) {
      let queryPath: string = "/";
      this.isSearchResults ? zdApp.promiseGoToFolder(queryPath) : ZimbraDriveController.goToFolder(queryPath, false);
    }
    if (this.isSearchResults) {
      this.refreshList(false);
    }
  }

  private _onDeleteError(): boolean {
    appCtxt.setStatusMsg({
      msg: ZimbraDriveApp.getMessage("errorDelete"),
      level: ZmStatusView.LEVEL_WARNING,
    });
    return true;
  }

  private _renameFileListener(ev: DwtUiEvent): void {
    let items: ZimbraDriveItem[] = this._listView[this._currentViewId].getSelection();
    if (!items) { return; }

    if (!(<ZimbraDriveItem> items[0]).isFolder()) {
      this.renameFile(items[0]);
    } else {
      (<ZimbraDriveTreeController> appCtxt.getOverviewController().getTreeController(ZimbraDriveApp.TREE_ID)).renameFolderItemListener(ev, <ZimbraDriveFolderItem>items[0]);
    }
  }

  public renameFile(item: ZimbraDriveItem): void {
    this._fileItemNameEl = document.getElementById(item.getNameElId());
    let fileNameBounds: DwtRectangle = Dwt.getBounds(this._fileItemNameEl),
      fileInput: DwtInputField = this._enableRenameInput(true, fileNameBounds);
    fileInput.setValue(item.getName());
    this._fileItem = item;
  }

  public _enableRenameInput(enable: boolean, bounds?: DwtRectangle): DwtInputField {
    let fileInput = this._getRenameInput();
    if (enable) {
      fileInput.setBounds(bounds.x, bounds.y, bounds.width ,  18);
      fileInput.setDisplay(Dwt.DISPLAY_INLINE);
      fileInput.focus();
    }else {
      fileInput.setDisplay(Dwt.DISPLAY_NONE);
      fileInput.setLocation("-10000px", "-10000px");
    }
    return fileInput;
  }

  public _getRenameInput(): DwtInputField {
    if (!this._renameField) {
      this._renameField = new DwtInputField({
        parent: appCtxt.getShell(),
        className: "RenameInput DwtInputField",
        posStyle: Dwt.ABSOLUTE_STYLE
      });
      this._renameField.setZIndex(Dwt.Z_VIEW + 10); // One layer above the VIEW
      this._renameField.setDisplay(Dwt.DISPLAY_NONE);
      this._renameField.setLocation("-10000px", "-10000px");
      this._renameField.addListener(DwtEvent.ONKEYUP, new AjxListener(this, this._handleKeyUp));
    }
    return this._renameField;
  }

  public _handleKeyUp(ev: DwtKeyEvent): void {
    let allowDefault: boolean = true,
      key: number = DwtKeyEvent.getCharCode(ev),
      item: ZimbraDriveItem = this._fileItem;
    if (key === DwtKeyEvent.KEY_RETURN) {
      this._doRename(item);
      allowDefault = false;
    }
    else if (key === DwtKeyEvent.KEY_ESCAPE) {
      this._redrawItem(item);
      allowDefault = false;
    }
    DwtUiEvent.setBehaviour(ev, true, allowDefault);
  }

  public _mouseDownAction(): void {
    if (this._renameField && this._renameField.getVisibility() && this._fileItem) {
      this._doRename(this._fileItem);
    }
  }

  private _doRename(item: ZimbraDriveItem): void {
    let fileName: string = this._renameField.getValue();
    if (fileName !== "" && (fileName !== item.getName())) {
      let warning: DwtMessageDialog = appCtxt.getMsgDialog();
      if (this._checkDuplicate(fileName)) {
        this._redrawItem(item);
        warning.setMessage(AjxMessageFormat.format(ZmMsg.itemWithFileNameExits, fileName), DwtMessageDialog.CRITICAL_STYLE, "Zimbra Drive");
        warning.popup();
      } else if (ZmAppCtxt.INVALID_NAME_CHARS_RE.test(fileName)) {
        warning.setMessage(AjxMessageFormat.format(ZmMsg.errorInvalidName, AjxStringUtil.htmlEncode(fileName)), DwtMessageDialog.WARNING_STYLE, "Zimbra Drive");
        warning.popup();
      } else {
        this._sendRenameRequest(fileName, item);
      }
    } else {
      this._redrawItem(item);
    }
  }

  private _sendRenameRequest(fileName: string, item: ZimbraDriveItem): void {
    let soapDoc = AjxSoapDoc.create("RenameRequest", "urn:zimbraDrive");
    soapDoc.set(ZDId.F_NEW_NAME, fileName);
    soapDoc.set(ZDId.F_SOURCE_PATH, item.getPath());
    (<ZmZimbraMail>appCtxt.getAppController()).sendRequest({
      soapDoc: soapDoc,
      asyncMode: true,
      callback: new AjxCallback(this, this._renameFileCallback, [fileName]),
      errorCallback: new AjxCallback(this, this._renameFileErrorCallback, [fileName])
    });
  }

  public _renameFileCallback(fileName: string): boolean {
    // It's a rename, need to change only item.path name part
    this._fileItem.setName(fileName);
    let pathArray: string [] = this._fileItem.getPath().split("/");
    pathArray.pop();
    pathArray.push(fileName);
    this._fileItem.setPath(pathArray.join("/"));
    this._fileItemNameEl.textContent = fileName;
    this._enableRenameInput(false);
    this.resetRenameFile();
    let msg: string = ZimbraDriveApp.getMessage("successfulRename"),
      level: number = ZmStatusView.LEVEL_INFO;
    appCtxt.setStatusMsg({msg: msg, level: level});
    ZimbraDriveController.sortCurrentList();
    return true;
  }

  private _renameFileErrorCallback(fileName: string, exception: ZmCsfeException): boolean {
    this.resetRenameFile();
    let exceptionMessage = exception.msg;
    let msg: string = ZimbraDriveApp.getMessage("errorServer"),
      level: number = ZmStatusView.LEVEL_CRITICAL;
    if (exceptionMessage.substring(exceptionMessage.length - 3) === "405") {
      msg = ZimbraDriveApp.getMessage("errorRenameFile", [fileName]);
    }
    appCtxt.setStatusMsg({msg: msg, level: level});
    return true;
  }

  public resetRenameFile(): void {
    this._enableRenameInput(false);
    this._fileItemNameEl = null;
    this._fileItem = null;
  }

  private _redrawItem(item: ZimbraDriveItem): void {
    this.resetRenameFile();
    this._listView[this._currentViewId].redrawItem(item);
  }

  public _preHideCallback(): void {
    this.resetRenameFile();
    return ZmController.prototype._preHideCallback.call(this);
  };

  public _checkDuplicate(name: string): boolean {
    name = name.toLowerCase();
    let list: AjxVector<ZimbraDriveItem> = this._listView[this._currentViewId].getList();
    if (list) {
      let listItems: ZimbraDriveItem[] = list.getArray();
      for (let item of listItems) {
        if (item.getName().toLowerCase() === name)
          return true;
      }
    }
    return false;
  }

  private _newListener(ev: DwtSelectionEvent): void {
    let treeController: ZimbraDriveTreeController = <ZimbraDriveTreeController> appCtxt.getOverviewController().getTreeController(ZimbraDriveApp.TREE_ID);
    treeController.popupNewFolderDialog(this.getCurrentFolder());
  }

  private _moveListener(ev: DwtSelectionEvent): void {
    let treeController: ZimbraDriveTreeController = <ZimbraDriveTreeController> appCtxt.getOverviewController().getTreeController(ZimbraDriveApp.TREE_ID),
      moveDialog: ZimbraDriveChooseFolderDialog = treeController.getChooseFolderDialog();
    let moveParams: ZmFolderSearchFilterGetMoveParamsValue = treeController._getMoveParams(moveDialog);
    let moveDialogOverview: ZmOverview = appCtxt.getOverviewController().getOverview(moveParams.overviewId);
    if (moveDialogOverview) {
      moveDialogOverview.setTreeView(ZimbraDriveApp.TREE_ID);
    }
    // moveParams.hideNewButton = true;
    moveParams.noRootSelect = true;
    ZmController.showDialog(moveDialog, new AjxCallback(this, this._moveCallback, [this._listView[this._currentViewId].getSelection(), moveDialog]), moveParams);
    moveDialog.registerCallback(DwtDialog.CANCEL_BUTTON, this._clearDialog, this, moveDialog);
  }

  private _moveCallback(items: ZimbraDriveItem[], moveDialog: ZimbraDriveChooseFolderDialog, folder: ZimbraDriveFolder): void {
    this.doMove(items, folder);
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

  public static goToFolder(folderPath: string, userInitiated: boolean, givenBatchCommand?: ZmBatchCommand): void {
    folderPath = ZimbraDriveController.checkFolderExists(folderPath) ? folderPath : "/";
    // folder path must have last slash
    let batchCommand: ZmBatchCommand,
      searchParams: ZmSearchControllerSearchParams = {
        query: `in:"${folderPath}"`,
        userInitiated: userInitiated
      };
    if (!givenBatchCommand) {
      batchCommand = new ZmBatchCommand();
    }
    else {
      batchCommand = givenBatchCommand;
    }
    // TODO: ZD-32
    batchCommand.add(new AjxCallback(null, ZimbraDriveApp.loadGetAllFolderRequestParams));
    batchCommand.add(new AjxCallback(null, ZimbraDriveApp.loadSearchRequestParams, [searchParams]));
    batchCommand.run();
  }

  public static checkFolderExists(folderPath: string): boolean {
    let currentFolder: ZimbraDriveFolder;
    for (let tmpFldr of appCtxt.getTree(ZmOrganizer.FOLDER).root.children.getArray()) {
      if (tmpFldr.type === ZDId.ZIMBRADRIVE_ITEM) {
        currentFolder = <ZimbraDriveFolder>tmpFldr;
        break;
      }
    }
    for (let folderName of folderPath.split("/")) {
      if (folderName === "") {
        continue;
      }
      if (currentFolder.hasChild(folderName)) {
        currentFolder = currentFolder.getChild(folderName);
      }
      else {
        return false;
      }
    }
    return true;
  }

  public refreshList(isMainSession: boolean, batchCommand: ZmBatchCommand = new ZmBatchCommand(), folderPath: string = "/"): void {
    if (this.getCurrentFolder()) {
      folderPath = this.getCurrentFolder().getPath(true);
    }
    let searchParams: ZmSearchControllerSearchParams = {
      query: isMainSession ? `in:"${folderPath}"` : this.query,
      userInitiated: !isMainSession
    };
    batchCommand.add(new AjxCallback(null, ZimbraDriveApp.loadSearchRequestParams, [searchParams]));
    batchCommand.run();
  }

  public getCurrentFolder(): ZimbraDriveFolder {
    return this._currentFolder;
  }

  // 'this' can be mainController(isSearchResults === false) or SR-controller(isSearchResults === true)
  public doMove(items: ZimbraDriveItem[]|ZimbraDriveFolder[], folder: ZimbraDriveFolder): void {
    let batchCommand: ZmBatchCommand = new ZmBatchCommand(),
      moveParams: ZimbraDriveMoveParams = {itemsName: [], itemsAlreadyExist: [], itemsError: [], countResponses: 0},
      changeCurrentFolder: boolean = false,
      zdApp: ZimbraDriveApp,
      mainController: ZimbraDriveController;
    if (!this.isSearchResults) {
      mainController = this;
    }
    else {
      zdApp = <ZimbraDriveApp> appCtxt.getApp(ZimbraDriveApp.APP_NAME);
      mainController = zdApp.getZimbraDriveController(ZmApp.MAIN_SESSION);
    }
    for (let item of items) {
      if (!this.checkMoveFeasible(item, folder)) {
        appCtxt.setStatusMsg({msg: item.getName() + " cannot be moved in target destination.", level: ZmStatusView.LEVEL_WARNING});
        return;
      }
      moveParams.itemsName.push(item.getName());
      batchCommand.add(new AjxCallback(null, ZimbraDriveApp.loadMoveRequestParams, [item, folder, batchCommand, moveParams]));
      // check if the current folder view exists and has to change
      if (mainController.getCurrentFolder() && !changeCurrentFolder) {
        changeCurrentFolder =
          item.getPath().length <= mainController.getCurrentFolder().getPath(true).length &&
          item.getPath() === mainController.getCurrentFolder().getPath(true).substring(0, item.getPath().length);
      }
    }
    if (!this.isSearchResults) {
      let nextFolderView: string = changeCurrentFolder ? folder.getPath(true) : this.getCurrentFolder().getPath(true);
      ZimbraDriveController.goToFolder(nextFolderView, false, batchCommand);
    }
    else {
      if (changeCurrentFolder) {
        zdApp.promiseGoToFolder(folder.getPath(true));
      }
      this.refreshList(false, batchCommand);
    }
  }

  public static moveCallback(item: ZimbraDriveItem|ZimbraDriveFolder, destinationFolder: ZimbraDriveFolder, moveParams: ZimbraDriveMoveParams): boolean {
    moveParams.countResponses++;
    // show toast only on each move is done
    if (moveParams.countResponses >= moveParams.itemsName.length) {
      ZimbraDriveController.displayMoveDoneMessage(moveParams);
    }
    // if (item.isItem()) {
    //   (<ZimbraDriveItem> item).setPath(destinationFolder.getPath(true) + (<ZimbraDriveItem> item).getName());
    //   document.getElementById((<ZimbraDriveItem> item).getParentNameElId()).textContent = (<ZimbraDriveItem> item).getParentName();
    //   if (item.isFolder()) {
    //     (<ZimbraDriveFolderItem>item).getFolder()._notify("MOVE");
    //   }
    // }
    // else {
    //   item._notify("MOVE");
    // }
    if (item.isFolder()) {
      let folder: ZimbraDriveFolder = item.isItem() ? (<ZimbraDriveFolderItem>item).getFolder() : <ZimbraDriveFolder> item;
      folder.reparent(destinationFolder);
      folder._notify("MOVE");
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

  public checkMoveFeasible(item: ZimbraDriveItem|ZimbraDriveFolder, destinationFolder: ZimbraDriveFolder): boolean {
    // check if item is folder and contains destination
    if (item.containsTargetPath(destinationFolder.getPath(true)) || destinationFolder.alreadyContainsChild(item.getName())) {
      return false;
    }
    // at last check if move is useless return
    return item.getParentPath() !== destinationFolder.getPath(true);
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

  public static sortItems(itemA: ZimbraDriveItem, itemB: ZimbraDriveItem): number {
    if (itemA.isFolder() && !itemB.isFolder()) { return -1; }
    if (!itemA.isFolder() && itemB.isFolder()) { return 1; }
    if (itemA.getName() > itemB.getName()) { return 1; }
    if (itemA.getName() < itemB.getName()) { return -1; }
    return 0; // TODO: Update this function.
  }

  public static addItemToCurrentList(item: ZimbraDriveItem) {
    let appController: ZimbraDriveController = <ZimbraDriveController> appCtxt.getCurrentController();
    let currentList: ZmList = appController.getList();
    currentList.add(item);
    ZimbraDriveController.sortCurrentList();
  }

  public static sortCurrentList(): void {
    (<ZimbraDriveController> appCtxt.getCurrentController()).getList().getArray().sort(ZimbraDriveController.sortItems);
    (<PreviewPaneView> appCtxt.getCurrentView()).getListView().reRenderListView(true);
  }

  public static removeStartingAndEndingSlash(str: string): string {
    let parsedString = str;
    if (parsedString.charAt(0) === "/") {
      parsedString = parsedString.substring(1);
    }
    if (parsedString.charAt(parsedString.length - 1) === "/") {
      parsedString = parsedString.slice(0, -1);
    }
    return parsedString;
  }
}

export class ZimbraDriveErrorController extends ZmBaseController {

  private _errorMsgElement: HTMLElement;
  private _retrySpanElement: HTMLElement;

  public show(results: ZmCsfeException): void {
    this._setup(this._currentViewId);
    let elements = this.getViewElements(this._currentViewId, <DwtComposite> this._view[this._currentViewId]);
    this._setView({
      view: this._currentViewId,
      viewType: this._currentViewType,
      elements:	elements,
      hide: ZmAppViewMgr.LEFT_NAV,
      isAppView: true
    });
    // if (!this.isSearchResults)
    if (results.msg.indexOf("SSLHandshakeException") > -1) {
      this._errorMsgElement.innerHTML = ZimbraDriveApp.getMessage("errorSSLHandshake");
    }
    else if (results.msg.indexOf("Unauthorized") > -1) {
      this._errorMsgElement.innerHTML = ZimbraDriveApp.getMessage("errorUnauthorized");
    }
    else if (results.msg.indexOf("Bad request") > -1) {
      this._errorMsgElement.innerHTML = ZimbraDriveApp.getMessage("errorNoFolder");
    }
    else {
      this._errorMsgElement.innerHTML = ZimbraDriveApp.getMessage("errorSplash");
    }
    this._retrySpanElement.innerHTML = ZimbraDriveApp.getMessage("retry");
    this._centerElements();
  }

  public _initializeView(view: string): void {
    if (this._view[view]) { return; }
    this._view[view] = new DwtComposite({
      parent: appCtxt.getShell(),
      posStyle: Dwt.ABSOLUTE_STYLE,
      id: view,
      className: "SplashScreen"
    });
    this._view[view].setContent(
      AjxTemplate.expand("com_btactic_drive_open.ZimbraDrive#ServerErrorContainer", {id: view, errMsg: ZimbraDriveApp.getMessage("errorSplash")})
    );
    this._view[view].getHtmlElement().style.textAlign = "center";
    this._errorMsgElement = document.getElementById(`${view}_title`);
    this._retrySpanElement = document.getElementById(`${view}_retry_span`);
    this._retrySpanElement.onclick = function (ev) {
      this.innerHTML += "<br><div style='cursor: none; font-weight: normal; display: inline-block;'>loading...</div>";
      ZimbraDriveController.goToFolder("/", false);
    };
  }

  // Skip init toolbar (strange check )
  public _getToolBarOps(): string[] {
    return [];
  }

  public static getDefaultViewType(): string {
    return ZDId.VIEW_ZIMBRADRIVE_ERROR;
  }

  private _centerElements(): void {
    let contentBox: HTMLElement = this._errorMsgElement.parentElement,
    childrenHeight: number = 50; // Include padding
    for (let i = 0; i < contentBox.childNodes.length; i++) {
      childrenHeight += (<HTMLElement> contentBox.childNodes.item(i)).offsetHeight;
    }
    contentBox.style.paddingTop = String((contentBox.offsetHeight - childrenHeight) / 2);
    this._errorMsgElement.setAttribute("style", "margin-top: " + (contentBox.offsetHeight - childrenHeight) / 2 + "px" );
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
