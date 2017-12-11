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

namespace OCA\ZimbraDrive\AppInfo;

use OCA\ZimbraDrive\Service\LogService;
use OCA\ZimbraDrive\Service\DisableZimbraDriveHandler;
use OCP\App\ManagerEvent;
use OC;
use OCP\IURLGenerator;


class App extends \OCP\AppFramework\App
{
    const APP_NAME = 'zimbradrive';

    public function __construct(array $urlParams=array()){
        parent::__construct(self::APP_NAME, $urlParams);

        $container = $this->getContainer();

        $container->registerService('IUserSession', function($c) {
            return $c->query('ServerContainer')->getUserSession();
        });

        $container->registerService('ILogger', function($c) {
            return $c->query('ServerContainer')->getLogger();
        });

        $container->registerService('LogService', function($c) {
            $logger = $c->query('ILogger');

            return new LogService($logger, self::APP_NAME);
        });

        $container->registerService('IServerContainer', function($c) {
            return $c->query('ServerContainer');
        });

        $container->registerService('IConfig', function($c) {
            return $c->query('ServerContainer')->getConfig();
        });
    }
}

OC::$CLASSPATH['OC_User_Zimbra'] = 'zimbradrive/lib/auth/oc_user_zimbra.php';

$app = new App();

if(!interface_exists('OCP\Settings\ISettings'))  // ISettings not supported in OwnCloud 9.1.4
{
    \OCP\App::registerAdmin(App::APP_NAME, 'admin');
}

$container = $app->getContainer();

$container->query('OCP\INavigationManager')->add(function () use ($container) {
    /** @var IURLGenerator $urlGenerator */
    $urlGenerator = $container->query('OCP\IURLGenerator');
    $l10n = $container->query('OCP\IL10N');
    return [
        // the string under which your app will be referenced in *Cloud
        'id' => App::APP_NAME,

        // sorting weight for the navigation. The higher the number, the higher
        // will it be listed in the navigation
        'order' => 10,

        // the route that will be shown on startup
        'href' => $urlGenerator->linkToRoute('zimbradrive.page.index'),

        // the icon that will be shown in the navigation
        // this file needs to exist in img/
        'icon' => $urlGenerator->imagePath(App::APP_NAME, 'app.svg'),

        // the title of your application. This will be used in the
        // navigation or on the settings page of your app
        'name' => $l10n->t('Zimbra'),
    ];
});

$dispatcher = $container->getServer()->getEventDispatcher();
$listener = function($event) {
    if ($event instanceof ManagerEvent) {
        DisableZimbraDriveHandler::handle(array ('app' => $event->getAppID()));
    }
};
$dispatcher->addListener('OCP\App\IAppManager::disableApp', $listener);