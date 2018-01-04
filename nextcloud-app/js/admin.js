/*
 * Zimbra Drive App
 * Copyright (C) 2017  Zextras Srl
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * If you require any further information, feel free to contact legal@zextras.com.
 */

/* global OC, OCP, t */

var documentsSettings = {
    appName: 'zimbradrive',

    saveUseSslValue: function (isEnabled) {
        documentsSettings.setValue('use_ssl', isEnabled);
    },

    saveCheckCerts: function (isEnabled) {
        documentsSettings.setValue('trust_invalid_certs', !isEnabled);
    },

    setEnableZimbrasUsers: function (isEnabled) {
        if (isEnabled) {
            enableZimbrasUsers();

        } else {
            disableZimbrasUsers();
        }

        function enableZimbrasUsers() {
            var requestUrl = document.getElementById("url_enable_zimbra_users").value;
            postRequest(requestUrl);
        }

        function disableZimbrasUsers() {
            var requestUrl = document.getElementById("url_disable_zimbra_users").value;
            postRequest(requestUrl);
        }


        function postRequest(url, request) {
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", url);
            xhttp.setRequestHeader("OCS-APIREQUEST", "true");
            xhttp.setRequestHeader("requesttoken", OC.requestToken);
            xhttp.send(request);
        }
    },

    setValue: function (name, value) {
        if (typeof OCP === 'undefined') {
            OC.AppConfig.setValue( //OC.AppConfig deprecated in NextCloud 11 but OCP.AppConfig is not supported on OwnCloud 9.1.4
                documentsSettings.appName,
                name,
                value
            );
        } else {
            OCP.AppConfig.setValue(
                documentsSettings.appName,
                name,
                value
            );
        }
    },

    updateCheckCertsModifiability: function (isUseSslEnabled) {
        var check_certs_item = document.getElementById('check_certs');
        if (isUseSslEnabled) {
            check_certs_item.removeAttribute('disabled');
        } else {
            check_certs_item.setAttribute('disabled', 'disabled');
        }
    },

    setAllowZimbraUsersLogin: function (isEnabled) {
        documentsSettings.setValue('allow_zimbra_users_login', isEnabled);
    },

    initialize: function () {
        setEnableZimbrasUsersUpdateHandler();
        setAllowZimbrasUsersLoginUpdateHandler();
        setUseSslUpdateHandler();
        setCheckCertsUpdateHandler();
        setZimbraUrlChangeHandler();
        setZimbraPortChangeHandler();
        setPreAuthKeyChangeHandler();


        function setEnableZimbrasUsersUpdateHandler() {
            addClickHandlerToCheckableItem("enable_zimbra_users", documentsSettings.setEnableZimbrasUsers);
        }

        function setAllowZimbrasUsersLoginUpdateHandler() {
            addClickHandlerToCheckableItem("allow_zimbra_users_login", documentsSettings.setAllowZimbraUsersLogin);
        }

        function setUseSslUpdateHandler() {
            addClickHandlerToCheckableItem("use_ssl", documentsSettings.saveUseSslValue);
            addClickHandlerToCheckableItem("use_ssl", documentsSettings.updateCheckCertsModifiability);

        }

        function setCheckCertsUpdateHandler() {
            addClickHandlerToCheckableItem("check_certs", documentsSettings.saveCheckCerts);
        }


        function addClickHandlerToCheckableItem(itemId, booleanHandler) {
            var item = document.getElementById(itemId);
            item.addEventListener('click', handler);

            function handler() {
                booleanHandler(this.checked);
            }
        }

        function setZimbraUrlChangeHandler() {
            addFocusOutSaveValeHandlerToTextValuebleItem("zimbra_url");
        }

        function setZimbraPortChangeHandler() {
            addFocusOutSaveValeHandlerToTextValuebleItem("zimbra_port");
        }

        function setPreAuthKeyChangeHandler() {
            addFocusOutSaveValeHandlerToTextValuebleItem("preauth_key");
        }

        function addFocusOutSaveValeHandlerToTextValuebleItem(itemId) {
            var zimbraUrlInputText = document.getElementById(itemId);
            zimbraUrlInputText.addEventListener('focusout', handler);

            function handler() {
                documentsSettings.setValue(this.name, this.value);
            }
        }
    }
};

document.addEventListener("DOMContentLoaded", documentsSettings.initialize);
