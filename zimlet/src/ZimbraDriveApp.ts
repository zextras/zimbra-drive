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

import {ZmZimletApp, ZmZimletAppLaunchParams} from "./zimbra/zimbraMail/share/view/ZmZimletApp";
import {DwtControl} from "./zimbra/ajax/dwt/widgets/DwtControl";
import {ZimbraDriveZimlet} from "./com_zextras_drive_open_hdlr";
import {ZimbraDriveController, ZimbraDriveMoveParams} from "./ZimbraDriveController";
import {ZmSearchResult} from "./zimbra/zimbraMail/share/model/ZmSearchResult";
import {ZmSearchResultsController} from "./zimbra/zimbraMail/share/controller/ZmSearchResultsController";
import {AjxDispatcher} from "./zimbra/ajax/boot/AjxDispatcher";
import {ZmApp, ShowSearchResultsApp, DefineApiApp, RegisterItemsApp} from "./zimbra/zimbraMail/core/ZmApp";
import {AjxCallback} from "./zimbra/ajax/boot/AjxCallback";
import {ZmZimbraMail, SetNewButtonPropsParams} from "./zimbra/zimbraMail/core/ZmZimbraMail";
import {appCtxt} from "./zimbra/zimbraMail/appCtxt";
import {ZmSearchControllerSearchParams} from "./zimbra/zimbraMail/share/controller/ZmSearchController";
import {ZDId} from "./ZDId";
import {ZmItem} from "./zimbra/zimbraMail/share/model/ZmItem";
import {ZmList} from "./zimbra/zimbraMail/share/model/ZmList";
import {ZmSearch} from "./zimbra/zimbraMail/share/model/ZmSearch";
import {ZmBatchCommand} from "./zimbra/zimbra/csfe/ZmBatchCommand";
import {ZmCsfeResult} from "./zimbra/zimbra/csfe/ZmCsfeResult";
import {ZimbraDriveFolderObj, ZimbraDriveFolder} from "./ZimbraDriveFolder";
import {GetAllFoldersResponse} from "./GetAllFoldersResponse";
import {ZimbraDriveFolderTree} from "./ZimbraDriveFolderTree";
import {ZmCsfeException} from "./zimbra/zimbra/csfe/ZmCsfeException";
import {ZmRequestMgrSendRequestParams} from "./zimbra/zimbraMail/core/ZmRequestMgr";
import {AjxSoapDoc} from "./zimbra/ajax/soap/AjxSoapDoc";
import {ZmOperation} from "./zimbra/zimbraMail/core/ZmOperation";
import {ZimbraDriveItem} from "./ZimbraDriveItem";
import {ZmStatusView} from "./zimbra/zimbraMail/share/view/ZmStatusView";
import {AjxMessageFormat} from "./zimbra/ajax/util/AjxText";
import {ZmOverviewParams} from "./zimbra/zimbraMail/share/view/ZmOverview";
import {ZimbraDriveOverview} from "./view/ZimbraDriveOverview";
import {DwtToolBarButton} from "./zimbra/ajax/dwt/widgets/DwtToolBar";
import {ZmActionMenu} from "./zimbra/zimbraMail/share/view/ZmActionMenu";
import {DwtMenu} from "./zimbra/ajax/dwt/widgets/DwtMenu";
import {DwtShell} from "./zimbra/ajax/dwt/widgets/DwtShell";
import {DwtEvent} from "./zimbra/ajax/dwt/events/DwtEvent";
import {ZmMsg} from "./zimbra/zimbraMail/ZmMsg";
import {ZmSettings} from "./zimbra/zimbraMail/share/model/ZmSettings";
import {ZmSetting} from "./zimbra/zimbraMail/share/model/ZmSetting";
import {ZimbraDriveAttachDialog} from "./view/ZimbraDriveAttachDialog";

declare let com_zextras_drive_open: {[label: string]: string};

export class ZimbraDriveApp extends ZmZimletApp implements DefineApiApp, RegisterItemsApp, ShowSearchResultsApp {

  public static APP_NAME: string = "ZIMBRA_DRIVE";
  public static TREE_ID: string = "ZIMBRA_DRIVE";
  public static URN: string = "urn:zimbraDrive";
  public static ZIMBRADRIVE_ENABLED: string = "ZIMBRA_DRIVE_ENABLED";

  public static SEARCH_REQ: string = "SearchRequest";
  public static SEARCH_RESP: string = "SearchResponse";
  public static GET_ALL_FOLDERS_REQ: string = "GetAllFoldersRequest";
  public static GET_ALL_FOLDERS_RESP: string = "GetAllFoldersResponse";
  public static NEW_DIRECTORY_RESP: string = "NewDirectoryResponse";

