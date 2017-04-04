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
import {ZmMainSearchToolBar, ZmSearchToolBar} from "./zimbra/zimbraMail/share/view/ZmSearchToolBar";
import {AjxCallback} from "./zimbra/ajax/boot/AjxCallback";
import {ZimbraDriveFolder} from "./ZimbraDriveFolder";
import {ZmMsg} from "./zimbra/zimbraMail/ZmMsg";
import {ZmTreeView} from "./zimbra/zimbraMail/share/view/ZmTreeView";
import {ZmBatchCommand} from "./zimbra/zimbra/csfe/ZmBatchCommand";
import {PreviewView} from "./view/PreviewView";
import {ZmComposeView} from "./zimbra/zimbraMail/mail/view/ZmComposeView";
import {DwtMenu} from "./zimbra/ajax/dwt/widgets/DwtMenu";
import {ZmOperation} from "./zimbra/zimbraMail/core/ZmOperation";
import {ZmSearchResultsToolBar} from "./zimbra/zimbraMail/share/view/ZmSearchResultsToolBar";
import {ZmAppViewMgrCreatedViewDescriptor} from "./zimbra/zimbraMail/core/ZmAppViewMgr";

export class ZimbraDriveZimlet extends ZmZimletBase implements CreateAppZimlet {

  private _app: ZimbraDriveApp;

  public init(): void {
    let appCount: number = ZimbraDriveZimlet.getAppCount();
    appCount -= 2;
    if (appCount < 0) appCount = 0;

    this.createApp(
      `${this.getMessage("tabName")}<sup>beta</sup>`,
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
    ZmApp.CLASS[ZimbraDriveApp.APP_NAME] = "ZmZimbraDriveApp";
    this._app = new ZimbraDriveApp(this, DwtShell.getShell(window));
    controller.addApp(this._app);

    let searchDomainData: SearchDomainData = {
      icon: "ZimbraDrive-icon",
      text: this.getMessage("searchZimbraDrive"),
      listener: new AjxListener(this, this.onSearchRequested)
    };
    this.addSearchDomainItem(
      searchDomainData.icon,
      searchDomainData.text,
      searchDomainData.listener,
      ZmId.getMenuItemId(ZmId.SEARCH, ZDId.ZIMBRADRIVE_ITEM)
    );
    // Dirty hack to set the correct default search item also for this non-app
    let searchToolbar: ZmMainSearchToolBar = appCtxt.getSearchController().getSearchToolbar();
    if (searchToolbar) {
      let menu = searchToolbar.getButton(ZmSearchToolBar.TYPES_BUTTON).getMenu();
      let menuChildren = menu.getChildren();
      for (let mi of menuChildren) {
        if ((mi.getData(ZmOperation.MENUITEM_ID) === ZmId.SEARCH_CUSTOM)) {
          let tmpSDD: SearchDomainData = mi.getData(ZmMainSearchToolBar.CUSTOM_ITEM_ID);
          if (tmpSDD.icon === searchDomainData.icon && tmpSDD.text === searchDomainData.text) {
            mi.setData(ZmOperation.MENUITEM_ID, ZDId.ZIMBRADRIVE_ITEM);
          }
        }
      }
    }

    let searchToolbarMenu: DwtMenu = appCtxt.getSearchController().getSearchToolbar().getButton(ZmSearchToolBar.TYPES_BUTTON).getMenu();
    // There is any function to get the menu item!! just a getMenuItemById() where id is a zimbra id or "CUSTOM"!!
    for (let menuItem of searchToolbarMenu.getItems()) {
      if (menuItem.getHTMLElId() === ZmId.getMenuItemId(ZmId.SEARCH, ZDId.ZIMBRADRIVE_ITEM)) {
        menuItem.setText(this.getMessage("searchZimbraDrive"));
      }
    }
    return this._app.getName();
  }

  public appActive(appName: string, active: boolean): void {}
  public appLaunch(appName: string): void {}
  public onSelectApp(id: string): void {}

  private onSearchRequested(ev: KeyboardEvent|DwtSelectionEvent): void {
    const searchToolbar: ZmMainSearchToolBar = appCtxt.getSearchController().getSearchToolbar();
    let searchValue: string = searchToolbar.getSearchFieldValue().trim();
    if (searchValue === "") {
      let searchView: ZmAppViewMgrCreatedViewDescriptor = appCtxt.getAppViewMgr()._getView(
        appCtxt.getCurrentViewId() &&
        appCtxt.getCurrentViewId().replace("ZDRIVE_DLV-", "")
      );
      if (searchView && searchView.component && searchView.component["searchResultsToolbar"]) {
        searchValue = (<ZmSearchResultsToolBar> searchView.component["searchResultsToolbar"]).getSearchFieldValue();
      }
    }
    if (searchValue !== "") {
      ZimbraDriveController.goToFolder(searchValue, true);
    }
  }

  public initializeAttachPopup(attachMenu: DwtMenu, composeView: ZmComposeView): void {
    composeView._createAttachMenuItem(attachMenu, ZimbraDriveApp.getMessage("zimletLabel"), new AjxListener(this._app, this._app.popupAttachDialog, composeView));
  }

}

interface SearchDomainData {
  icon: string;
  text: string;
  listener: AjxListener;
}

interface ZimletWindow extends Window {
  com_zextras_drive_open_hdlr: Function;
  ZmZimbraDriveController: Function;
  ZmZimbraDriveTreeController: Function;
  ZmZimbraDriveItem: Function;
  ZmZimbraDriveFolder: Function;
  ZmZimbraDrivePreviewView: Function;
}

ZmOverviewController.CONTROLLER[ZimbraDriveApp.TREE_ID] = "ZmZimbraDriveTreeController";
ZmApp.SETTING[ZimbraDriveApp.APP_NAME] = ZimbraDriveApp.ZIMBRADRIVE_ENABLED;
ZmApp.OVERVIEW_TREES[ZimbraDriveApp.APP_NAME] = [ZimbraDriveApp.TREE_ID];
ZmApp.APPS.push(ZimbraDriveApp.APP_NAME);
ZmApp.ORGANIZER[ZimbraDriveApp.APP_NAME] = ZimbraDriveApp.APP_NAME;
ZmOrganizer.DISPLAY_ORDER[ZimbraDriveApp.APP_NAME] = 100;
ZmOrganizer.TREE_TYPE[ZimbraDriveApp.TREE_ID] = ZmOrganizer.FOLDER;
ZmOrganizer.LABEL[ZDId.ZIMBRADRIVE_ITEM] = "zimbraDriveFolders";
ZmOrganizer.APP[ZDId.ZIMBRADRIVE_ITEM] = ZimbraDriveApp.APP_NAME;
ZmTreeView.COMPARE_FUNC[ZDId.ZIMBRADRIVE_ITEM] = "ZmZimbraDriveFolder.sortFcn";
ZmApp.HIDE_ZIMLETS[ZimbraDriveApp.APP_NAME] = true;

(<ZimletWindow>window).ZmZimbraDriveTreeController = ZimbraDriveTreeController;
(<ZimletWindow>window).ZmZimbraDriveController = ZimbraDriveController;
(<ZimletWindow>window).ZmZimbraDriveItem = ZimbraDriveItem;
(<ZimletWindow>window).ZmZimbraDriveFolder = ZimbraDriveFolder;
(<ZimletWindow>window).ZmZimbraDrivePreviewView = PreviewView;
(<ZimletWindow>window).com_zextras_drive_open_hdlr = ZimbraDriveZimlet;
