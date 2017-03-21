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

import {DwtComposite} from "../zimbra/ajax/dwt/widgets/DwtComposite";
import {ZimbraDriveAttachDialog} from "./ZimbraDriveAttachDialog";
import {Dwt} from "../zimbra/ajax/dwt/core/Dwt";
import {AjxCallback} from "../zimbra/ajax/boot/AjxCallback";
import {AjxTemplate} from "../zimbra/ajax/boot/AjxTemplate";
import {ZmBatchCommand} from "../zimbra/zimbra/csfe/ZmBatchCommand";
import {ZimbraDriveApp} from "../ZimbraDriveApp";
import {ZmSearchControllerSearchParams} from "../zimbra/zimbraMail/share/controller/ZmSearchController";
import {ZDId} from "../ZDId";
import {ZmSearch} from "../zimbra/zimbraMail/share/model/ZmSearch";
import {ZmSearchResult} from "../zimbra/zimbraMail/share/model/ZmSearchResult";
import {ZmCsfeResult} from "../zimbra/zimbra/csfe/ZmCsfeResult";
import {ZimbraDriveFolderTree} from "../ZimbraDriveFolderTree";
import {appCtxt} from "../zimbra/zimbraMail/appCtxt";
import {ZimbraDriveFolder} from "../ZimbraDriveFolder";
import {ZimbraDriveTreeController} from "../ZimbraDriveTreeController";
import {AjxListener} from "../zimbra/ajax/events/AjxListener";
import {DwtSelectionEvent} from "../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {DwtTreeItem} from "../zimbra/ajax/dwt/widgets/DwtTreeItem";
import {ZmList} from "../zimbra/zimbraMail/share/model/ZmList";
import {ZimbraDriveIconView} from "./ZimbraDriveIconView";
import {ZimbraDriveBaseViewParams} from "./ZimbraDriveBaseView";
import {ZimbraDriveController} from "../ZimbraDriveController";

export class ZimbraDriveTabView extends DwtComposite {

  public static view: string = "ZIMBRA_DRIVE_ATTACH_VIEW";
  private static OVERVIEW_ID: string = "ZIMBRA_DRIVE_ATTACH_OVERVIEW";

  private _tableID: string;
  private _folderTreeCellId: string;
  private _folderListId: string;
  private _folderDisplayed: string = "/";
  private _isLoadingFolder: boolean = false;
  private _listView: ZimbraDriveIconView;

  constructor(zimbraDriveAttachDialog: ZimbraDriveAttachDialog, className?: string) {
    super({parent: zimbraDriveAttachDialog, className: className, posStyle: Dwt.STATIC_STYLE});
    this._createHtml();
    // this.showMe();
  }

  public loadSearchRequestParams(query: string, searchCallback: AjxCallback, batchCommand?: ZmBatchCommand): void {
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
    search.execute({
      callback: searchCallback,
      batchCmd: batchCommand
    });
  }

