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

//File created to display admin's configuration on ownCloud 9.0
namespace OCA\ZimbraDrive;

use OCA\ZimbraDrive\Settings\AdminTemplate;
use OCA\ZimbraDrive\Settings\AppSettings;

$server = \OC::$server;
$config = $server->getConfig();

$appSettings = new AppSettings($config);
$adminTemplate = new AdminTemplate($config, $appSettings);
$template = $adminTemplate->getTemplate();

return $template->render();

