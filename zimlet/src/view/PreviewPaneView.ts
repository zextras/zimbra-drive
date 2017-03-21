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
import {DetailListView} from "./DetailListView";
import {DwtDropTarget} from "../zimbra/ajax/dwt/dnd/DwtDropTarget";
import {ZimbraDriveController} from "../ZimbraDriveController";
import {Dwt} from "../zimbra/ajax/dwt/core/Dwt";
import {ZmSetting} from "../zimbra/zimbraMail/share/model/ZmSetting";
import {ZmItem} from "../zimbra/zimbraMail/share/model/ZmItem";
import {AjxVector} from "../zimbra/ajax/util/AjxVector";
import {ZimbraDriveItem} from "../ZimbraDriveItem";
import {DwtSash} from "../zimbra/ajax/dwt/widgets/DwtSash";
import {AjxEnv} from "../zimbra/ajax/boot/AjxEnv";
import {DwtListView} from "../zimbra/ajax/dwt/widgets/DwtListView";
import {PreviewView} from "./PreviewView";
import {DwtControl} from "../zimbra/ajax/dwt/widgets/DwtControl";
import {AjxListener} from "../zimbra/ajax/events/AjxListener";
import {AjxTimedAction} from "../zimbra/ajax/util/AjxTimedAction";
import {DwtSelectionEvent} from "../zimbra/ajax/dwt/events/DwtSelectionEvent";
import {appCtxt} from "../zimbra/zimbraMail/appCtxt";
import {ZmSearch} from "../zimbra/zimbraMail/share/model/ZmSearch";
import {ZmMsg} from "../zimbra/zimbraMail/ZmMsg";
import {ZmList} from "../zimbra/zimbraMail/share/model/ZmList";

export class PreviewPaneView extends DwtComposite {

  private _controller: ZimbraDriveController;
  private _detailListView: DetailListView;
  private _lastResetWidth: number;
  private _lastResetHeight: number;
  private _previewView: PreviewView;
  private _vertMsgSash: DwtSash;
  private _horizMsgSash: DwtSash;
  private _listSelectionShortcutDelayAction: AjxTimedAction;
  private _listSelectionShortcutDelayActionId: number;
  private _delayedSelectionItem: ZimbraDriveItem;
  private _minMLVHeight: number;
  private _vertSashX: number;
  private _horizSashY: number;

  private static SASH_THRESHOLD: number = 5;
  private static LIST_SELECTION_SHORTCUT_DELAY: number = 300;

  constructor(parent: DwtComposite, controller: ZimbraDriveController, dropTgt: DwtDropTarget) {
    super({
      parent: parent,
      posStyle: Dwt.ABSOLUTE_STYLE
    });

    this._controller = controller;

    this._vertMsgSash = new DwtSash({parent: this, style: DwtSash.HORIZONTAL_STYLE, className: "AppSash-horiz",
      threshold: PreviewPaneView.SASH_THRESHOLD, posStyle: Dwt.ABSOLUTE_STYLE});
    this._vertMsgSash.registerCallback(this._sashCallback, this);

    this._horizMsgSash = new DwtSash({parent: this, style: DwtSash.VERTICAL_STYLE, className: "AppSash-vert",
      threshold: PreviewPaneView.SASH_THRESHOLD, posStyle: Dwt.ABSOLUTE_STYLE});
    this._horizMsgSash.registerCallback(this._sashCallback, this);

    this._previewView = new PreviewView(this, DwtControl.ABSOLUTE_STYLE, this._controller);

    this._detailListView = new DetailListView(this, this._controller, this._controller._dropTgt);
    this._detailListView.addSelectionListener(new AjxListener(this, this._listSelectionListener));
    this._listSelectionShortcutDelayAction = new AjxTimedAction(this, this._listSelectionTimedAction);
    this._delayedSelectionItem = null;
    this.setReadingPane();
  }

  public getController(): ZimbraDriveController {
    return this._controller;
  };

  public getListView(): DetailListView {
    return this._detailListView;
  }

  public getPreviewView(): PreviewView {
    return this._previewView;
  }

