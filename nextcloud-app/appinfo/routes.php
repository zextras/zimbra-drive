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
