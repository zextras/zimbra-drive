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

import {DetailListView} from "./view/DetailListView";
import {AjxEnv} from "./zimbra/ajax/boot/AjxEnv";
import {AjxCallback} from "./zimbra/ajax/boot/AjxCallback";
import {ZmMsg} from "./zimbra/zimbraMail/ZmMsg";
import {appCtxt} from "./zimbra/zimbraMail/appCtxt";
import {DwtMessageDialog} from "./zimbra/ajax/dwt/widgets/DwtMessageDialog";
import {UploadParams} from "./zimbra/zimbraMail/share/ZmUploadManager";
import {ZimbraDriveApp} from "./ZimbraDriveApp";

declare let window: {
  csrfToken: string
  setInterval(func: Function, interval: number): void,
  XMLHttpRequest: any,
  ActiveXObject: any
};

export class ZimbraDriveUploadManager {

  private upLoadC: number = 0;
  private _uploadAttReq: XMLHttpRequest;

  private static _reqIds: number = 0;

  public upload(params: ZimbraDriveUploadParams) {
    if (!params.formData) {
      return;
    }
    try {
      this.upLoadC = this.upLoadC + 1;
      params.totalSize = this._getTotalUploadSize(params.form);
      params.uploadedSize = 0;
      params.currentFileSize = params.totalSize;

      // Initiate the first upload
      let req: XMLHttpRequest;
      if (window.XMLHttpRequest) {
        req = new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        req = new ActiveXObject("Microsoft.XMLHTTP");
      }
      params.reqId = ZimbraDriveUploadManager.assignIdToRequest(req, params.form);
      let uri = params.url || ZimbraDriveApp.UPLOAD_URL;
      req.open("POST", uri, true);
      req.setRequestHeader("Cache-Control", "no-cache");
      req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      if (window.csrfToken) {
        req.setRequestHeader("X-Zimbra-Csrf-Token", window.csrfToken);
      }

      this._uploadAttReq = req;
      if (AjxEnv.supportsHTML5File) {
        if (params.progressCallback) {
          req.upload.addEventListener("progress", (<EventListener> params.progressCallback), false);
        }
      }
      else {
        if (params.curView) {
          let progress = function (obj: any) {
            let viewObj = obj;
            viewObj.si = window.setInterval(function () {
              viewObj._progress();
            }, 500);
          };
          progress(params.curView);
        }
      }
      req.onreadystatechange = <(() => any)> AjxCallback.simpleClosure(this._handleUploadResponse, this, req, params);
      req.send(params.formData);
    } catch (exp) {
      if (params.errorCallback) {
        params.errorCallback();
      }
      this._popupErrorDialog(ZmMsg.importErrorUpload);
      this.upLoadC = this.upLoadC - 1;
      return false;
    }
  }

  public _handleUploadResponse(request: XMLHttpRequest, params: ZimbraDriveUploadParams): void {
    if (params.stateChangeCallback) {
      return params.stateChangeCallback(request);
    }
    if (request.readyState === 4) {
      params.completeCallback(request.responseText, params, request.status);
      if (!request.responseText) {
        let msgDlg = appCtxt.getMsgDialog();
        this.upLoadC = this.upLoadC - 1;
        msgDlg.setMessage(ZmMsg.importErrorUpload, DwtMessageDialog.CRITICAL_STYLE);
        msgDlg.popup();
      }
    }
  }


  private _popupErrorDialog(message: string): void {
    let dialog: DwtMessageDialog = appCtxt.getMsgDialog();
    dialog.setMessage(message, DwtMessageDialog.CRITICAL_STYLE);
    dialog.popup();
  };


  private _getTotalUploadSize(form: HTMLFormElement): number {
  // Determine the total number of bytes to be upload across all the files
    let totalSize = 0;
    for (let i = 0; i < form.elements.length; i++) {
      const element: HTMLInputElement = <HTMLInputElement> form.elements[i];
      if (element.files) {
        for (let j = 0; j < element.files.length; j++) {
          let file: File = element.files[j];
          let size: number = file.size || 0;
          totalSize += size;
        }
      }
    }
    return totalSize;
  }

  private static assignIdToRequest(req: XMLHttpRequest, form: HTMLFormElement): number {
    let id: number = ZimbraDriveUploadManager._reqIds++;
    let input: HTMLInputElement = <HTMLInputElement> form.elements.namedItem("requestId");
    if (!input) {
      input = form.ownerDocument.createElement("input");
      input.type = "hidden";
      input.name = "requestId";
    }
    input.value = id.toString();
    form.appendChild(input);
    return id;
  }
}

export interface ZimbraDriveUploadParams extends UploadParams {
  form: HTMLFormElement;
  formData: FormData;
  // start?: number;
  curView?: DetailListView;
  stateChangeCallback?: Function;
  // preAllCallback?: Function;
  // initOneUploadCallback?: AjxCallback;
  completeCallback?: Function;
  totalSize?: number;
  currentFileSize?: number;
  uploadedSize?: number;
  reqId?: number;
}
