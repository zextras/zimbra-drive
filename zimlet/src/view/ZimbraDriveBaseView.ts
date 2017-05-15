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
import {ZimbraDriveController} from "../ZimbraDriveController";

export class ZimbraDriveBaseView extends ZmListView {

  public _zmList: ZmList;

  constructor(params: ZimbraDriveBaseViewParams) {
    params.posStyle = params.posStyle || DwtControl.ABSOLUTE_STYLE;
    params.type = ZDId.ZIMBRADRIVE_ITEM;
    params.pageless = (params.pageless !== false);
    super(<ZmListViewParams>params);
  }

  public _mouseDownAction(mouseEv: DwtMouseEvent, div: HTMLElement): void {
    (<ZimbraDriveController> this._controller)._mouseDownAction();
    super._mouseDownAction(mouseEv, div);
  }

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
