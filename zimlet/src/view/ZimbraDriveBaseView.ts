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

import {ZmListView, ZmListViewParams} from "../zimbra/zimbraMail/share/view/ZmListView";
import {AjxVector} from "../zimbra/ajax/util/AjxVector";
import {ZimbraDriveItem} from "../ZimbraDriveItem";
import {DwtControl} from "../zimbra/ajax/dwt/widgets/DwtControl";
import {ZDId} from "../ZDId";
import {ZmListController} from "../zimbra/zimbraMail/share/controller/ZmListController";
import {DwtDropTarget} from "../zimbra/ajax/dwt/dnd/DwtDropTarget";
import {DwtComposite} from "../zimbra/ajax/dwt/widgets/DwtComposite";
import {DwtListHeaderItem} from "../zimbra/ajax/dwt/widgets/DwtListView";
import {ZmList} from "../zimbra/zimbraMail/share/model/ZmList";
import {Dwt} from "../zimbra/ajax/dwt/core/Dwt";
import {DwtRectangle} from "../zimbra/ajax/dwt/graphics/DwtRectangle";
import {DwtInputField} from "../zimbra/ajax/dwt/widgets/DwtInputField";
import {appCtxt} from "../zimbra/zimbraMail/appCtxt";
import {DwtEvent} from "../zimbra/ajax/dwt/events/DwtEvent";
import {AjxListener} from "../zimbra/ajax/events/AjxListener";
import {DwtKeyEvent} from "../zimbra/ajax/dwt/events/DwtKeyEvent";
import {DwtUiEvent} from "../zimbra/ajax/dwt/events/DwtUiEvent";
import {DwtMouseEvent} from "../zimbra/ajax/dwt/events/DwtMouseEvent";
import {AjxMessageFormat} from "../zimbra/ajax/util/AjxText";
import {ZmMsg} from "../zimbra/zimbraMail/ZmMsg";
import {DwtMessageDialog} from "../zimbra/ajax/dwt/widgets/DwtMessageDialog";
import {ZmAppCtxt} from "../zimbra/zimbraMail/core/ZmAppCtxt";
import {AjxStringUtil} from "../zimbra/ajax/util/AjxStringUtil";
import {AjxCallback} from "../zimbra/ajax/boot/AjxCallback";
import {AjxSoapDoc} from "../zimbra/ajax/soap/AjxSoapDoc";
import {ZmZimbraMail} from "../zimbra/zimbraMail/core/ZmZimbraMail";
import {ZimbraDriveApp} from "../ZimbraDriveApp";
import {ZmStatusView} from "../zimbra/zimbraMail/share/view/ZmStatusView";
import {ZmCsfeException} from "../zimbra/zimbra/csfe/ZmCsfeException";

export class ZimbraDriveBaseView extends ZmListView {

  public _zmList: ZmList;
  private _renameField: DwtInputField;
  private _fileItem: ZimbraDriveItem;
  private _fileItemNameEl: HTMLElement;

  constructor(params: ZimbraDriveBaseViewParams) {
    params.posStyle = params.posStyle || DwtControl.ABSOLUTE_STYLE;
    params.type = ZDId.ZIMBRADRIVE_ITEM;
    params.pageless = (params.pageless !== false);
    super(<ZmListViewParams>params);
  }

  public renameFile(item: ZimbraDriveItem): void {
    // if preview else
    this._fileItemNameEl = document.getElementById(item.getNameElId());
    let fileNameBounds: DwtRectangle = Dwt.getBounds(this._fileItemNameEl),
      fileInput: DwtInputField = this._enableRenameInput(true, fileNameBounds);

    // fileInput.setValue(item.isRevision ? item.parent.name : item.name);
    fileInput.setValue(item.getName());
    this._fileItem = item;
  };

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
  };

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
    if (DwtKeyEvent.IS_RETURN[key]) {
      this._doRename(item);
      allowDefault = false;
    }
    else if (key === DwtKeyEvent.KEY_ESCAPE) {
      this._redrawItem(item);
      allowDefault = false;
    }
    DwtUiEvent.setBehaviour(ev, true, allowDefault);
  }

  public _mouseDownAction(mouseEv: DwtMouseEvent, div: HTMLElement): void {
    if (this._renameField && this._renameField.getVisibility() && this._fileItem) {
      this._doRename(this._fileItem);
      this.resetRenameFile();
    }
    super._mouseDownAction(mouseEv, div);
  };

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
      this.redrawItem(item);
    }
  }

  private _sendRenameRequest(fileName: string, item: ZimbraDriveItem) {
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
    return true;
  };

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
  };

  private _redrawItem(item: ZimbraDriveItem) {
    this.resetRenameFile();
    this.redrawItem(item);
  };

  public _checkDuplicate(name: string): boolean {
    name = name.toLowerCase();
    let list: AjxVector<ZimbraDriveItem> = this.getList();
    if (list) {
      let listItems: ZimbraDriveItem[] = list.getArray();
      for (let item of listItems) {
        if (item.getName().toLowerCase() === name)
          return true;
      }
    }
    return false;
  };
}

export interface ZimbraDriveBaseViewParams {
  parent: DwtComposite;
  view: string;
  controller: ZmListController;
  pageless?: boolean;
  dropTgt?: DwtDropTarget;
  posStyle?: string;
  type: string;
  headerList?: DwtListHeaderItem[];
  noMaximize?: boolean;
  className?: string;
  deferred?: boolean;
  id?: string;
  parentElement?: string|HTMLElement;
  index?: number;
  template?: string;
  tooltip?: string;
}
