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

import {ZmZimletBase, CreateAppZimlet} from "./zimbra/zimbraMail/share/model/ZmZimletBase";
import {ZmApp} from "./zimbra/zimbraMail/core/ZmApp";
import {appCtxt} from "./zimbra/zimbraMail/appCtxt";
import {AjxDispatcher} from "./zimbra/ajax/boot/AjxDispatcher";
import {DwtShell} from "./zimbra/ajax/dwt/widgets/DwtShell";
import {ZimbraDriveApp} from "./ZimbraDriveApp";
import {ZmZimbraMail} from "./zimbra/zimbraMail/core/ZmZimbraMail";
import {ZmAppButtonParams} from "./zimbra/zimbraMail/share/view/ZmAppButton";
import {ZmOverviewController} from "./zimbra/zimbraMail/share/controller/ZmOverviewController";
import {ZmOrganizer} from "./zimbra/zimbraMail/share/model/ZmOrganizer";
import {ZimbraDriveTreeController} from "./ZimbraDriveTreeController";
import {ZimbraDriveController} from "./ZimbraDriveController";
import {ZimbraDriveItem} from "./ZimbraDriveItem";
import {ZmId} from "./zimbra/zimbraMail/core/ZmId";
import {ZDId} from "./ZDId";
import {AjxListener} from "./zimbra/ajax/events/AjxListener";
import {DwtSelectionEvent} from "./zimbra/ajax/dwt/events/DwtSelectionEvent";
import {ZmMainSearchToolBar} from "./zimbra/zimbraMail/share/view/ZmSearchToolBar";
import {AjxCallback} from "./zimbra/ajax/boot/AjxCallback";
import {ZmCsfeResult} from "./zimbra/zimbra/csfe/ZmCsfeResult";
import {GetAllFoldersResponse} from "./GetAllFoldersResponse";
import {ZmCsfeException} from "./zimbra/zimbra/csfe/ZmCsfeException";
import {ZmRequestMgrSendRequestParams} from "./zimbra/zimbraMail/core/ZmRequestMgr";
import {ZimbraDriveFolderObj, ZimbraDriveFolder} from "./ZimbraDriveFolder";
import {ZimbraDriveFolderTree} from "./ZimbraDriveFolderTree";
import {ZmMsg} from "./zimbra/zimbraMail/ZmMsg";
import {ZmTreeView} from "./zimbra/zimbraMail/share/view/ZmTreeView";
import {ZmBatchCommand} from "./zimbra/zimbra/csfe/ZmBatchCommand";
import {PreviewView} from "./view/PreviewView";
import {ZmComposeView} from "./zimbra/zimbraMail/mail/view/ZmComposeView";
import {DwtMenu} from "./zimbra/ajax/dwt/widgets/DwtMenu";

export class ZimbraDriveZimlet extends ZmZimletBase implements CreateAppZimlet {

  private _app: ZimbraDriveApp;

  public init(): void {
    let appCount: number = ZimbraDriveZimlet.getAppCount();
    appCount -= 2;
    if (appCount < 0) appCount = 0;

    this.createApp(
      this.getMessage("tabName"),
      "ZimbraDrive-icon",
      this.getMessage("zimletDescription"),
      appCount
    );
    ZmMsg.zimbraDriveFolders = ZmMsg.folders;
    ZmMsg.downloadFolder = ZimbraDriveApp.getMessage("downloadFolder");
  }

  private static getAppCount(): number {
    let count = 0;
    for (let appName in ZmApp.ENABLED_APPS) {
      if (!ZmApp.ENABLED_APPS.hasOwnProperty(appName)) { continue; }
      count++;
    }
    return count;
  }

  public createApp(label: string, image: string, tooltip: string, index?: number, style?: string): string {
    AjxDispatcher.require("ZimletApp");
    const controller: ZmZimbraMail = <ZmZimbraMail>appCtxt.getAppController();
    const params: ZmAppButtonParams = {
      text: label,
      image: image,
      tooltip: tooltip,
      style: style,
      index: index
    };
    controller.getAppChooser().addButton(ZimbraDriveApp.APP_NAME, params);
    // appCtxt.getSettings().registerSetting(
    //   ZimbraDriveApp.APP_NAME,
    //   {
    //     name: "zimbraFeatureZimbraDriveEnabled",
    //     type: ZmSetting.T_COS,
    //     dataType: ZmSetting.D_BOOLEAN,
    //     defaultValue: true
    //   }
    // );
    ZmApp.CLASS[ZimbraDriveApp.APP_NAME] = "ZmZimbraDriveApp";
    this._app = new ZimbraDriveApp(this, DwtShell.getShell(window));
    controller.addApp(this._app);

    this.addSearchDomainItem(
      "ZimbraDrive-icon",
      this.getMessage("searchZimbraDrive"),
      new AjxListener(this, this.onSearchRequested),
      ZmId.getMenuItemId(ZmId.SEARCH, ZDId.ZIMBRADRIVE_ITEM)
    );

    return this._app.getName();
  }

