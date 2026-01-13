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

import {DwtComposite} from "../zimbra/ajax/dwt/widgets/DwtComposite";
import {Dwt} from "../zimbra/ajax/dwt/core/Dwt";
import {ZimbraDriveController} from "../ZimbraDriveController";
import {ZimbraDriveItem} from "../ZimbraDriveItem";
import {AjxStringUtil} from "../zimbra/ajax/util/AjxStringUtil";
import {ZmMimeTable} from "../zimbra/zimbraMail/core/ZmMimeTable";
import {AjxTemplate} from "../zimbra/ajax/boot/AjxTemplate";
import {DwtControl} from "../zimbra/ajax/dwt/widgets/DwtControl";
import {DwtIframe, DwtIframeParams} from "../zimbra/ajax/dwt/widgets/DwtIframe";
import {DwtEvent} from "../zimbra/ajax/dwt/events/DwtEvent";
import {AjxCallback} from "../zimbra/ajax/boot/AjxCallback";
import {AjxListener} from "../zimbra/ajax/events/AjxListener";
import {AjxImg} from "../zimbra/ajax/core/AjxImg";
import {appCtxt} from "../zimbra/zimbraMail/appCtxt";
import {AjxDateFormat, AjxMessageFormat} from "../zimbra/ajax/util/AjxText";
import {ZmZimbraMail} from "../zimbra/zimbraMail/core/ZmZimbraMail";
import {ZmMsg} from "../zimbra/zimbraMail/ZmMsg";
import {ZDId} from "../ZDId";
import {ZimbraDriveApp} from "../ZimbraDriveApp";

export class PreviewView extends DwtComposite {
  private controller: ZimbraDriveController;
  private _iframePreview: DwtIframe;
  private _iframePreviewId: string;
  private _expandState: boolean;
  private _previewContent: boolean;
  private _previewContentHtml: string;
  private _previewItem: ZimbraDriveItem;
  private _oldItem: ZimbraDriveItem;
  private _frameUrl: string;
  private static _instance: PreviewView;

  private _elementsMap: {[id: string]: HTMLElement} = {};

  constructor(parent: DwtComposite, posStyle: string, controller: ZimbraDriveController) {
    super({
      parent: parent,
      posStyle: Dwt.ABSOLUTE_STYLE,
      className: "DwtListView"
    });
    this.controller = controller;
    this._initialize();
    this.enablePreview(false);
  }


  public _initialize(): void {
    let htmlElId = this.getHTMLElId();
    this.getHtmlElement().innerHTML = AjxTemplate.expand("com_btactic_drive_open.ZimbraDrive#PreviewView", {id: htmlElId});

    // Set each element
    this.getElement("header");
    this.getElement("body");
    this.getElement("container");

    // Create DWT IFrame
    let params: DwtIframeParams = {
      parent: this,
      className: "PreviewFrame",
      id: htmlElId + "_iframe",
      hidden: false,
      html: AjxTemplate.expand("com_btactic_drive_open.ZimbraDrive#NoPreview", {id: htmlElId}),
      noscroll: false,
      posStyle: DwtControl.STATIC_STYLE
    };
    this._iframePreview = new DwtIframe(params);
    this._iframePreviewId = this._iframePreview.getIframe().id;

    this._iframePreview.reparentHtmlElement(this.getElement("body"));

    this.getElement("filepreview");
    this.getElement("noitem");

    // Init header Elements
    this.getElement("name");
    this.getElement("image");
    this.getElement("creator");
    this.getElement("modified");
    this.getElement("modifier");
    this.getElement("lock");
    this.getElement("notes");
    this.getElement("notes_section");

    Dwt.setHandler(this.getElement("expand"), DwtEvent.ONCLICK, AjxCallback.simpleClosure(this._toggleExpand, this));
    this._iframePreview.getIframe().onload = <(this: HTMLIFrameElement, ev: Event) => any> AjxCallback.simpleClosure(this._updatePreview, this);
    appCtxt.getShell().addControlListener(new AjxListener(this, function() { return this._onResize.apply(this, arguments); }));
    this.addControlListener(new AjxListener(this, function() { return this._onResize.apply(this, arguments); }));
  }

  public enablePreview(enabled: boolean): void {
    Dwt.setDisplay(this.getElement("filepreview"), enabled ? Dwt.DISPLAY_INLINE : Dwt.DISPLAY_NONE);
    Dwt.setDisplay(this.getElement("noitem"), enabled ? Dwt.DISPLAY_NONE : Dwt.DISPLAY_INLINE);
    if (!enabled) {
      this._iframePreview.setIframeContent("<div></div>");
    }
  }

