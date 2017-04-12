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
import {ZimbraDriveFolderItem} from "./ZimbraDriveFolderItem";
import {ZmFolder} from "./zimbra/zimbraMail/share/model/ZmFolder";
import {ZDId} from "./ZDId";
import {ZimbraDriveApp} from "./ZimbraDriveApp";

export class ZimbraDriveFolder extends ZmFolder {
  private folderItem: ZimbraDriveFolderItem;
  public path: string;
  public parentName: string;

  constructor() {
    super({ type: ZDId.ZIMBRADRIVE_ITEM });
  }

  public static createFromDom(node: ZimbraDriveFolderObj, args: {tree: ZmTree}): ZimbraDriveFolder {
    let item = new ZimbraDriveFolder();
    item._loadFromDom(node, args.tree);
    return item;
  }

  public static sortFcn(folderA: ZimbraDriveFolder, folderB: ZimbraDriveFolder): number {
    if (folderA.getName() > folderB.getName()) { return 1; }
    if (folderA.getName() < folderB.getName()) { return -1; }
    return 0; // TODO: Update this function.
  }

  public _loadFromDom(node: ZimbraDriveFolderObj, tree: ZmTree): void {
    this.tree = tree;
    this.name = node.name;
    this.path = `${(this.parent) ? (<ZimbraDriveFolder>this.parent).getPath(true) : "" }${node.name}/`;
    this.parentName = (this.parent) ? (<ZimbraDriveFolder> this.parent).name : undefined;
    this.owner = node.author;
    // if (this.path === "/") {
    this.id = `${node.id}_zd`;
    if (!this.parent) {
      // this.id = `${ZmFolder.ID_ROOT}_zd`;
      this.name = ZimbraDriveApp.getMessage("rootName");
      ZmFolder.HIDE_ID[this.id] = true;
      // ZmFolder.HIDE_ID[`${ZmFolder.ID_ROOT}_zd`] = true;
    // } else {
    //   this.id = `${node.id}_zd`;
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

  public getPath(needLastSlash?: boolean): string {
    // // expected last char of this.path be "/"
    // // by default return without it
    // if (needLastSlash) {
    //   return this.path;
    // }
    // return this.path.substring(0, this.path.length - 1);

    // get path and remove root folder name Drive
    let completePath: string = super.getPath().replace("Drive", "");
    if (needLastSlash) {
      completePath += "/";
    }
    return completePath;
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

  // This isn't case sensitive
  public alreadyContainsChild(childName: string) {
    for (let child of this.children.getArray()) {
      if (child.getName().toLowerCase() === childName.toLowerCase()) {
        return true;
      }
    }
    return false;
  }

  public createQuery(pathOnly: boolean): string {
    return `in:"${this.getPath(false)}"`;
  }

  public hasChild(name: string): boolean {
    return (this.getChildCS(name, false) != null);
  };

  public getChild(name: string): ZimbraDriveFolder {
    return this.getChildCS(name, true);
  };

  // Get child with case sensitive argument
  private getChildCS(name: string, caseSensitive: boolean): ZimbraDriveFolder {
    for (let child of this.children.getArray()) {
      if (caseSensitive && child.name === name) {
        return <ZimbraDriveFolder> child;
      }
      else if (!caseSensitive && child.name.toLowerCase() === name.toLowerCase()) {
        return <ZimbraDriveFolder> child;
      }
    }
    return null;
  }

}

export interface ZimbraDriveFolderObj extends ZimbraDriveItemObj {
}
