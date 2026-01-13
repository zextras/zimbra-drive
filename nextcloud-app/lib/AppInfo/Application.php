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

use Closure;
use OCA\ZimbraDrive\Service\LogService;
use OCA\ZimbraDrive\Service\DisableZimbraDriveHandler;
use OCP\App\ManagerEvent;
use OC;
use OCP\EventDispatcher\IEventDispatcher;
use OCP\INavigationManager;
use OCP\IServerContainer;
use OCP\IURLGenerator;
use OCP\L10N\IFactory;
use OCP\Server;

use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;

use Psr\Log\LoggerInterface;

class Application extends App implements IBootstrap
{
    const APP_ID = 'zimbradrive';

    public function __construct(array $urlParams=[]){
        parent::__construct(self::APP_ID, $urlParams);
    }

    public function register(IRegistrationContext $context): void {

        $context->registerService('IUserSession', function($c) {
            return $c->query('ServerContainer')->getUserSession();
        });

        $context->registerService('LogService', function($c) {
            $logger = $c->query(LoggerInterface::class);

            return new LogService($logger, self::APP_ID);
        });

        $context->registerService('IServerContainer', function($c) {
            return $c->query('ServerContainer');
        });

        $context->registerService('IConfig', function($c) {
            return $c->query('ServerContainer')->getConfig();
        });
    }

    public function boot(IBootContext $context): void {
        $context->injectFn(Closure::fromCallable([$this, 'registerNavigation']));

        $serverContainer = $context->getServerContainer();
        /** @var IEventDispatcher $eventDispatcher */
        $eventDispatcher = $serverContainer->get(IEventDispatcher::class);

        $eventDispatcher->addListener(ManagerEvent::EVENT_APP_DISABLE, function (ManagerEvent $event) {
            DisableZimbraDriveHandler::handle(array ('app' => $event->getAppID()));
        });
    }

    /**
    * Register Navigation Tab
    *
    * @param IServerContainer $container
    */
    protected function registerNavigation(IServerContainer $container) {
      try {
        $container->get(INavigationManager::class)
              ->add(fn () => $this->zimbraDriveNavigation());
      } catch (RouteNotFoundException $e) {
      }
    }

    /**
    * @return array
    */
    private function zimbraDriveNavigation(): array {
      /** @var IURLGenerator $urlGen */
      $urlGen = OC::$server->get(IURLGenerator::class);
      $l = Server::get(IFactory::class)->get(self::APP_ID);

      return [
        'id'    => self::APP_ID,
        'order' => 10,
        'href'  => $urlGen->linkToRoute('zimbradrive.page.index'),
        'icon'  => $urlGen->imagePath(self::APP_ID, 'app.svg'),
        'name'  => $l->t('Zimbra')
      ];
    }

}
