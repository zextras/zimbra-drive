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
import {appCtxt} from "../zimbra/zimbraMail/appCtxt";
import {AjxListener} from "../zimbra/ajax/events/AjxListener";
import {DwtSelectionEvent} from "../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {DwtTreeItem} from "../zimbra/ajax/dwt/widgets/DwtTreeItem";
import {ZmList} from "../zimbra/zimbraMail/share/model/ZmList";
import {ZimbraDriveIconView} from "./ZimbraDriveIconView";
import {ZimbraDriveBaseViewParams} from "./ZimbraDriveBaseView";
import {ZimbraDriveController} from "../ZimbraDriveController";
import {ZmComposeController} from "../zimbra/zimbraMail/mail/controller/ZmComposeController";
import {ZmApp} from "../zimbra/zimbraMail/core/ZmApp";
import {ZimbraDriveItem} from "../ZimbraDriveItem";

export class ZimbraDriveTabView extends DwtComposite {

  public static view: string = "ZIMBRA_DRIVE_ATTACH_VIEW";
  private static OVERVIEW_ID: string = "ZIMBRA_DRIVE_ATTACH_OVERVIEW";

  private _tableID: string;
  private _folderTreeCellId: string;
  private _folderListId: string;
  private _folderDisplayed: string;
  private _isLoadingFolder: boolean;
  private _controller: ZimbraDriveController;

  constructor(zimbraDriveAttachDialog: ZimbraDriveAttachDialog, className?: string) {
    super({parent: zimbraDriveAttachDialog, className: className, posStyle: Dwt.STATIC_STYLE});
    this._createHtml();
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
    params.types = [ZDId.ITEM_ZIMBRADRIVE];
    params.checkTypes = true;
    let search = new ZmSearch(params);
    search.execute({
      callback: searchCallback,
      batchCmd: batchCommand
    });
  }

  private _handleResponseDoSearch(result: ZmCsfeResult): boolean {
    // Overview
    let opc = appCtxt.getOverviewController();
    let overview = opc.getOverview(ZimbraDriveTabView.OVERVIEW_ID);
    if (!overview) {
      let ovParams = {
        overviewId: ZimbraDriveTabView.OVERVIEW_ID,
        overviewClass: "ZimbraDriveTabBox ZimbraDriveOverviewBox",
        headerClass: "DwtTreeItem",
        noTooltips: true,
        treeIds: [ZimbraDriveApp.TREE_ID],
        account: appCtxt.getActiveAccount(),
        isAppOverview: true,
        appName: ZimbraDriveApp.APP_NAME
      };
      overview = opc.createOverview(ovParams);
      overview.set([ZimbraDriveApp.TREE_ID]);
      document.getElementById(this._folderTreeCellId).appendChild(overview.getHtmlElement());
    }
    else {
      overview.set([ZimbraDriveApp.TREE_ID]);
    }
    let treeView = overview.getTreeView(ZimbraDriveApp.TREE_ID);
    treeView.addSelectionListener(new AjxListener(this, this._treeListener));
    treeView.getHeaderItem().setVisible(false, true);
    treeView.setSelection(<DwtTreeItem> treeView.getHeaderItem().getChildren()[0], true, false, true);
    // Listview
    let app: ZimbraDriveApp = <ZimbraDriveApp> appCtxt.getApp(ZimbraDriveApp.APP_NAME);
    if (!this._controller ) {
      this._controller = app.getZimbraDriveController(ZmApp.MAIN_SESSION);
    }
    if (!this._controller._listView[ZimbraDriveTabView.view]) {
      let listParams: ZimbraDriveBaseViewParams = {
        parent: this._controller._container,
        className: "ZimbraDriveTabBox ZimbraDriveListBox",
        type: ZDId.ZIMBRADRIVE_ITEM,
        view: ZimbraDriveTabView.view,
        controller: this._controller
      };
      this._controller._listView[ZimbraDriveTabView.view] = new ZimbraDriveIconView(listParams);
      document.getElementById(this._folderListId).appendChild(this._controller._listView[ZimbraDriveTabView.view].getHtmlElement());
    }

    this._handleResponseDoSearchUpdateList(result);
    document.getElementById(this._tableID).style.display = "block";
    return true;
  }

  private _handleResponseDoSearchUpdateList(result: ZmCsfeResult): boolean {
    this._isLoadingFolder = false;
    let results: ZmSearchResult = <ZmSearchResult> (result && result.getResponse()),
      itemsResults: ZmList = results.getResults(ZDId.ZIMBRADRIVE_ITEM);
    let firstItem: ZimbraDriveItem = itemsResults.getArray().length > 0 && <ZimbraDriveItem> itemsResults.getArray()[0];
    if (firstItem && firstItem.getName && !firstItem.getName()) {
      itemsResults.getArray().pop();
    }
    this._controller._listView[ZimbraDriveTabView.view].set(itemsResults);
    return true;
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
        "com_btactic_drive_open.ZimbraDrive#AttachDialog",
        {
          id: this._tableID,
          folderTreeCellId: this._folderTreeCellId,
          folderListId: this._folderListId
        }
      )
    );
  }

  public showFolderContent(): void {
    document.getElementById(this._tableID).style.display = "none";
    this._folderDisplayed = "/";
    this._isLoadingFolder = true;
    let batchCommand: ZmBatchCommand = new ZmBatchCommand();
    // TODO: ZD-32
    batchCommand.add(new AjxCallback(null, ZimbraDriveApp.loadGetAllFolderRequestParams));
    batchCommand.add(new AjxCallback(this, this.loadSearchRequestParams, [`in:"${this._folderDisplayed}"`, new AjxCallback(this, this._handleResponseDoSearch)]));
    batchCommand.run();
  }

  public uploadFiles(composeController: ZmComposeController): void {
    this._controller.sendFilesAsAttachment(this._controller._listView[ZimbraDriveTabView.view].getSelection(), composeController);
  }

}