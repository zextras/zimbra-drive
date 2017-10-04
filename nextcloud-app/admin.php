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

//File created to display admin's configuration on ownCloud 9.0
namespace OCA\ZimbraDrive;

use OCA\ZimbraDrive\Settings\AdminTemplate;
use OCA\ZimbraDrive\Settings\AppSettings;

$server = \OC::$server;
/**
 * @var AdminTemplate $adminTemplate
 */
$adminTemplate = $server->query('OCA\ZimbraDrive\Settings\AdminTemplate');
$template = $adminTemplate->getTemplate();

return $template->render();

