<?php
/**
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

use OCA\ZimbraDrive\AppInfo\Application;
use OCA\ZimbraDrive\Settings\AppSettings;

script(Application::APP_NAME, 'admin');

$urlGenerator = \OC::$server->getURLGenerator();
$allTestUrl = $urlGenerator->linkToRouteAbsolute('zimbradrive.test.all');

?>
<div class="section" id="zimbradrive">
    <h2>Zimbra Drive</h2>
    <div>
        <input type="checkbox" class="checkbox" name="use_zimbra_auth" id="use_zimbra_auth"
               value="1" <?php if ($_['use_zimbra_auth']) print_unescaped('checked="checked"'); ?>>
        <label for="use_zimbra_auth"><?php p($l->t('Enable authentication through Zimbra')) ?></label>
    </div>
    <div>
        <label for="zimbra_url"><?php p($l->t('Zimbra Server')) ?></label>
        <input type="text" name="zimbra_url" id="zimbra_url" value="<?php p($_[AppSettings::ZIMBRA_URL]) ?>">
    </div>
    <div>
        <label for="zimbra_port"><?php p($l->t('Zimbra Port')) ?></label>
        <input type="number" name="zimbra_port" id="zimbra_port" value="<?php p($_[AppSettings::ZIMBRA_PORT]) ?>">
    </div>
    <div>
        <input type="checkbox" class="checkbox" name="use_ssl" id="use_ssl"
           value="1" <?php if ($_[AppSettings::USE_SSL]) print_unescaped('checked="checked"'); ?>>
        <label for="use_ssl"><?php p($l->t('Use SSL')) ?></label>
    </div>
    <div>
        <input type="checkbox" class="checkbox" name="check_certs" id="check_certs"
           value="1" <?php if (!$_[AppSettings::TRUST_INVALID_CERTS]) print_unescaped('checked="checked"'); ?>>
        <label for="check_certs"><?php p($l->t('Enable certificate verification')) ?></label>
    </div>
    <div>
        <label for="preauth_key"><?php p($l->t('Domain Preauth Key')) ?></label>
        <input type="text" name="preauth_key" id="preauth_key" value="<?php p($_[AppSettings::PREAUTH_KEY]) ?>">
    </div>
    <div>
        <a href="<?php p($allTestUrl); ?>">Link to test page</a>
    </div>
</div>

