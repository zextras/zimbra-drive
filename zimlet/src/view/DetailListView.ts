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

import {ZimbraDriveBaseView} from "./ZimbraDriveBaseView";
import {DwtComposite} from "../zimbra/ajax/dwt/widgets/DwtComposite";
import {ZimbraDriveController} from "../ZimbraDriveController";
import {DwtDropTarget} from "../zimbra/ajax/dwt/dnd/DwtDropTarget";
import {DwtListView, DwtListHeaderItem} from "../zimbra/ajax/dwt/widgets/DwtListView";
import {ZmItem} from "../zimbra/zimbraMail/share/model/ZmItem";
import {ZmMsg} from "../zimbra/zimbraMail/ZmMsg";
import {Dwt} from "../zimbra/ajax/dwt/core/Dwt";
import {ZimbraDriveItem} from "../ZimbraDriveItem";
import {ZmMimeTable, ZmMimeInfoData} from "../zimbra/zimbraMail/core/ZmMimeTable";
import {AjxDateUtil} from "../zimbra/ajax/util/AjxDateUtil";
import {AjxUtil} from "../zimbra/ajax/util/AjxUtil";
import {ZmActionMenu} from "../zimbra/zimbraMail/share/view/ZmActionMenu";
import {ZimbraDriveFolder} from "../ZimbraDriveFolder";
import {ZmList} from "../zimbra/zimbraMail/share/model/ZmList";
import {ZimbraDriveFolderItem} from "../ZimbraDriveFolderItem";
import {ZDId} from "../ZDId";
import {DwtDragSource} from "../zimbra/ajax/dwt/dnd/DwtDragSource";
import {AjxListener} from "../zimbra/ajax/events/AjxListener";
import {ZmDragAndDrop} from "../zimbra/zimbraMail/share/view/ZmDragAndDrop";
import {DwtDragEvent} from "../zimbra/ajax/dwt/dnd/DwtDragEvent";
import {DwtDropEvent} from "../zimbra/ajax/dwt/dnd/DwtDropEvent";
import {AjxMessageFormat} from "../zimbra/ajax/util/AjxText";
import {AjxEnv} from "../zimbra/ajax/boot/AjxEnv";

export class DetailListView extends ZimbraDriveBaseView {

  public static ROW_DOUBLE_CLASS: string = "RowDouble";
  public static COLWIDTH_ICON: number = 20;

  private _isMultiColumn: boolean;
  private headerColCreated: boolean;
  private _normalClass: string;
  private _controller: ZimbraDriveController;

  public _colHeaderActionMenu: ZmActionMenu;
  private _dragSrc: DwtDragSource;
  private _dropTgt: DwtDropTarget;
  private _dnd: ZmDragAndDrop;

  constructor(parent: DwtComposite, controller: ZimbraDriveController, dropTarget: DwtDropTarget) {
    super({
      view: controller.getCurrentViewId(),
      parent: parent,
      controller: controller,
      headerList: DetailListView._getHeaderList(controller.isReadingPaneOnRight()),
      dropTgt: dropTarget,
      type: ZDId.ZIMBRADRIVE_ITEM
    });
    this._controller = controller;

    if (controller.supportsDnD()) {
      this._dragSrc = new DwtDragSource(Dwt.DND_DROP_MOVE);
      this._dragSrc.addDragListener(new AjxListener(this, this._dragListener));
      this.setDragSource(this._dragSrc);

      this._dropTgt = new DwtDropTarget("DetailListView");
      this._dropTgt.markAsMultiple();
      this._dropTgt.addDropListener(new AjxListener(this, this._dropListener));
      this.setDropTarget(this._dropTgt);
    }
    // Finder to DetailView drag and drop
    this._initDragAndDrop();
  }

  public _dragListener(ev: DwtDragEvent): void {
    if (ev.action === DwtDragEvent.SET_DATA) {
      ev.srcData = { data: (<DwtListView>ev.srcControl).getDnDSelection(), controller: this };
    }
  };