  private setReadingPane(): void {
    let tlv = this._detailListView,
      tv = this._previewView;
    let readingPaneEnabled = this._controller.isReadingPaneOn();
    if (!readingPaneEnabled) {
      tv.setVisible(false);
      this._vertMsgSash.setVisible(false);
      this._horizMsgSash.setVisible(false);
    } else {
      tv.setVisible(true);
      let readingPaneOnRight = this._controller.isReadingPaneOnRight();
      let newSash = readingPaneOnRight ? this._vertMsgSash : this._horizMsgSash;
      let oldSash = readingPaneOnRight ? this._horizMsgSash : this._vertMsgSash;
      oldSash.setVisible(false);
      newSash.setVisible(true);
    }
    tlv.reRenderListView();
    let sz = this.getSize();
    this._resetSize(sz.x, sz.y, true);
  }

  public setBounds(x: number, y: number, width: number, height: number): void {
    super.setBounds(x, y, width, height);
    this._resetSize(width, height);
  };

  private _resetSize(newWidth: number, newHeight: number, force?: boolean): void {
    if (newWidth <= 0 || newHeight <= 0) { return; }
    if (!force && newWidth === this._lastResetWidth && newHeight === this._lastResetHeight) { return; }

    let readingPaneOnRight = this._controller.isReadingPaneOnRight();

    if (this._previewView.getVisible()) {
      let sash = this.getSash();
      let sashSize = sash.getSize();
      let sashThickness = readingPaneOnRight ? sashSize.x : sashSize.y;
      if (readingPaneOnRight) {
        let listViewWidth = this._vertSashX || (Number(ZmMsg.LISTVIEW_WIDTH)) || Math.floor(newWidth / 2.5);
        this._detailListView.resetSize(listViewWidth, newHeight);
        sash.setLocation(listViewWidth, 0);
        this._previewView.setBounds(listViewWidth + sashThickness, 0,
          newWidth - (listViewWidth + sashThickness), newHeight);
      } else {
        let listViewHeight = this._horizSashY || (Math.floor(newHeight / 2.5) - DwtListView.HEADERITEM_HEIGHT);
        this._detailListView.resetSize(newWidth, listViewHeight);
        sash.setLocation(0, listViewHeight);
        this._previewView.setBounds(0, listViewHeight + sashThickness, newWidth,
          newHeight - (listViewHeight + sashThickness));
      }
    } else {
      this._detailListView.resetSize(newWidth, newHeight);
    }
    this._detailListView._resetColWidth();

    this._lastResetWidth = newWidth;
    this._lastResetHeight = newHeight;
  }

  public _sashCallback(delta: number): number {
    let readingPaneOnRight = this._controller.isReadingPaneOnRight();
    if (delta > 0) {
      if (readingPaneOnRight) {
        // moving sash right
        let minMsgViewWidth = 300;
        let currentMsgWidth = this._previewView.getSize(true).x;
        delta = Math.max(0, Math.min(delta, currentMsgWidth - minMsgViewWidth));
        let newListWidth = ((AjxEnv.isIE) ? this._vertMsgSash.getLocation().x : this._detailListView.getSize(true).x) + delta;
        if (delta > 0) {
          this._detailListView.resetSize(newListWidth, Dwt.DEFAULT);
          this._previewView.setBounds(this._previewView.getLocation().x + delta, Dwt.DEFAULT,
            currentMsgWidth - delta, Dwt.DEFAULT);

        } else {
          delta = 0;
        }

      } else {
        // moving sash down
        let newMsgViewHeight = this._previewView.getSize().y - delta;
        let minMsgViewHeight = 150;
        if (newMsgViewHeight > minMsgViewHeight) {
          this._detailListView.resetSize(Dwt.DEFAULT, this._detailListView.getSize(true).y + delta);
          this._previewView.setBounds(Dwt.DEFAULT, this._previewView.getLocation().y + delta,
            Dwt.DEFAULT, newMsgViewHeight);
        } else {
          delta = 0;
        }
      }
    } else {
      let absDelta = Math.abs(delta);

      if (readingPaneOnRight) {
        // moving sash left
        let currentWidth = this._vertMsgSash.getLocation().x;
        absDelta = Math.max(0, Math.min(absDelta, currentWidth - 300));

        if (absDelta > 0) {
          delta = -absDelta;
          this._detailListView.resetSize(currentWidth - absDelta, Dwt.DEFAULT);
          this._previewView.setBounds(this._previewView.getLocation().x - absDelta, Dwt.DEFAULT,
            this._previewView.getSize(true).x + absDelta, Dwt.DEFAULT);
        } else {
          delta = 0;
        }
      } else {
        // moving sash up
        if (!this._minMLVHeight) {
          let list = this._detailListView.getList();
          if (list && list.size()) {
            let item = list.get(0);
            let div = document.getElementById(this._detailListView._getItemId(item));
            this._minMLVHeight = DwtListView.HEADERITEM_HEIGHT + (Dwt.getSize(div).y * 2);
          } else {
            this._minMLVHeight = DwtListView.HEADERITEM_HEIGHT;
          }
        }

        if (this.getSash().getLocation().y - absDelta > this._minMLVHeight) {
          // moving sash up
          this._detailListView.resetSize(Dwt.DEFAULT, this._detailListView.getSize(true).y - absDelta);
          this._previewView.setBounds(Dwt.DEFAULT, this._previewView.getLocation().y - absDelta,
            Dwt.DEFAULT, this._previewView.getSize(true).y + absDelta);
        } else {
          delta = 0;
        }
      }
    }

    if (delta) {
      this._detailListView._resetColWidth();
      if (readingPaneOnRight) {
        this._vertSashX = this._vertMsgSash.getLocation().x;
      } else {
        this._horizSashY = this._horizMsgSash.getLocation().y;
      }
    }

    return delta;
  }

