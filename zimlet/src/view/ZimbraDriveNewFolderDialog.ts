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

import {ZmNewOrganizerDialog} from "../zimbra/zimbraMail/share/view/dialog/ZmNewOrganizerDialog";
import {ZimbraDriveFolder} from "../ZimbraDriveFolder";

export class ZimbraDriveNewFolderDialog extends ZmNewOrganizerDialog {

  private _folder: ZimbraDriveFolder;

  public _setupColorControl(): void {
    // do nothing
  }

  // don't show folder color selector
  public _createColorContentHtml(html: HTMLElement, idx: number): number {
    return idx;
  }

  // don't show remote checkbox
  public _createRemoteContentHtml(html: HTMLElement, idx: number): number {
    return idx;
  }

  public setFolder(folder: ZimbraDriveFolder): void {
    this._folder = folder;
  }

  public getFolder(): ZimbraDriveFolder {
    return this._folder;
  }

}
