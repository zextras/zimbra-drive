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

OC::$CLASSPATH['OC_User_Zimbra'] = 'zimbradrive/lib/Auth/OC_User_Zimbra.php';

use OCA\ZimbraDrive\Service\StorageService;
use OCA\ZimbraDrive\Service\LogService;
use OCA\ZimbraDrive\Service\QueryService;
use OCP\AppFramework\App;

class Application extends App {

    public function __construct(array $urlParams=array()){
        parent::__construct('zimbradrive', $urlParams);

        $container = $this->getContainer();

        $container->registerService('IUserSession', function($c) {
            return $c->query('ServerContainer')->getUserSession();
        });

        $container->registerService('ILogger', function($c) {
            return $c->query('ServerContainer')->getLogger();
        });

        $container->registerService('LogService', function($c) {
            $logger = $c->query('ILogger');
            $appName = $c->query('AppName');

            return new LogService($logger, $appName);
        });

        $container->registerService('IServerContainer', function($c) {
            return $c->query('ServerContainer');
        });

        $container->registerService('StorageService', function($c) {
            $logger = $c->query('ILogger');
            $serverContainer = $c->query('IServerContainer');
            return new StorageService($serverContainer, $logger);
        });

        $container->registerService('QueryService', function($c) {
            $logger = $c->query('ILogger');
            return new QueryService($logger);
        });

    }
}

$app = new Application();

$container = $app->getContainer();

$container->query('OCP\INavigationManager')->add(function () use ($container) {
    $urlGenerator = $container->query('OCP\IURLGenerator');
    $l10n = $container->query('OCP\IL10N');
    return [
        // the string under which your app will be referenced in NextCloud
        'id' => 'zimbradrive',

        // sorting weight for the navigation. The higher the number, the higher
        // will it be listed in the navigation
        'order' => 10,

        // the route that will be shown on startup
        'href' => $urlGenerator->linkToRoute('zimbradrive.page.index'),

        // the icon that will be shown in the navigation
        // this file needs to exist in img/
        'icon' => $urlGenerator->imagePath('zimbradrive', 'app.svg'), // TODO: Put the Zimbra icon here!

        // the title of your application. This will be used in the
        // navigation or on the settings page of your app
        'name' => $l10n->t('Zimbra'),
    ];
});
