<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
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