  private _handleResponseDoSearch(result: ZmCsfeResult) {
    let results: ZmSearchResult = <ZmSearchResult> (result && result.getResponse());
    let query: string = results.getAttribute("query"),
      currentFolderPath = query.replace("in:\"", "").replace("\"", "");
    let tree: ZimbraDriveFolderTree = <ZimbraDriveFolderTree> appCtxt.getTree(ZimbraDriveApp.APP_NAME),
      treeFolder: ZimbraDriveFolder = <ZimbraDriveFolder> tree.root.getChildByPath("Drive" + currentFolderPath.slice(0, -1)),
      treeController: ZimbraDriveTreeController = <ZimbraDriveTreeController> appCtxt.getOverviewController().getTreeController(ZimbraDriveApp.APP_NAME);
    treeController.setCurrentFolder(treeFolder);
    // Overview
    let opc = appCtxt.getOverviewController();
    let overview = opc.getOverview(ZimbraDriveTabView.OVERVIEW_ID);
    if (!overview) {
      let ovParams = {
        overviewId: ZimbraDriveTabView.OVERVIEW_ID,
        overviewClass: "ZimbraDriveTabBox ZimbraDriveOverviewBox",
        headerClass: "DwtTreeItem",
        noTooltips: true,
        treeIds: [ZimbraDriveApp.APP_NAME],
        account: appCtxt.getActiveAccount(),
        isAppOverview: true,
        appName: ZimbraDriveApp.APP_NAME
      };
      overview = opc.createOverview(ovParams);
      overview.set([ZimbraDriveApp.APP_NAME]);
      document.getElementById(this._folderTreeCellId).appendChild(overview.getHtmlElement());
      let treeView = overview.getTreeView(ZimbraDriveApp.APP_NAME);
      treeView.addSelectionListener(new AjxListener(this, this._treeListener));
      treeView.getHeaderItem().setVisible(false, true);
      treeView.setSelection(<DwtTreeItem> treeView.getHeaderItem().getChild(0), true, false, true);
    }
    // Listview
    let app: ZimbraDriveApp = <ZimbraDriveApp> appCtxt.getApp(ZimbraDriveApp.APP_NAME),
      controller = new ZimbraDriveController(app._container, app);

    let listParams: ZimbraDriveBaseViewParams = {
      parent: controller._container,
      className: "ZimbraDriveTabBox ZimbraDriveListBox",
      type: ZDId.ZIMBRADRIVE_ITEM,
      view: ZimbraDriveTabView.view,
      controller: controller
    };
    this._listView = controller._listView[ZimbraDriveTabView.view] =  new ZimbraDriveIconView(listParams);
    document.getElementById(this._folderListId).appendChild(this._listView.getHtmlElement());
    let itemsResults: ZmList = results.getResults(ZDId.ZIMBRADRIVE_ITEM);
    this._listView.set(itemsResults);
  }

  private _handleResponseDoSearchUpdateList(result: ZmCsfeResult) {
    this._isLoadingFolder = false;
    let results: ZmSearchResult = <ZmSearchResult> (result && result.getResponse()),
      itemsResults: ZmList = results.getResults(ZDId.ZIMBRADRIVE_ITEM);
    this._listView.set(itemsResults);
    console.log("Update called, folder:" + results.getAttribute("query"));
  }

  private _treeListener(ev: DwtSelectionEvent): void {
    let selectedPath: string = ev.item.getData(Dwt.KEY_OBJECT).getPath(true);
    if (selectedPath !== this._folderDisplayed && !this._isLoadingFolder) {
      this._folderDisplayed = selectedPath;
      this._isLoadingFolder = true;
      let batchCommand: ZmBatchCommand = new ZmBatchCommand();
      batchCommand.add(new AjxCallback(this, this.loadSearchRequestParams, [`in:"${selectedPath}"`, new AjxCallback(this, this._handleResponseDoSearchUpdateList)]));
      batchCommand.run();
    }
  }

  public _createHtml(): void {
    this._tableID = Dwt.getNextId();
    this._folderTreeCellId = Dwt.getNextId();
    this._folderListId = Dwt.getNextId();
    this.setContent(
      AjxTemplate.expand(
        "com_zextras_drive_open.ZimbraDrive#AttachDialog",
        {
          id: this._tableID,
          folderTreeCellId: this._folderTreeCellId,
          folderListId: this._folderListId
        }
      )
    );
    this.showFolderContent("/");

    // var loadCallback = new AjxCallback(this, this._createHtml1);
    // AjxDispatcher.require(["BriefcaseCore", "Briefcase"], false, loadCallback);
  };

  public showFolderContent(path: string): void {
    let batchCommand: ZmBatchCommand = new ZmBatchCommand();
    batchCommand.add(new AjxCallback(null, ZimbraDriveApp.loadGetAllFolderRequestParams));
    batchCommand.add(new AjxCallback(this, this.loadSearchRequestParams, [`in:"${path}"`, new AjxCallback(this, this._handleResponseDoSearch)]));
    batchCommand.run();
  }

  public uploadFiles(): void {}
}