  public resetPreviewPane(newPreviewStatus: string, oldPreviewStatus: string): void {
    this._detailListView._colHeaderActionMenu = null;  // Action menu needs to be recreated as it's different for different views

    this.setReadingPane();

    if (oldPreviewStatus === ZmSetting.RP_OFF) {
      this._selectFirstItem();
    }
  }

  private getSelection(): ZmItem[] {
    return <ZmItem[]>this._detailListView.getSelection();
  }

  private _selectFirstItem(): void {
    let list: AjxVector<ZimbraDriveItem> = this._detailListView.getList();
    let selectedItem: ZimbraDriveItem = list ? list.get(0) : null;
    if (selectedItem && !selectedItem.isFolder()) {
      this._detailListView.setSelection(selectedItem);
    }
  }

  public getSash(): DwtSash {
    let readingPaneOnRight = this._controller.isReadingPaneOnRight();
    return readingPaneOnRight ? this._vertMsgSash : this._horizMsgSash;
  };


  public _listSelectionListener(ev: DwtSelectionEvent, item?: ZimbraDriveItem): void {
    item = item || <ZimbraDriveItem> ev.item;
    if (!item) {
      return;
    }

    let cs: ZmSearch = appCtxt.isOffline && appCtxt.getCurrentSearch();
    if (cs) {
      appCtxt.accountList.setActiveAccount(item.getAccount());
    }

    if (this._controller.isReadingPaneOn() && item) {
      if (ev.kbNavEvent) {
        if (this._listSelectionShortcutDelayActionId) {
          AjxTimedAction.cancelAction(this._listSelectionShortcutDelayActionId);
        }
        this._delayedSelectionItem = item;
        this._listSelectionShortcutDelayActionId = AjxTimedAction.scheduleAction(
          this._listSelectionShortcutDelayAction,
          PreviewPaneView.LIST_SELECTION_SHORTCUT_DELAY
        );
      } else {
        this._previewView.set(item);
      }
    }
  };

  public _listSelectionTimedAction(): void {
    if (!this._delayedSelectionItem) {
      return;
    }
    if (this._listSelectionShortcutDelayActionId) {
      AjxTimedAction.cancelAction(this._listSelectionShortcutDelayActionId);
    }
    this._previewView.set(this._delayedSelectionItem);
  };

  public set(list: ZmList, sortField?: string): void {
    this._detailListView.set(list, sortField);
    list = <ZmList> this._detailListView._zmList;
    if (list)
      list.addChangeListener(new AjxListener(this, this._listViewChangeListener));
    this._previewView.set(null);
  };

  public _listViewChangeListener(ev: DwtSelectionEvent): void {
    let items: ZimbraDriveItem[] = this._detailListView.getSelection();
    let item = items[0];
    if (item) {
      this._listSelectionListener(ev, item);
    }else {
      this._previewView.enablePreview(false);
    }

  };
}
