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

/*global OC, OCP, $, t */

var documentsSettings = {
  appName: 'zimbradrive',

  save: function (event) {
    var element = $(event.srcElement);
    var elementName = element.attr('name');

    switch (elementName) {
      case 'zimbra_url':
      case 'preauth_key':
        documentsSettings.setAppValueFromInputTextElement(element);
        break;
      case 'zimbra_port':
        documentsSettings.setAppValueFromInputNumber(element);
        break;
      case 'use_ssl':
      case 'trust_invalid_certs':
        documentsSettings.setAppValueFromInputCheckbox(element);
        break;
      case 'use_zimbra_auth':
        documentsSettings.modifyZimbraAuthentication(element);
        break;
    }
  },

  setAppValueFromInputTextElement: function (element) {
    var elementName = element.attr('name');
    var elementValue = element.val();
    documentsSettings.setValue(elementName, elementValue);
  },

  setAppValueFromInputNumber: function (element) {
    var elementName = element.attr('name');
    var elementValue = parseInt(element.val(), 10);
    documentsSettings.setValue(elementName, elementValue);
  },

  setAppValueFromInputCheckbox: function (element) {
    var elementName = element.attr('name');
    var elementValue = (element.attr('checked') === 'checked');
    documentsSettings.setValue(elementName, elementValue);
  },


  modifyZimbraAuthentication: function (element) {
    var requestUrl = "/index.php/apps/zimbradrive/api/1.0/";
    if((element.attr('checked') === 'checked'))
    {
      requestUrl += "EnableZimbraAuthentication";
    } else
    {
      requestUrl += "DisableZimbraAuthentication";
    }
    $.post(requestUrl,function(){
      documentsSettings.afterSave()
    },'json');
  },

  setValue: function (name, value){
    documentsSettings.beforeSave();
    if (typeof OCP === 'undefined') {
      OC.AppConfig.setValue( //Deprecated in NextCloud 11 but OCP.AppConfig is not supported on OwnCloud 9.1.4
        documentsSettings.appName,
        name,
        value,
        {
          success: documentsSettings.afterSave,
          error: documentsSettings.afterSave
        }
      );
    } else {
      OCP.AppConfig.setValue(
        documentsSettings.appName,
        name,
        value,
        {
          success: documentsSettings.afterSave,
          error: documentsSettings.afterSave
        }
      );
    }
  },

  beforeSave: function () {
    OC.msg.startAction('#zimbradrive-admin-msg', t(documentsSettings.appName, 'Saving...'));
  },

  afterSave: function () {
    OC.msg.finishedSuccess('#zimbradrive-admin-msg', t(documentsSettings.appName, 'Settings saved'));
  },

  initialize: function () {
    $('#zimbra_url').on('focusout', documentsSettings.save);
    $('#zimbra_port').on('focusout', documentsSettings.save);
    $('#use_ssl').on('click', documentsSettings.save);
    $('#trust_invalid_certs').on('click', documentsSettings.save);
    $('#preauth_key').on('focusout', documentsSettings.save);
    $('#use_zimbra_auth').on('click', documentsSettings.save);
  }
};

$(document).ready(function () {
  documentsSettings.initialize();
});