  public static DOWNLOAD_URL: string = "service/extension/ZimbraDrive_Download";
  public static UPLOAD_URL: string = "service/extension/ZimbraDrive_Upload";
  public static CREATE_TEMP_FILES_URL: string = "service/extension/ZimbraDrive_CreateTempFiles";

  private _defaultNewButtonMenu: DwtMenu;
  private _zimbraDriveNewButtonMenu: ZmActionMenu;
  private _attachDialog: ZimbraDriveAttachDialog;

  constructor(zimlet: ZimbraDriveZimlet, container: DwtControl) {
    super(ZimbraDriveApp.APP_NAME, zimlet, container);
  }

  public launch(params?: ZmZimletAppLaunchParams, callback?: AjxCallback): void {
    this._setLaunchTime(this.toString(), new Date());
    let newButton: DwtToolBarButton = (<ZmZimbraMail> appCtxt.getAppController()).getNewButton();
    this._defaultNewButtonMenu = newButton.getMenu(true);
    ZimbraDriveController.goToFolder("/");
    if (callback) { callback.run(); }
  }

  public _registerApp(): void {
    let newItemsOps: {[opName: string]: string} = {};
    newItemsOps[ZDId.ZD_NEW_FILE] = ZDId.ZD_NEW_FILE;
    ZmApp.registerApp(
      ZimbraDriveApp.APP_NAME,
      {
        mainPkg: ZimbraDriveApp.APP_NAME,
        nameKey: ZimbraDriveApp.APP_NAME,
        icon: "ZimbraDrive-icon",
        textPrecedence: 50,
        newItemOps: newItemsOps
      }
    );
  }

  public _registerSettings(settings: ZmSettings): void {
    settings = settings || appCtxt.getSettings();
    settings.registerSetting(
      ZimbraDriveApp.ZIMBRADRIVE_ENABLED,
      {
        name: "zimbraFeatureZimbraDriveEnabled",
        type: ZmSetting.T_COS,
        dataType: ZmSetting.D_BOOLEAN,
        defaultValue: true
      }
    );
  }

  public handleOp(operation: string) {
    this._zimbraDriveNewButtonMenu.getMenuItem(operation).notifyListeners(DwtEvent.SELECTION, DwtShell.selectionEvent);
  }

  public static loadGetAllFolderRequestParams(batchCommand: ZmBatchCommand): void {
    batchCommand.addRequestParams(
      AjxSoapDoc.create(ZimbraDriveApp.GET_ALL_FOLDERS_REQ, ZimbraDriveApp.URN),
      new AjxCallback(null, ZimbraDriveApp.onGetAllFolders),
      new AjxCallback(null, ZimbraDriveApp.onGetAllFoldersError)
    );
  }

  public static loadSearchRequestParams(query: string, batchCommand?: ZmBatchCommand): void {
    let params: ZmSearchControllerSearchParams = {query:  query};
    params.soapInfo = {
      method: ZimbraDriveApp.SEARCH_REQ,
      response: ZimbraDriveApp.SEARCH_RESP,
      namespace: ZimbraDriveApp.URN,
      additional: {}
    };
    params.searchFor = ZDId.ITEM_ZIMBRADRIVE;
    params.types = [ZDId.ZIMBRADRIVE_ITEM];
    params.checkTypes = true;
    let search = new ZmSearch(params);
    search.execute(
      {
        callback: new AjxCallback(
          appCtxt.getSearchController(),
          appCtxt.getSearchController()._handleResponseDoSearch,
          [search, false, undefined, false]
        ),
        batchCmd: batchCommand
      }
    );
  }

  public static loadMoveRequestParams(
    item:  ZimbraDriveItem|ZimbraDriveFolder,
    destinationFolder: ZimbraDriveFolder,
    batchCommand: ZmBatchCommand,
    moveParams: ZimbraDriveMoveParams
  ): void {
    let soapDoc = AjxSoapDoc.create("MoveRequest", "urn:zimbraDrive");
    soapDoc.set(ZDId.F_SOURCE_PATH, ZimbraDriveController.getDroppedItemPath(item));
    soapDoc.set(ZDId.F_TARGET_PATH, destinationFolder.getPath(true));
    batchCommand.addRequestParams(
      soapDoc,
      new AjxCallback(null, ZimbraDriveController._moveCallback, [moveParams]),
      new AjxCallback(null, ZimbraDriveController._moveErrorCallback, [item, moveParams])
    );
  }

