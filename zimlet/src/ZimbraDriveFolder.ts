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

import {ZimbraDriveItemObj} from "./ZimbraDriveItem";
import {ZmTree} from "./zimbra/zimbraMail/share/model/ZmTree";
import {appCtxt} from "./zimbra/zimbraMail/appCtxt";
import {ZimbraDriveApp} from "./ZimbraDriveApp";
import {ZimbraDriveFolderItem} from "./ZimbraDriveFolderItem";
import {ZmFolder} from "./zimbra/zimbraMail/share/model/ZmFolder";

export class ZimbraDriveFolder extends ZmFolder {

  private folderItem: ZimbraDriveFolderItem;
  public path: string;
  public parentName: string;

  constructor() {
    super({type: ZimbraDriveApp.TREE_ID});
  }

  public static createFromDom(node: ZimbraDriveFolderObj, args: {tree: ZmTree}): ZimbraDriveFolder {
    let root = new ZimbraDriveFolder();
    root.path = "";
    let item = new ZimbraDriveFolder();
    item.parent = root;
    item._loadFromDom(node, args.tree);
    item.name = "Drive";
    root.children.add(item);
    root.id = `-${ZmFolder.ID_ROOT}_zd`;
    ZmFolder.HIDE_ID[`-${ZmFolder.ID_ROOT}_zd`] = true;
    root.nId = `-${ZmFolder.ID_ROOT}`;
    return root;
  }

  public static sortFcn(folderA: ZimbraDriveFolder, folderB: ZimbraDriveFolder): number {
    if (folderA.getName() > folderB.getName()) { return 1; }
    if (folderA.getName() < folderB.getName()) { return -1; }
    return 0; // TODO: Update this function.
  }

  public _loadFromDom(node: ZimbraDriveFolderObj, tree: ZmTree): void {
    this.tree = tree;
    this.name = node.name;
    this.path = this.getParent().getPath(true) + node.name + "/";
    this.parentName = (<ZimbraDriveFolder> this.parent).name;
    this.owner = node.author;
    if (this.path === "/") {
      this.id = `${ZmFolder.ID_ROOT}_zd`;
      ZmFolder.HIDE_ID[`${ZmFolder.ID_ROOT}_zd`] = true;
      this.nId = `${ZmFolder.ID_ROOT}`;
    } else {
      this.id = `${node.id}_zd`;
      this.nId = `${node.id}`;
    }
    if (node.children) {
      for (let childObj of node.children) {
        let child = new ZimbraDriveFolder();
        child.parent = this;
        child._loadFromDom(<ZimbraDriveFolderObj>childObj, tree);
        this.children.add(child);
      }
    }
    appCtxt.cacheSet(this.id, this);
  }

  public isItem(): boolean {
    return false;
  }

  public isFolder(): boolean {
    return true;
  }

  public getIcon(): string {
    return "Folder";
  }

  // we don't want colors... at least skip a thousand requests
  public getIconWithColor(): string {
    return this.getIcon();
  }

  public resetPath(): void {
    this.path = this.getParent().getPath(true) + this.name + "/";
  }

  public getPath(keepLastSlash?: boolean): string {
    // expected last char of this.path be "/"
    // by default return without it
    if (keepLastSlash) {
      return this.path;
    }
    return this.path.substring(0, this.path.length - 1);
  }

  public getFolderItem(): ZimbraDriveFolderItem {
    if (!this.folderItem) {
      this.folderItem = new ZimbraDriveFolderItem(this);
    }
    return this.folderItem;
  }

  public getParent(): ZimbraDriveFolder {
    return <ZimbraDriveFolder> this.parent;
  }

  public getParentPath(): string {
    return this.getParent().getPath(true);
  }

  public findIndexForNewChild(childName: string): number {
    let i: number = 0, index: number = this.children.getArray().length;
    while (i < index) {
      if ((<ZimbraDriveFolder> this.children.get(i)).getName() > childName) {
        index = i;
      }
      for (let child of this.children.getArray()) {
        child.getName();
      }
      i++;
    }
    return index;
  }

  public containsTargetPath(targetPath: string): boolean {
    return this.getPath(true).length <= targetPath.length && this.getPath(true) === targetPath.substring(0, this.getPath(true).length);
  }

  public createQuery(pathOnly: boolean): string {
    console.log("Query", this);
    return `in:"${this.getPath(false)}"`;
  }

}

export interface ZimbraDriveFolderObj extends ZimbraDriveItemObj {
}
