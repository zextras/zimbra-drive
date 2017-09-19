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

