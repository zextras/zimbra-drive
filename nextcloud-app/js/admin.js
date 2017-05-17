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
  save: function (event) {
    var element = $(event.srcElement);
    var elementName = element.attr('name');
    var elementValue;

    switch (elementName) {
      case 'zimbra_url':
        elementValue = element.val();
        break;
      case 'preauth_key':
        elementValue = element.val();
        break;
      case 'zimbra_port':
        elementValue = parseInt(element.val(), 10);
        break;
      case 'use_ssl':
      case 'trust_invalid_certs':
        elementValue = (element.attr('checked') === 'checked');
        break;
      default:
        elementValue = null;
    }

    if (elementValue !== null) {
      OC.msg.startAction('#zimbradrive-admin-msg', t('zimbradrive', 'Saving...'));
      OCP.AppConfig.setValue(
        'zimbradrive',
        elementName,
        elementValue,
        {
          success: documentsSettings.afterSave,
          error: documentsSettings.afterSave
        }
      );
    }
  },

  afterSave: function (response) {
    OC.msg.finishedSuccess('#zimbradrive-admin-msg', t('zimbradrive', 'Settings saved'));
  },

  initialize: function () {
    $('#zimbra_url').on('focusout', documentsSettings.save);
    $('#zimbra_port').on('focusout', documentsSettings.save);
    $('#use_ssl').on('click', documentsSettings.save);
    $('#trust_invalid_certs').on('click', documentsSettings.save);
    $('#preauth_key').on('focusout', documentsSettings.save);
  }
};

$(document).ready(function () {
  documentsSettings.initialize();
});