  public _dropListener(ev: DwtDropEvent): void {
    let data: ZimbraDriveItem| ZimbraDriveItem[]| ZimbraDriveFolder| ZimbraDriveFolder[] = ev.srcData.data;
    let div = this.getTargetItemDiv(ev.uiEvent);
    let dropFolder = this.getItemFromElement(div);

    if (ev.action === DwtDropEvent.DRAG_DROP) {
      this.dragDeselect(div);
      if (dropFolder && dropFolder.folder) {
        let items: ZimbraDriveItem[]|ZimbraDriveFolder[] = <ZimbraDriveItem[]|ZimbraDriveFolder[]> ((data instanceof Array) ? data : [data]);
        ZimbraDriveController.doMove(items, dropFolder.folder);
      }
    } else if (ev.action === DwtDropEvent.DRAG_LEAVE) {
      this.dragDeselect(div);
    } else if (ev.action === DwtDropEvent.DRAG_OP_CHANGED) {
      // nothing
    }
  };

  public _initDragAndDrop(): void {
    this._dnd = new ZmDragAndDrop(this);
  };

  public isMultiColumn(controller?: ZimbraDriveController): boolean {
    let ctlr = controller || this._controller;
    return !ctlr.isReadingPaneOnRight();
  };

  public reRenderListView(force?: boolean): void {
    let isMultiColumn: boolean = this.isMultiColumn();
    if (isMultiColumn !== this._isMultiColumn || force) {
      this._saveState({ selection: true, focus: true, scroll: true, expansion: true});
      this._isMultiColumn = isMultiColumn;
      this.headerColCreated = false;
      this._headerList = DetailListView._getHeaderList(isMultiColumn);
      this._rowHeight = null;
      this._normalClass = isMultiColumn ? DwtListView.ROW_CLASS : DetailListView.ROW_DOUBLE_CLASS;
      let list: ZmList = <ZmList> this._controller.getList() || (new ZmList(ZDId.ZIMBRADRIVE_ITEM));
      this.set(list);
      this._restoreState();
    }
  }

  public _resetColWidth(): void {
    if (!this.headerColCreated) { return; }

    let lastColIdx = this._getLastColumnIndex();
    if (lastColIdx) {
      let lastCol = this._headerList[lastColIdx];
      if (lastCol._field !== ZimbraDriveItem.F_SORTED_BY) {
        DwtListView.prototype._resetColWidth.apply(this, arguments);
      }
    }
  }

  private static _getHeaderList(isMultiColumn: boolean): DwtListHeaderItem[] {
    let headers: DwtListHeaderItem[] = [];
    if (isMultiColumn) {
      // TODO: revision
      // if (this._revisionView) {
      //   headers.push(new DwtListHeaderItem({field:ZmItem.F_EXPAND, icon: "NodeCollapsed", width:ZmDetailListView.COLWIDTH_ICON, name:ZmMsg.expand}));
      // }
      // TODO: add
      headers.push(
        new DwtListHeaderItem({ field: ZimbraDriveItem.F_EMPTY, width: DetailListView.COLWIDTH_ICON }),
        new DwtListHeaderItem({ field: ZimbraDriveItem.F_ICON,  icon: "GenericDoc", resizeable: false, name: ZmMsg.icon, width: DetailListView.COLWIDTH_ICON }),
        new DwtListHeaderItem({ field: ZimbraDriveItem.F_NAME, text: ZmMsg._name, sortable: ZimbraDriveItem.F_NAME }),
        new DwtListHeaderItem({ field: ZimbraDriveItem.F_FILE_TYPE, text: ZmMsg.type, width: ZmMsg.COLUMN_WIDTH_TYPE_DLV, sortable: ZimbraDriveItem.F_FILE_TYPE }),
        new DwtListHeaderItem({ field: ZimbraDriveItem.F_SIZE, text: ZmMsg.size, align: "left", width: ZmMsg.COLUMN_WIDTH_SIZE_DLV, sortable: ZimbraDriveItem.F_SIZE}),
        new DwtListHeaderItem({ field: ZimbraDriveItem.F_DATE, text: ZmMsg.modified, align: "left", width: ZmMsg.COLUMN_WIDTH_DATE_DLV, sortable: ZimbraDriveItem.F_DATE}),
        new DwtListHeaderItem({ field: ZimbraDriveItem.F_FROM, text: ZmMsg.author, align: "left", width: ZmMsg.COLUMN_WIDTH_FOLDER_DLV}),
        new DwtListHeaderItem({ field: ZimbraDriveItem.F_FOLDER, text: ZmMsg.folder, align: "left", width: ZmMsg.COLUMN_WIDTH_FOLDER_DLV}),
        new DwtListHeaderItem({ field: ZimbraDriveItem.F_LOCK, icon: "", width: DetailListView.COLWIDTH_ICON })
      );
    } else {
      headers.push(new DwtListHeaderItem({field: ZimbraDriveItem.F_SORTED_BY, text: AjxMessageFormat.format(ZmMsg.arrangedBy, ZmMsg._name), resizeable: false}));
    }
    return headers;
  }