  public _defineAPI(): void {
    AjxDispatcher.registerMethod("GetZimbraDriveController", [], new AjxCallback(this, this.getZimbraDriveController));
  }

  public _registerItems(): void {
    ZmItem.registerItem(
      ZDId.ZIMBRADRIVE_ITEM,
      {
        app: ZimbraDriveApp.APP_NAME,
        nameKey: "file",
        icon: "GenericDoc",
        soapCmd: "ItemAction",
        itemClass: "ZmZimbraDriveItem",
        node: "doc-drive",
        organizer: ZimbraDriveApp.APP_NAME,
        dropTargets: [], // ZmOrganizer.TAG, ZmOrganizer.BRIEFCASE
        searchType: "document",
        resultsList: AjxCallback.simpleClosure(function(search: ZmSearch) {
            // AjxDispatcher.require("BriefcaseCore");
            return new ZmList(ZDId.ZIMBRADRIVE_ITEM, search);
          }, this)
      }
    );
    // Register zimbra drive buttons
    ZimbraDriveApp._registerZimbraDriveOperationsButtons();
  }

  private static _registerZimbraDriveOperationsButtons(): void {
    ZmOperation.registerOp(
      ZDId.ZD_NEW_FILE,
      {
        textKey: "uploadDocs",
        tooltipKey: "uploadNewFile",
        image: "Upload",
        textPrecedence: 70,
        showImageInToolbar: true,
        showTextInToolbar: true
      }
    );
    ZmOperation.registerOp(
      ZDId.ZD_SAVE_FILE,
      {
        textKey: "saveFile",
        tooltipKey: "saveFileTooltip",
        image: "DownArrow",
        showImageInToolbar: true,
        showTextInToolbar: true
      }
    );
    ZmOperation.registerOp(
      ZDId.ZD_SAVE_FOLDER,
      {
        textKey: "downloadFolder",
        tooltipKey: "saveFileTooltip",
        image: "DownArrow",
        showImageInToolbar: true,
        showTextInToolbar: true
      }
    );
    ZmOperation.registerOp(
      ZDId.ZD_NEW_FOLDER,
      {
        textKey: "newFolder",
        tooltipKey: "newFolderTooltip",
        image: "NewFolder",
        showImageInToolbar: true,
        showTextInToolbar: true
      }
    );
    ZmOperation.registerOp(
      ZDId.ZD_DELETE,
      {
        textKey: "del",
        tooltipKey: "deleteTooltip",
        image: "Delete",
        textPrecedence: 60,
        showImageInToolbar: true,
        showTextInToolbar: true
      }
    );
    ZmOperation.registerOp(
      ZDId.ZD_MOVE,
      {
        textKey: "move",
        tooltipKey: "moveTooltip",
        image: "MoveToFolder",
        textPrecedence: 40,
        showImageInToolbar: true,
        showTextInToolbar: true
      }
    );
    ZmOperation.registerOp(
      ZDId.ZD_RENAME,
      {
        textKey: "rename",
        image: "FileRename",
        showImageInToolbar: true,
        showTextInToolbar: true
      }
    );
  }

  public showSearchResults(results: ZmSearchResult, loadCallback: AjxCallback, searchResultsController?: ZmSearchResultsController): void {
    let sessionId: string = searchResultsController ? searchResultsController.getCurrentViewId() : ZmApp.MAIN_SESSION;
    let controller: ZimbraDriveController = AjxDispatcher.run("GetZimbraDriveController", sessionId, searchResultsController);
    controller.show(results);
    this._setLoadedTime(this.toString(), new Date());
    if (loadCallback) {
      loadCallback.run(controller);
    }
  }

  // TODO: Invoked after the dropdown menu creation, this is not a "real app". Using the {@see ZmZimletBase} method
  // public _setupSearchToolbar(): void {
  //   ZmSearchToolBar.addMenuItem(
  //     ZmItem.BRIEFCASE_ITEM,
  //     {
  //       msgKey: "searchBriefcase",
  //       tooltipKey: "searchForFiles",
  //       icon: "ZimbraDrive-icon",
  //       shareIcon: null, // the following doesn't work now, so keep the regular icon. doesn't really matter in my opinion --> "SharedBriefcase",
  //       setting: ZmSetting.BRIEFCASE_ENABLED,
  //       id: ZmId.getMenuItemId(ZmId.SEARCH, ZDId.ZIMBRADRIVE_ITEM),
  //       disableOffline: true
  //     }
  //   );
  // }

