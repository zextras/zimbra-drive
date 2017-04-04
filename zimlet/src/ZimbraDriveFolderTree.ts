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

import {ZDId} from "./ZDId";
import {ZimbraDriveFolder} from "./ZimbraDriveFolder";
import {ZmFolderTree} from "./zimbra/zimbraMail/share/model/ZmFolderTree";

export class ZimbraDriveFolderTree extends ZmFolderTree {

  public root: ZimbraDriveFolder;

  constructor() {
    super(ZDId.ZIMBRADRIVE_ITEM);
  }

  public getFolderById(id: string): ZimbraDriveFolder {
    return ZimbraDriveFolderTree.recursiveGetFolderById(this.root, id);
  }

  public static recursiveGetFolderById(folder: ZimbraDriveFolder, id: string): ZimbraDriveFolder {
    let foundFolder: ZimbraDriveFolder;
    if (folder.id === id) {
      return folder;
    }
    for (let child of folder.children.getArray()) {
      foundFolder = ZimbraDriveFolderTree.recursiveGetFolderById(<ZimbraDriveFolder> child, id);
      if (!!foundFolder) {
        return foundFolder;
      }
    }
    return null;
  }

  public getFoldersFromIDsArray(ids: string[]): ZimbraDriveFolder[] {
    let folders: ZimbraDriveFolder[] = [];
    // skip root
    for (let child of this.root.children.getArray()) {
      if (ids.length === 0) {
        return;
      }
      ZimbraDriveFolderTree.recursiveGetFoldersFromIDsArray(<ZimbraDriveFolder> child, ids, folders);
    }
    return folders;
  }

  public static recursiveGetFoldersFromIDsArray(folder: ZimbraDriveFolder, ids: string[], folders: ZimbraDriveFolder[]): void {
    let folderIndex: number = ZimbraDriveFolderTree.idFolderIndex(folder.id, ids);
    if (folderIndex > -1) {
      ids.splice(folderIndex, 1);
      ZimbraDriveFolderTree.insertOrderedItem(folder, folders);
    }
    for (let child of folder.children.getArray()) {
      if (ids.length === 0) {
        return;
      }
      ZimbraDriveFolderTree.recursiveGetFoldersFromIDsArray(<ZimbraDriveFolder> child, ids, folders);
    }
  }


  // Utilities
  private static idFolderIndex(folderId: string, ids: string[]): number {
    let i: number = ids.length;
    while (i--) {
      if (ids[i] === folderId) {
        return i;
      }
    }
    return -1;
  }

  private static insertOrderedItem(folder: ZimbraDriveFolder, folders: ZimbraDriveFolder[]) {
    let i: number = 0;
    while (i < folders.length) {
      if (folder.name < folders[i].name) {
        break;
      }
      i++;
    }
    folders.splice(i, 0, folder);
  }
}