  public set(item: ZimbraDriveItem): void {
    if (!item) {
      this.enablePreview(false);
      return;
    }
    if (item === this._previewItem) {
      return;
    }
    this._oldItem = this._previewItem;
    this._previewItem = item;
    this.enablePreview(true);

    this._previewContent = false;

    if (item.isFolder()) {
      this._setFolder(item);
      return;
    }
    this._setHeader(item);

    // let url: string = `${ZimbraDriveApp.DOWNLOAD_URL}${ZimbraDriveController.getCurrentFolderPath()}${item.getName()}`;
    let url: string = `${ZimbraDriveApp.DOWNLOAD_URL}${item.getPath(true)}`;
    url = PreviewView._addRequestParam(url, "errorcallback", "ZmZimbraDrivePreviewView._errorCallback");
    this._frameUrl = url;
    ZmZimbraMail.unloadHackCallback();
    if (!ZmMimeTable.isWebDoc(item.getMimetype())) {
      this._setupLoading();
      url = this._setupPreviewCallback(url);
    }
    url = PreviewView._addRequestParam(url, "viewonly", "1");

    this._iframePreview.setSrc(url);
    Dwt.setLoadedTime(ZDId.ITEM_ZIMBRADRIVE);
  }

  public _setupLoading(): void {
    let html = [
      "<div style='height:100%;width:100%;text-align:center;vertical-align:middle;padding-top:30px;'>",
      ZmMsg.generatingPreview,
      "</div>"
    ].join("");
    try {
      this._iframePreview.setIframeContent(html);
    }
    catch (ignore) {}
  }

  private _setupPreviewCallback(url: string): string {
    // if (!PreviewView._instance) {
      PreviewView._instance = this;
    // }
    return PreviewView._addRequestParam(url, "previewcallback", "ZmZimbraDrivePreviewView._previewCallback");
  }

  private static _addRequestParam(url: string, key: string, value: string): string {
    return url + ( url.match(/\?/) ? "&" : "?" ) + key + "=" + value;
  }

  public static _previewCallback(errorCode?: number, error?: Error): void {
    let previewView = PreviewView._instance;
    previewView._handlePreview(previewView._previewItem, previewView._frameUrl);
  }

  private _handlePreview(item: ZimbraDriveItem, url: string): void {
    this.enablePreview(true);
    if (item && url) {
      if (ZmMimeTable.isRenderable(item.getMimetype()) || ZmMimeTable.isMultiMedia(item.getMimetype())) {
        url = PreviewView._addRequestParam(url, "viewonly", "1");
        this._iframePreview.setSrc(url);
      }else {
        // Show Download Link
        let html = [
          "<div style='height:100%;width:100%;text-align:center;vertical-align:middle;padding-top:30px;font-family: \'Helvetica Neue\',Helvetica,Arial,\'Liberation Sans\',sans-serif;'>",
          AjxMessageFormat.format(ZmMsg.previewDownloadLink, item.getName()),
          "</div>"
        ].join("");
        this._iframePreview.setIframeContent(html);
      }
    }
  }

  public static _errorCallback(errorCode?: number, error?: Error): void {
    let previewView = PreviewView._instance;
    previewView._handleError(previewView._previewItem);
  }

  private _handleError(item: ZimbraDriveItem): void {
    this.enablePreview(true);
    if (item) {
      let html = [
        "<div style='height:100%;width:100%;text-align:center;vertical-align:middle;padding-top:30px;font-family: \'Helvetica Neue\',Helvetica,Arial,\'Liberation Sans\',sans-serif;'>",
        AjxMessageFormat.format(ZmMsg.errorGeneric) + " " + AjxMessageFormat.format(ZmMsg.errorNetwork),
        "</div>"
      ].join("");
      this._iframePreview.setIframeContent(html);
    }
  }

