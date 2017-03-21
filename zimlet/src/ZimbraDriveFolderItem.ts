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

import {ZimbraDriveFolder} from "./ZimbraDriveFolder";
import {ZDId} from "./ZDId";
import {ZmList} from "./zimbra/zimbraMail/share/model/ZmList";
import {ZimbraDriveItem} from "./ZimbraDriveItem";

export class ZimbraDriveFolderItem extends ZimbraDriveItem {

  private _data: {[id: string]: any} = {};
  private folder: ZimbraDriveFolder;
  public isDwtTreeItem: boolean = false;

  constructor(parent: ZimbraDriveFolder) {
    super(parent.id, new ZmList(ZDId.ZIMBRADRIVE_ITEM));
    this.folder = parent;
  }

  public getFolder(): ZimbraDriveFolder {
    return this.folder;
  }

  public isFolder(): boolean {
    return true;
  }

  public getName(): string {
    return this.folder.name;
  }

  public getAuthor(): string {
    return this.folder.owner;
  }

  public getPath(): string {
    return this.folder.getPath(true);
  }

  public getParentPath(): string {
    return this.folder.getParent().getPath(true);
  }

  public setData(key: string, value: any): void {
    this._data[key] = value;
  }

  public getData(key: string): any {
    return this._data[key];
  }

  public containsTargetPath(targetPath: string): boolean {
    return this.folder.containsTargetPath(targetPath);
  }

}
