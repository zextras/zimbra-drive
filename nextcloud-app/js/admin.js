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

  saveUseSslValueFromCheckbox: function (event) {
    var element = $(event.srcElement);
    var elementValue = (element.attr('checked') === 'checked');
    documentsSettings.setValue('use_ssl', elementValue);
  },

  saveCheckCertsFromCheckbox: function (event) {
    var element = $(event.srcElement);
    var elementValue = (element.attr('checked') !== 'checked');
    documentsSettings.setValue('trust_invalid_certs', elementValue);
  },

  setAppValueFromInputTextElement: function (event) {
    var element = $(event.srcElement);
    var elementName = element.attr('name');
    var elementValue = element.val();
    documentsSettings.setValue(elementName, elementValue);
  },

  setAppValueFromInputNumber: function (event) {
    var element = $(event.srcElement);
    var elementName = element.attr('name');
    var elementValue = parseInt(element.val(), 10);
    documentsSettings.setValue(elementName, elementValue);
  },

  modifyZimbraAuthentication: function (event) {
    var element = $(event.srcElement);
    var requestUrl;
    if((element.attr('checked') === 'checked'))
    {
      requestUrl = $('#url_enable_use_zimbra_auth').attr('value');
    } else
    {
      requestUrl = $('#url_disable_use_zimbra_auth').attr('value');
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

  updateCheckCertsCheckbox: function () {
    var use_ssl_element = $('#use_ssl');
    var check_certs_checkbox = $('#check_certs');
    if((use_ssl_element.attr('checked') === 'checked'))
    {
      check_certs_checkbox.removeAttr('disabled');
    } else
    {
      check_certs_checkbox.attr('disabled', 'disabled');
    }
  },

  initialize: function () {
    $('#zimbra_url').on('focusout', documentsSettings.setAppValueFromInputTextElement);
    $('#zimbra_port').on('focusout', documentsSettings.setAppValueFromInputNumber);

    var use_ssl_checkbox = $('#use_ssl');
    use_ssl_checkbox.on('click', documentsSettings.saveUseSslValueFromCheckbox);
    use_ssl_checkbox.on('click', documentsSettings.updateCheckCertsCheckbox);

    $('#check_certs').on('click', documentsSettings.saveCheckCertsFromCheckbox);
    $('#preauth_key').on('focusout', documentsSettings.setAppValueFromInputTextElement);
    $('#use_zimbra_auth').on('click', documentsSettings.modifyZimbraAuthentication);

    documentsSettings.updateCheckCertsCheckbox();
  }
};

$(document).ready(function () {
  documentsSettings.initialize();
});