  private _setHeader(item: ZimbraDriveItem): void {
    // Name
    this.getElement("name").innerHTML = AjxStringUtil.htmlEncode(item.getName());

    // Image icon
    let contentType = item.getMimetype();
    if (contentType && contentType.match(/;/)) {
      contentType = contentType.split(";")[0];
    }
    let mimeInfo = contentType ? ZmMimeTable.getInfo(contentType) : null;
    let icon = "Img" + ( mimeInfo ? mimeInfo.imageLarge : "UnknownDoc_48");
    this.getElement("image").className = icon;

    // Modified & Created.
    let dateFormatter = AjxDateFormat.getDateTimeInstance(AjxDateFormat.LONG, AjxDateFormat.SHORT);
    if (this.getElement("modified") && item.getModifiedTimeMillis()) {
      this.getElement("modified").innerHTML = dateFormatter.format(new Date(item.getModifiedTimeMillis()));
    }
    if (this.getElement("creator"))
      this.getElement("creator").innerHTML = AjxStringUtil.htmlEncode(item.getAuthor());

    if (this.getElement("lock"))
      this.getElement("lock").innerHTML = AjxImg.getImageHtml(!item.getPermissions().writable ? "Padlock" : "Blank_16");

    this.setNotes(item);

    this._onResize();
  }

  public setNotes(item: ZimbraDriveItem): void {
    let visible = "";
    Dwt.setVisible(this.getElement("notes_section"), (typeof visible !== "undefined"));
    if (visible && this.getElement("notes")) {
      this.getElement("notes").innerHTML = AjxStringUtil.nl2br(visible);
    }
    this.expandNotes(false);
  }

  private expandNotes(expand: boolean): void {

    this._expandState = expand;

    if (this.getElement("notes")) {
      this.getElement("notes").style.height = expand ? "" : "15px";
    }
    if (this.getElement("expand")) {
      this.getElement("expand").innerHTML = AjxImg.getImageHtml((expand ? "NodeExpanded" : "NodeCollapsed"));
    }
  }

  private _toggleExpand(): void {
    this.expandNotes(!this._expandState);
  }

  private _onResize(): void {
    if (this.getElement("container") && this.getElement("body")) {
      Dwt.setSize(<HTMLDivElement> this.getElement("body"), 1, 1);

      let size = Dwt.getSize(this.getElement("container"));
      Dwt.setSize(<HTMLDivElement> this.getElement("body"), size.x, size.y);
    }
  }

  private _setFolder(item: ZimbraDriveItem): void {
    this._cleanup();
    this.getElement("name").innerHTML = AjxStringUtil.htmlEncode(item.getName());
    this.getElement("image").className = "ImgBriefcase_48";
    if (this.getElement("modifier"))
      this.getElement("modifier").innerHTML = AjxStringUtil.htmlEncode(item.getAuthor());
    this._setIframeContent(AjxTemplate.expand("briefcase.Briefcase#FolderPreview"));
  }

  private _setIframeContent(html: string): void {
    this._previewContentHtml = html;
    this._previewContent = true;
    this._iframePreview.setSrc("");
    this._iframePreview.setSrc("about:blank");
    this._iframePreview._resetEventHandlers();
  }

  private _updatePreview(): void {
    if (this._previewContent) {
      this._iframePreview.setIframeContent(this._previewContentHtml);
      this._previewContent = false;
    }
    else {
      let iframeDoc = this._iframePreview && this._iframePreview.getDocument();
      if (!iframeDoc) {
        return;
      }
      this._iframePreview._resetEventHandlers();  // for resizing reading pane on right
      let images = iframeDoc && iframeDoc.getElementsByTagName("img");
      if (images && images.length) {
        for (let i = 0; i < images.length; i++) {
          let dfsrc = images[i].getAttribute("dfsrc");
          if (dfsrc && dfsrc.match(/https?:\/\/([-\w\.]+)+(:\d+)?(\/([\w\_\.]*(\?\S+)?)?)?/)) {
            try {
              images[i].src = ""; // unload it first
              images[i].src = dfsrc;
            }
            catch (ignore) {}
          }
        }
      }
    }
  }

  private _cleanup(): void {
    this.getElement("name").innerHTML = "";
    this.getElement("image").className = "ImgUnknownDoc_48";
    if (this.getElement("modified")) this.getElement("modified").innerHTML = "";
    if (this.getElement("created"))  this.getElement("created").innerHTML = "";
    if (this.getElement("creator"))  this.getElement("creator").innerHTML = "";
    if (this.getElement("lock"))     this.getElement("lock").innerHTML = AjxImg.getImageHtml("Blank_16");
    Dwt.setVisible(this.getElement("notes_section"), false);
    this._previewContent = false;
  }

  private getElement(id: string): HTMLElement {
    if (!this._elementsMap[id]) {
      this._elementsMap[id] = document.getElementById(`${this.getHTMLElId()}_${id}`);
    }
    return this._elementsMap[id];
  }
}
