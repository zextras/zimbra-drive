<?php
/**
 * Copyright 2017 Zextras Srl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

use OCA\ZimbraDrive\AppInfo\Application;
use OCA\ZimbraDrive\Settings\AppSettings;

script(Application::APP_NAME, 'admin');
style(Application::APP_NAME, 'style');
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
           value="1" <?php if (!$_[AppSettings::TRUST_INVALID_CERTS]) print_unescaped('checked="checked"'); ?>>
        <label for="check_certs"><?php p($l->t('Enable certificate verification')) ?></label>
    </div>
    <div>
        <label for="<?php print(AppSettings::PREAUTH_KEY);?>"><?php p($l->t('Domain Preauth Key')) ?></label>
        <input type="text" name="<?php print(AppSettings::PREAUTH_KEY);?>" id="<?php print(AppSettings::PREAUTH_KEY);?>" value="<?php p($_[AppSettings::PREAUTH_KEY]) ?>">
    </div>
    <form action="<?php p($allTestUrl); ?>">
        <input type="submit" value="Test page" />
    </form>
</div>

