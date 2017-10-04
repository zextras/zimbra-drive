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
