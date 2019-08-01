<?php
/**
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

use OCA\ZimbraDrive\AppInfo\App;
use OCA\ZimbraDrive\Settings\AppSettings;

script(App::APP_NAME, 'admin');
style(App::APP_NAME, 'style');
$urlGenerator = \OC::$server->getURLGenerator();
$allTestUrl = $urlGenerator->linkToRoute('zimbradrive.test.all');
$enableZimbraUsersUrl = $urlGenerator->linkToRoute('zimbradrive.admin_api.enableZimbraAuthentication');
$disableZimbraUsersUrl = $urlGenerator->linkToRoute('zimbradrive.admin_api.disableZimbraAuthentication');
?>
<div class="section" id="zimbradrive">
    <h2>Zimbra Drive</h2>
    <div>
        <p><?php p($l->t('Version: ') . $l->t(\OC_App::getAppVersion('zimbradrive'))) ?></p>
    </div>
    <div>
        <input type="checkbox" class="checkbox" name="<?php print(AppSettings::ENABLE_ZIMBRA_USERS);?>" id="<?php print(AppSettings::ENABLE_ZIMBRA_USERS);?>"
               value="1" <?php if ($_[AppSettings::ENABLE_ZIMBRA_USERS]) print_unescaped('checked="checked"'); ?>>
        <label for="<?php print(AppSettings::ENABLE_ZIMBRA_USERS);?>"><?php p($l->t('Enable Zimbra authentication back end')) ?></label>
        <input type="hidden" value="<?php p($enableZimbraUsersUrl); ?>" id="url_enable_zimbra_users">
        <input type="hidden" value="<?php p($disableZimbraUsersUrl); ?>" id="url_disable_zimbra_users">
    </div>
    <div>
        <input type="checkbox" class="checkbox" name="<?php print(AppSettings::ALLOW_ZIMBRA_USERS_LOGIN);?>" id="<?php print(AppSettings::ALLOW_ZIMBRA_USERS_LOGIN);?>"
               value="1" <?php if ($_[AppSettings::ALLOW_ZIMBRA_USERS_LOGIN]) print_unescaped('checked="checked"'); ?>>
        <label for="<?php print(AppSettings::ALLOW_ZIMBRA_USERS_LOGIN);?>"><?php p($l->t('Allow Zimbra\'s users to log in')) ?></label>
    </div>
    <div>
        <label for="<?php print(AppSettings::ZIMBRA_URL);?>"><?php p($l->t('Zimbra Server')) ?></label>
        <input type="text" name="<?php print(AppSettings::ZIMBRA_URL);?>" id="<?php print(AppSettings::ZIMBRA_URL);?>" value="<?php p($_[AppSettings::ZIMBRA_URL]) ?>">
    </div>
    <div>
        <label for="<?php print(AppSettings::ZIMBRA_PORT);?>"><?php p($l->t('Zimbra Port')) ?></label>
        <input type="number" name="<?php print(AppSettings::ZIMBRA_PORT);?>" id="<?php print(AppSettings::ZIMBRA_PORT);?>" value="<?php p($_[AppSettings::ZIMBRA_PORT]) ?>">
    </div>
    <div>
        <input type="checkbox" class="checkbox" name="<?php print(AppSettings::USE_SSL);?>" id="<?php print(AppSettings::USE_SSL);?>"
           value="1" <?php if ($_[AppSettings::USE_SSL]) print_unescaped('checked="checked"'); ?>>
        <label for="<?php print(AppSettings::USE_SSL);?>"><?php p($l->t('Use SSL')) ?></label>
    </div>
    <div>
        <input type="checkbox" class="checkbox" name="check_certs" id="check_certs"
           value="1" <?php if (!$_[AppSettings::TRUST_INVALID_CERTS]) print_unescaped('checked="checked"'); if (!$_[AppSettings::USE_SSL]) print_unescaped(' disabled="disabled"');?>>
        <label for="check_certs"><?php p($l->t('Enable certificate verification')) ?></label>
    </div>
    <div>
        <label for="<?php print(AppSettings::PREAUTH_KEY);?>"><?php p($l->t('Domain Preauth Key')) ?></label>
        <input type="text" name="<?php print(AppSettings::PREAUTH_KEY);?>" id="<?php print(AppSettings::PREAUTH_KEY);?>" value="<?php p($_[AppSettings::PREAUTH_KEY]) ?>">
    </div>
    <div>
        <input type="checkbox" class="checkbox" name="<?php print(AppSettings::SET_ZIMBRA_GROUP_TO_USERS);?>" id="<?php print(AppSettings::SET_ZIMBRA_GROUP_TO_USERS);?>"
           value="1" <?php if ($_[AppSettings::SET_ZIMBRA_GROUP_TO_USERS]) print_unescaped('checked="checked"'); ?>>
        <label for="<?php print(AppSettings::SET_ZIMBRA_GROUP_TO_USERS);?>"><?php p($l->t('Set Zimbra Group to Users')) ?></label>
    </div>
    <form action="<?php p($allTestUrl); ?>">
        <input type="submit" value="Test page" />
    </form>
</div>

