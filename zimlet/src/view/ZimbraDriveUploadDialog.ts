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

import {ZmUploadDialog} from "../zimbra/zimbraMail/share/view/dialog/ZmUploadDialog";
import {AjxTemplate} from "../zimbra/ajax/boot/AjxTemplate";
import {appCtxt} from "../zimbra/zimbraMail/appCtxt";
import {AjxCallback} from "../zimbra/ajax/boot/AjxCallback";
import {ZmMsg} from "../zimbra/zimbraMail/ZmMsg";
import {ZimbraDriveApp} from "../ZimbraDriveApp";
import {DwtDialog} from "../zimbra/ajax/dwt/widgets/DwtDialog";
import {ZimbraDriveController} from "../ZimbraDriveController";
import {ZDId} from "../ZDId";
import {AjxPost} from "../zimbra/ajax/net/AjxPost";
import {DwtButton} from "../zimbra/ajax/dwt/widgets/DwtButton";
import {ZmToolBar} from "../zimbra/zimbraMail/share/view/ZmToolBar";
import {ZimbraDriveUploadManager, ZimbraDriveUploadParams} from "../ZimbraDriveUploadManager";
import {ZimbraDriveFolder} from "../ZimbraDriveFolder";
import {SetStatusMsgParams} from "../zimbra/zimbraMail/core/ZmAppCtxt";
import {AjxMessageFormat} from "../zimbra/ajax/util/AjxText";
import {ZmStatusView} from "../zimbra/zimbraMail/share/view/ZmStatusView";
import {DwtToolBarButton} from "../zimbra/ajax/dwt/widgets/DwtToolBar";

export class ZimbraDriveUploadDialog extends ZmUploadDialog {

  private static OK_STATUS_CODE: number = 0;
  private static FILE_ALREADY_EXISTS_STATUS_CODE: number = 1;
  private static NOT_PERMITTED_EXCEPTION_STATUS_CODE: number = 2;
  private static NO_FILE_IN_THE_REQUEST: number = 3;

  private _uploadButton: DwtToolBarButton;
  private _fileMapIds: string[];
  private _fileMapIdName: {[id: string]: string};

  public _upload(): void {
    let form: HTMLFormElement = this._uploadForm,
      formData: FormData = new FormData();
    let elements     = form.elements,
      fileCounter: number = 0;
    this._fileMapIds = [];
    this._fileMapIdName = {};
    for (let i = 0; i < elements.length; i++) {
      const element: HTMLInputElement = <HTMLInputElement> elements[i];
      if (element.type === "file") {
        for (let j = 0; j < element.files.length; j++) {
          let file: File = element.files[j];
          formData.append(ZDId.F_UPLOAD + "_" + fileCounter, file);
          this._fileMapIds.push(ZDId.F_UPLOAD + "_" + fileCounter);
          this._fileMapIdName[ZDId.F_UPLOAD + "_" + fileCounter] = file.name;
          fileCounter++;
        }
      }
    }
    let shutDownCallback: Function = null;
    this._uploadButton = null;
    if (this._controller == null) {
      shutDownCallback = AjxCallback.simpleClosure(this.popdown, this);
    } else {
      let toolbar = this._controller.getCurrentToolbar();
      if (toolbar) {
        this._uploadButton = toolbar.getOp(ZDId.ZD_NEW_FILE);
      }
      this.popdown();
      shutDownCallback = AjxCallback.simpleClosure(this._enableUpload, this, this._uploadButton);
    }
    let uploadParams: ZimbraDriveUploadParams = {
      form:                       form,
      formData:                   formData,
      completeCallback:           AjxCallback.simpleClosure(this.uploadCompleted, this),
      errorCallback:              shutDownCallback,
      url:                        ZimbraDriveApp.UPLOAD_URL
    };
    uploadParams.progressCallback = AjxCallback.simpleClosure(this._uploadFileProgress, this, this._uploadButton, uploadParams);

    try {
      if (this._supportsHTML5) {
        formData.append(ZDId.F_PATH, (<ZimbraDriveFolder> this._uploadFolder).getPath(true));
        this._addHiddenField(form, ZDId.F_PATH, (<ZimbraDriveFolder> this._uploadFolder).getPath(true));
        (<ZimbraDriveUploadManager> ZimbraDriveController.getUploadManager()).upload(uploadParams);
      } else {
        const callback: AjxCallback = new AjxCallback(this, this.uploadCompleted, ["", uploadParams]);
        this._uploadButton.setText(ZmMsg.uploading);
        this._uploadButton.setEnabled(false);
        (<AjxPost> ZimbraDriveController.getUploadManager())._addHiddenField(elements[0], ZDId.F_PATH, (<ZimbraDriveFolder> this._uploadFolder).getPath(true));
        (<AjxPost> ZimbraDriveController.getUploadManager()).execute(callback, this._uploadForm);
      }
      if (this._uploadButton) {
        ZmToolBar._setButtonStyle(this._uploadButton, null, ZmMsg.uploading, "Upload0");
        this._inprogress = true;
      }
    } catch (ex) {
      this._enableUpload(this._uploadButton);
      if (ex.msg) {
        this._popupErrorDialog(ex.msg);
      } else {
        this._popupErrorDialog(ZmMsg.unknownError);
      }
    }
  }

