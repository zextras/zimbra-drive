<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */

/**
 * Create your routes in here. The name is the lowercase name of the controller
 * without the controller part, the stuff after the hash is the method.
 * e.g. page#index -> OCA\ZimbraDrive\Controller\PageController->index()
 *
 * The controller class has to be registered in the application.php file since
 * it's instantiated in there
 */
return [
    'routes' => [
        ['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],
        ['name' => 'zimbra_drive_api#searchRequest', 'url' => '/api/1.0/SearchRequest', 'verb' => 'POST'],
        ['name' => 'zimbra_drive_api#getAllFolders', 'url' => '/api/1.0/GetAllFolders', 'verb' => 'POST'],
        ['name' => 'zimbra_drive_api#getFile', 'url' => '/api/1.0/GetFile', 'verb' => 'POST'],
        ['name' => 'zimbra_drive_api#uploadFile', 'url' => '/api/1.0/UploadFile', 'verb' => 'POST'],
        ['name' => 'zimbra_drive_api#delete', 'url' => '/api/1.0/Delete', 'verb' => 'POST'],
        ['name' => 'zimbra_drive_api#move', 'url' => '/api/1.0/Move', 'verb' => 'POST'],
        ['name' => 'zimbra_drive_api#newDirectory', 'url' => '/api/1.0/NewDirectory', 'verb' => 'POST'],
        ['name' => 'zimbra_drive_api#uploadFile', 'url' => '/api/1.0/UploadFile', 'verb' => 'POST'],
        ['name' => 'admin_api#enableZimbraAuthentication', 'url' => '/admin/EnableZimbraAuthentication', 'verb' => 'POST'],
        ['name' => 'admin_api#disableZimbraAuthentication', 'url' => '/admin/DisableZimbraAuthentication', 'verb' => 'POST'],
        ['name' => 'test#all', 'url' => '/test/All', 'verb' => 'GET'],
        ['name' => 'test#connectivityTest', 'url' => '/test/ConnectivityTest', 'verb' => 'GET'],
    ]
];
