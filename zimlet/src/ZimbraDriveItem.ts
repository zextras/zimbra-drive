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

import {ZmList} from "./zimbra/zimbraMail/share/model/ZmList";
import {ZmItem} from "./zimbra/zimbraMail/share/model/ZmItem";
import {ZDId} from "./ZDId";

export class ZimbraDriveItem extends ZmItem {

  public getPermissions(): ZimbraDriveItemPermissions {
    return this.permissions;
  }

  public static F_EMPTY: string = "empty";
  public static F_ICON: string = "icon";
  public static F_NAME: string = "name";
  public static F_FILE_TYPE: string = "mimetype";
  public static F_SIZE: string = "size";
  public static F_DATE: string = "modifiedTime";
  public static F_FROM: string = "author";
  public static F_FOLDER: string = "folder";
  public static F_LOCK: string = "";
  public static F_SORTED_BY: string = "sortedBy";
  public static F_PERMISSIONS: string = "permissions";
  public static F_SHARED: string = "shared";

  private nameElId: string;
  private name: string;
  private children: ZimbraDriveItem[];
  private permissions: ZimbraDriveItemPermissions;
  private shared: boolean;
  private mimetype: string;
  private size: number;
  private modifiedTime: number;
  private author: string;
  private path: string;

  constructor(id: string, list: ZmList, noCache: boolean = true, type: string = ZDId.ZIMBRADRIVE_ITEM) {
    super(type, id, list, noCache);
  }

  public isItem(): boolean {
    return true;
  }

  public isFolder(): boolean {
    return false;
  }

  public static createFromDom(node: ZimbraDriveItemObj, args: {list: ZmList}) {
    let item = new ZimbraDriveItem(`${node.id}_zd`, args.list);
    item._loadFromDom(node);
    return item;
  }

  public _loadFromDom(node: ZimbraDriveItemObj): void {
    this.id = `${node.id}`;
    this.name = node.name;
    this.size = node.size;
    this.modifiedTime = node.modified_time; // in seconds
    this.author = node.author;
    this.path = node.path;
    if (node.path && node.path.indexOf("files") === 0) {
      this.path = node.path.substring(5);
    }
    this.children = [];
    if (node.children) {
      for (let childObj of node.children) {
        let child = new ZimbraDriveItem(`${childObj.id}_zd`, this.list);
        child._loadFromDom(childObj);
        this.children.push(child);
      }
    }
    if (node.permissions) {
      this.permissions = node.permissions[0];
    }
    this.shared = node.shared;
    this.mimetype = node.mimetype;
  }

  public getMimetype(): string {
    return this.mimetype;
  }

  public getName(): string {
    return this.name;
  }

  // on Rename
  public setName(name: string): void {
    this.name = name;
  }

  public getSize(): number {
    return this.size;
  }

  public getModifiedTimeMillis(): number {
    return this.modifiedTime * 1000;
  }

  public getAuthor(): string {
    return this.author;
  }

  public getPath(): string {
    return this.path;
  }

  public setPath(path: string) {
     this.path = path;
  }

  public getParentPath(): string {
    let lastIndex: number = this.path.lastIndexOf("/");
    return this.path.substring(0, lastIndex + 1);
  }

  public getNameElId(): string {
    return this.nameElId;
  }

  public setNameElId(id: string): void {
    this.nameElId = id;
  }

  public containsTargetPath(targetPath: string): boolean {
    return false;
  }

}

export interface ZimbraDriveItemPermissions {
  readable: boolean;
  writable: boolean;
  shareable: boolean;
}

// Received from SOAP Response
export interface ZimbraDriveItemObj {
  id: number;
  permissions: ZimbraDriveItemPermissions[];
  type: string;
  name: string;
  mimetype: string;
  size: number;
  modified_time: number;
  shared: boolean;
  author: string;
  path: string;
  children: ZimbraDriveItemObj[];
}