  public _uploadFileProgress(uploadButton: DwtButton, params: ZimbraDriveUploadParams, progress: ProgressEvent): void {
    super._uploadFileProgress(uploadButton, params, progress); // TODO rewrite it to assign text
    if (!uploadButton || !params || !progress.lengthComputable || !params.totalSize) return;
    let progressFraction: number = (progress.loaded / progress.total),
      uploadedSize: number = params.uploadedSize + (params.currentFileSize * progressFraction),
      fractionUploaded: number = uploadedSize / params.totalSize;
    if (fractionUploaded > 1) {
     fractionUploaded = 1;
    }
    let progressBucket: number = Math.round(fractionUploaded * 12);
    if (fractionUploaded === 1) {
      ZmToolBar._setButtonStyle(uploadButton, null, ZmMsg.uploading, "ZimbraDrive-icon");
    }
    else {
      ZmToolBar._setButtonStyle(uploadButton, null, ZmMsg.uploading, "Upload" + progressBucket.toString());
    }
    let tooltip = AjxMessageFormat.format(ZmMsg.uploadPercentComplete, [ Math.round(fractionUploaded * 100).toString() ] );
    uploadButton.setToolTipContent(tooltip, true);
  }

  public uploadCompleted(response: string, params: ZimbraDriveUploadParams, status: number): boolean {
    let parsedResponse: {[fileId: string]: {statusCode: number}} = {};
    if (response.length > 0 && response.indexOf("name='uploadedFilesStatus'") !== -1) {
      // parse response
      let startMatch: string = "content='{",
        endMatch: string = "}'>",
        responseContent: string = response.substring(response.indexOf(startMatch) + startMatch.length - 1, response.indexOf(endMatch) + 1);
      parsedResponse = JSON.parse(responseContent);
    }
    let msg: string = "Unknown status code",
      level: number = ZmStatusView.LEVEL_WARNING,
      refreshPageNow: boolean = true;
    switch (status) {
      case 200: {
        // TODO move in 405 status code
        msg = ZimbraDriveApp.getMessage("successfulUpload");
        level = ZmStatusView.LEVEL_INFO;
        let alreadyExistsFiles: string[] = [],
          filesUploadNotPermitted: string [] = [];
        for (let id of this._fileMapIds) {
          if (parsedResponse.hasOwnProperty(id)) {
            let status: number = parsedResponse[id].statusCode;
            if (status === ZimbraDriveUploadDialog.FILE_ALREADY_EXISTS_STATUS_CODE) {
              if (this._fileMapIdName.hasOwnProperty(id)) {
                alreadyExistsFiles.push(this._fileMapIdName[id]);
              }
            }
            else if (status === ZimbraDriveUploadDialog.NOT_PERMITTED_EXCEPTION_STATUS_CODE) {
              if (this._fileMapIdName.hasOwnProperty(id)) {
                filesUploadNotPermitted.push(this._fileMapIdName[id]);
              }
            }
            else if (status !== ZimbraDriveUploadDialog.OK_STATUS_CODE) {
              alreadyExistsFiles = [];
              msg = ZimbraDriveApp.getMessage("errorUpload");
              level = ZmStatusView.LEVEL_CRITICAL;
              break;
            }
          }
        }
        if (alreadyExistsFiles.length > 0) {
          if (filesUploadNotPermitted.length > 0) {
            msg = ZimbraDriveApp.getMessage("errorUploadFileAlreadyExists", [alreadyExistsFiles.join(", ")]) +
              ZimbraDriveApp.getMessage("errorUploadFileUploadNotPermitted", [filesUploadNotPermitted.join(", ")]);
          }
          else {
            msg = ZimbraDriveApp.getMessage("errorUploadFileAlreadyExists", [alreadyExistsFiles.join(", ")]);
          }
          level = ZmStatusView.LEVEL_WARNING;
        }
        else if (filesUploadNotPermitted.length > 0) {
          msg = ZimbraDriveApp.getMessage("errorUploadFileUploadNotPermitted", [filesUploadNotPermitted.join(", ")]);
          level = ZmStatusView.LEVEL_WARNING;
        }
        break;
      }
      case 405: {
        msg = ZimbraDriveApp.getMessage("errorUploadFileAlreadyExistsGeneric");
        break;
      }
      case 500: {
        msg = ZimbraDriveApp.getMessage("errorUpload");
        level = ZmStatusView.LEVEL_CRITICAL;
        break;
      }
    }
    if (refreshPageNow) {
      this._refreshSearch({msg: msg, level: level});
    }
    else {
      setTimeout(
        AjxCallback.simpleClosure(
          this._refreshSearch,
          this,
          {msg: msg, level: level}
        ),
        10000
      );
    }
    return true; // handled
  }