  public appActive(appName: string, active: boolean): void {}
  public appLaunch(appName: string): void {}
  public onSelectApp(id: string): void {}
  public onAction(id: string, action: string, currentViewId: string, lastViewId: string): void {}

  private onSearchRequested(ev: KeyboardEvent|DwtSelectionEvent): void {
    const searchToolbar: ZmMainSearchToolBar = appCtxt.getSearchController().getSearchToolbar();
    let searchValue: string = searchToolbar.getSearchFieldValue().trim();
    let hasDoubleQuotesString: string = `in:"`;
    if (searchValue.indexOf(hasDoubleQuotesString) === -1) {
      searchValue = `${searchValue.replace(`in:`, hasDoubleQuotesString)}"`;
    }
    if (searchValue.substring(searchValue.length - 2, searchValue.length - 1) !== "/") {
      searchValue = `${searchValue.substring(0, searchValue.length - 1)}/"`;
    }

    let batchCommand = new ZmBatchCommand();
    batchCommand.add(new AjxCallback(null, ZimbraDriveApp.loadGetAllFolderRequestParams));
    batchCommand.add(new AjxCallback(null, ZimbraDriveApp.loadSearchRequestParams, [searchValue]));
    batchCommand.run();
  }

  private onGetAllFolders(result: ZmCsfeResult) {
    const root: ZimbraDriveFolderObj = (<GetAllFoldersResponse>result.getResponse()[ZimbraDriveApp.GET_ALL_FOLDERS_RESP]).root[0];
    const tree = new ZimbraDriveFolderTree();
    tree.root = ZimbraDriveFolder.createFromDom(root, {tree: tree});
    appCtxt.setTree(ZimbraDriveApp.APP_NAME, tree);
  }

  private onGetAllFoldersError(err: ZmCsfeException, req: ZmRequestMgrSendRequestParams) {
    console.log(err, req);
  }

  public initializeAttachPopup(attachMenu: DwtMenu, composeView: ZmComposeView) {
    composeView._createAttachMenuItem(attachMenu, ZimbraDriveApp.getMessage("zimletLabel"), new AjxListener(this._app, this._app.popupAttachDialog));
  }

}

interface ZimletWindow extends Window {
  com_zextras_drive_open_hdlr: Function;
  ZmZimbraDriveController: Function;
  ZmZimbraDriveTreeController: Function;
  ZmZimbraDriveItem: Function;
  ZmZimbraDriveFolder: Function;
  ZmZimbraDrivePreviewView: Function;
}

ZmOverviewController.CONTROLLER[ZimbraDriveApp.APP_NAME] = "ZmZimbraDriveTreeController";
ZmApp.SETTING[ZimbraDriveApp.APP_NAME] = ZimbraDriveApp.ZIMBRADRIVE_ENABLED;
ZmApp.OVERVIEW_TREES[ZimbraDriveApp.APP_NAME] = [ZimbraDriveApp.TREE_ID];
ZmApp.APPS.push(ZimbraDriveApp.APP_NAME);
ZmOrganizer.DISPLAY_ORDER[ZimbraDriveApp.APP_NAME] = 100;
ZmOrganizer.TREE_TYPE[ZimbraDriveApp.APP_NAME] = ZimbraDriveApp.APP_NAME;
ZmOrganizer.LABEL[ZimbraDriveApp.APP_NAME] = "zimbraDriveFolders";
ZmTreeView.COMPARE_FUNC[ZimbraDriveApp.APP_NAME] = "ZmZimbraDriveFolder.sortFcn";

(<ZimletWindow>window).ZmZimbraDriveTreeController = ZimbraDriveTreeController;
(<ZimletWindow>window).ZmZimbraDriveController = ZimbraDriveController;
(<ZimletWindow>window).ZmZimbraDriveItem = ZimbraDriveItem;
(<ZimletWindow>window).ZmZimbraDriveFolder = ZimbraDriveFolder;
(<ZimletWindow>window).ZmZimbraDrivePreviewView = PreviewView;
(<ZimletWindow>window).com_zextras_drive_open_hdlr = ZimbraDriveZimlet;