  public resetSize(newWidth: number, newHeight: number): void {
    this.setSize(newWidth, newHeight);
    let height = (newHeight === Dwt.DEFAULT) ? newHeight : newHeight - DwtListView.HEADERITEM_HEIGHT;
    Dwt.setSize(this._parentEl, newWidth, height);
  }

  public _getCellContents(htmlArr: string[], idx: number, item: any, field: string, colIdx: number, params?: {now?: Date}, classes?: string[]): number {
    if (item.isFolder()) {
      let zimbraDriveFolder: ZimbraDriveFolderItem = <ZimbraDriveFolderItem> item;
      if (field === ZimbraDriveItem.F_ICON) {
        idx = this._getImageHtml(htmlArr, idx, "Folder", this._getFieldId(zimbraDriveFolder, field), classes);
      } else if (field === ZimbraDriveItem.F_NAME) {
        zimbraDriveFolder.setNameElId(this._getFieldId(item, ZimbraDriveItem.F_NAME));
        htmlArr[idx++] = "<div id='" + zimbraDriveFolder.getNameElId() + "'>" + zimbraDriveFolder.getName() + "</div>";
      } else if (field === ZimbraDriveItem.F_FILE_TYPE) {
        htmlArr[idx++] = ZmMsg.folder;
      } else if (field === ZimbraDriveItem.F_SIZE) {
        htmlArr[idx++] = ZmMsg.folder;
      } else if (field === ZimbraDriveItem.F_DATE) {
        htmlArr[idx++] = "";
      } else if (field === ZimbraDriveItem.F_FROM) {
        htmlArr[idx++] = zimbraDriveFolder.getAuthor();
      } else if (field === ZimbraDriveItem.F_FOLDER) {
        let path: string = ZimbraDriveController.getCurrentFolderPath().slice(0, -1);
        htmlArr[idx++] = path.substring(path.lastIndexOf("/") + 1);
        // or zimbraDriveFolder.parentName
      } else if (field === ZimbraDriveItem.F_SORTED_BY) {
        htmlArr[idx++] = this._getAbridgedContent(item, colIdx);
      }
    }
    else {
      let zimbraDriveItem: ZimbraDriveItem = <ZimbraDriveItem> item;
      if (field === ZimbraDriveItem.F_ICON) {
        let mimeInfo: ZmMimeInfoData = ZmMimeTable.getInfo(zimbraDriveItem.getMimetype());
        idx = this._getImageHtml(htmlArr, idx, mimeInfo.image, this._getFieldId(zimbraDriveItem, field), classes);
      } else if (field === ZimbraDriveItem.F_NAME) {
        zimbraDriveItem.setNameElId(this._getFieldId(item, ZimbraDriveItem.F_NAME));
        htmlArr[idx++] = "<div id='" + zimbraDriveItem.getNameElId() + "'>" + zimbraDriveItem.getName() + "</div>";
      } else if (field === ZimbraDriveItem.F_FILE_TYPE) {
        let mimeInfo: ZmMimeInfoData = ZmMimeTable.getInfo(zimbraDriveItem.getMimetype());
        htmlArr[idx++] = mimeInfo ? mimeInfo.desc : "&nbsp;";
      } else if (field === ZimbraDriveItem.F_SIZE) {
        htmlArr[idx++] = zimbraDriveItem.isFolder() ? ZmMsg.folder : AjxUtil.formatSize(zimbraDriveItem.getSize());
      } else if (field === ZimbraDriveItem.F_DATE) {
        htmlArr[idx++] = AjxDateUtil.simpleComputeDateStr(new Date(zimbraDriveItem.getModifiedTimeMillis()));
      } else if (field === ZimbraDriveItem.F_FROM) {
        htmlArr[idx++] = zimbraDriveItem.getAuthor();
      } else if (field === ZimbraDriveItem.F_FOLDER) {
        let path: string = ZimbraDriveController.getCurrentFolderPath().slice(0, -1);
        htmlArr[idx++] = path.substring(path.lastIndexOf("/") + 1);
      } else if (field === ZimbraDriveItem.F_SORTED_BY) {
        htmlArr[idx++] = this._getAbridgedContent(item, colIdx);
      }
    }
    return idx;
  }