  public _createUploadHtml(): void {
    this.setContent(
      AjxTemplate.expand(
        "com_btactic_drive_open.ZimbraDrive#UploadDialog",
        {
          id: this._htmlElId,
          url: ZimbraDriveApp.UPLOAD_URL
        }
      )
    );
    this._uploadForm = <HTMLFormElement> document.getElementById((this._htmlElId + "_form"));
    this._tableEl = document.getElementById((this._htmlElId + "_table"));
  }

  private _addHiddenField(referenceElement: Element, fieldName: string, fieldValue: string): void {
    let hidden   = document.createElement("input");
    hidden.type  = "hidden";
    hidden.name  = fieldName;
    hidden.value = fieldValue;
    referenceElement.parentNode.insertBefore(hidden, referenceElement);
  };

  public popdown(): void {
    // bypass useless ZmUploadDialog.popdown
    DwtDialog.prototype.popdown.call(this);
  }

  public _refreshSearch(statusMsgParams: SetStatusMsgParams): void {
    appCtxt.setStatusMsg(statusMsgParams);
    this._enableUpload(this._uploadButton);
    if (!this._controller.isSearchResults && (<ZimbraDriveFolder> this._uploadFolder).getPath(true) === (<ZimbraDriveController>this._controller).getCurrentFolder().getPath(true)) {
      ZimbraDriveController.goToFolder((<ZimbraDriveController>this._controller).getCurrentFolder().getPath(true), false);
    }
  }

  public _enableUpload(uploadButton: DwtToolBarButton): void {
    super._enableUpload(uploadButton);
    uploadButton.setText("");
    // uploadButton.setVisible(false);
  }
}
