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
        ['name' => 'zimbra_drive_api#move', 'url' => '/api/1.0/Move ', 'verb' => 'POST'],
        ['name' => 'zimbra_drive_api#newDirectory', 'url' => '/api/1.0/NewDirectory ', 'verb' => 'POST'],
        ['name' => 'zimbra_drive_api#uploadFile', 'url' => '/api/1.0/UploadFile ', 'verb' => 'POST'],
        ['name' => 'connectivity_test#connectivityTest', 'url' => '/api/1.0/ConnectivityTest ', 'verb' => 'GET']
    ]
];