  private getZimbraDriveController(sessionId: string, searchResultsController?: ZmSearchResultsController): ZimbraDriveController {
    return <ZimbraDriveController>this.getSessionController({
      controllerClass: "ZmZimbraDriveController",
      sessionId: sessionId || ZmApp.MAIN_SESSION,
      searchResultsController: searchResultsController
    });
  }

  private static onGetAllFolders(result: ZmCsfeResult): boolean {
    const root: ZimbraDriveFolderObj = (<GetAllFoldersResponse>result.getResponse()[ZimbraDriveApp.GET_ALL_FOLDERS_RESP]).root[0];
    root.name = "";
    let tree: ZimbraDriveFolderTree = <ZimbraDriveFolderTree> appCtxt.getTree(ZimbraDriveApp.APP_NAME);
    if (!tree) {
      tree = new ZimbraDriveFolderTree();
      appCtxt.setTree(ZimbraDriveApp.APP_NAME, tree);
    }
    tree.root = ZimbraDriveFolder.createFromDom(root, {tree: tree});
    // TODO save and apply axpand/collapsed folders
    appCtxt.getOverviewController().getTreeView("main_" + ZimbraDriveApp.APP_NAME, ZimbraDriveApp.APP_NAME);
    return true; // handled
  }

  private static onGetAllFoldersError(err: ZmCsfeException, req: ZmRequestMgrSendRequestParams): boolean {
    appCtxt.setStatusMsg(
      {
        msg: ZimbraDriveApp.getMessage("errorOnGetAllFolder"),
        level: ZmStatusView.LEVEL_CRITICAL
      }
    );
    return true; // handled
  }


  public static getMessage(msg: string, substitutions?: string[]): string {
    try {
      return AjxMessageFormat.format(com_zextras_drive_open[msg], substitutions);
    }
    catch (error) {
      return msg;
    }
  }

  public getOverviewPanelContent(): ZimbraDriveOverview {
    if (!this._overviewPanelContent) {
      let params: ZmOverviewParams = this._getOverviewParams();
      params.overviewId = this.getOverviewId();
      params.parent = params.parent || appCtxt.getShell();
      this._overviewPanelContent = new ZimbraDriveOverview(params, appCtxt.getOverviewController());
      appCtxt.getOverviewController()._overview[params.overviewId] = this._overviewPanelContent;
      this._overviewPanelContent.set(this._getOverviewTrees());
    }
    return <ZimbraDriveOverview> this._overviewPanelContent;
  }

  public getNewButtonProps(): SetNewButtonPropsParams {
    return {
      text: ZmMsg.uploadDocs,
      tooltip: ZmMsg.uploadDocs,
      defaultId: ZDId.ZD_NEW_FILE
    };
  }

  public activate(active: boolean, viewId: string) {
    super.activate(active, viewId);
    let toolbarButton = (<ZmZimbraMail> appCtxt.getAppController()).getNewButton();
    if (active) {
      toolbarButton.setMenu(this.getZDNewButtonMenu());
    }
    else {
      toolbarButton.setMenu(this._defaultNewButtonMenu);
    }
  }

  public getZDNewButtonMenu(): ZmActionMenu {
    let toolbarButton = (<ZmZimbraMail> appCtxt.getAppController()).getNewButton();
    if (!this._zimbraDriveNewButtonMenu) {
      // hack to trigger listener registration in NewButton if dropdown menu was never triggered
      toolbarButton._dropDownEvtMgr.notifyListeners(DwtEvent.SELECTION, DwtShell.selectionEvent);
      toolbarButton.getMenu().popdown();
      // then a new menu can be set

      let list = [ZDId.ZD_NEW_FILE, ZDId.ZD_NEW_FOLDER];
      this._zimbraDriveNewButtonMenu = new ZmActionMenu({parent: toolbarButton, menuItems: list});
    }
    return this._zimbraDriveNewButtonMenu;
  }

  public runRefresh(): void {
    if (this.isActive() && ZimbraDriveController.getCurrentFolder()) {
      ZimbraDriveController.goToFolder(ZimbraDriveController.getCurrentFolder().getPath(true));
    }
  }

  public popupAttachDialog(): void {
    if (!this._attachDialog) {
      this._attachDialog = new ZimbraDriveAttachDialog(appCtxt.getShell(), ZimbraDriveAttachDialog.CLASSNAME);
    }
    this._attachDialog.getDriveView();
    this._attachDialog.popup();
  }
}