  public _getAbridgedContent(zimbraDriveItem: ZimbraDriveItem, colIdx: number): string {
    let idx: number = 0, html: string[] = [];
    let width = (AjxEnv.isIE || AjxEnv.isSafari) ? 22 : 16;
    html[idx++] = "<table width=100% class='TopRow'><tr>";
    // TODO: revision
    // if (this._revisionView) {
    //   html[idx++] = "<td width=" + width + " id='" + zimbraDriveItem.getNameElId() + "_revision'>";
    //     idx = this._getCellContents(html, idx, item, ZmItem.F_EXPAND, colIdx);
    //   html[idx++] = "</td>";
    // }

    html[idx++] = "<td width=20 id='" + this._getFieldId(zimbraDriveItem, ZmItem.F_FOLDER) + "'>";
    idx = this._getCellContents(html, idx, zimbraDriveItem, ZimbraDriveItem.F_ICON, colIdx); // AjxImg.getImageHtml(mimeInfo.image);
    html[idx++] = "</td>";
    html[idx++] = "<td style='vertical-align:middle;' width=100% id='" + this._getFieldId(zimbraDriveItem, ZimbraDriveItem.F_NAME) + "'>";
    idx = this._getCellContents(html, idx, zimbraDriveItem, ZimbraDriveItem.F_NAME, colIdx);
    html[idx++] = "</td>";

    html[idx++] = "<td style='vertical-align:middle;text-align:right;' width=40 id='" + this._getFieldId(zimbraDriveItem, ZimbraDriveItem.F_SIZE) + "'>";
    idx = this._getCellContents(html, idx, zimbraDriveItem, ZimbraDriveItem.F_SIZE, colIdx);
    html[idx++] = "</td>";

    html[idx++] = "<td style='text-align:right' width=" + width + " >";
    idx = this._getImageHtml(html, idx, "Blank_16", this._getFieldId(zimbraDriveItem, ZimbraDriveItem.F_EMPTY), []);
    html[idx++] = "</td>";

    html[idx++] = "</tr>";
    html[idx++] = "</table>";

    html[idx++] = "<table width=100% class='BottomRow'><tr>";
    html[idx++] = "<td style='vertical-align:middle;padding-left:50px;'>";
    idx = this._getCellContents(html, idx, zimbraDriveItem, ZimbraDriveItem.F_FROM, colIdx);
    html[idx++] = "<td style='vertical-align:middle;text-align:right;'>";
    idx = this._getCellContents(html, idx, zimbraDriveItem, ZimbraDriveItem.F_DATE, colIdx);
    html[idx++] = "</td>";
    html[idx++] = "<td style='text-align:center;' width=" + width + " id='" + this._getFieldId(zimbraDriveItem, ZimbraDriveItem.F_LOCK) + "'> ";
    idx = this._getImageHtml(html, idx, "Blank_16", this._getFieldId(zimbraDriveItem, ZimbraDriveItem.F_LOCK), []);
    html[idx++] = "</td>";
    html[idx++] = "</tr></table>";
    return html.join("");
  }

  // public _sortColumn(columnItem: DwtListHeaderItem, sortAsc: boolean) {
  //   super._sortColumn(columnItem, sortAsc);
  // }
}
