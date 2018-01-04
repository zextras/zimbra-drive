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

namespace OCA\ZimbraDrive\Settings;

use OCA\ZimbraDrive\AppInfo\App;
use OCP\Settings\ISection;
use OCP\Settings\IIconSection;
use OCP\IURLGenerator;
use OCP\IL10N;

if (interface_exists('OCP\\Settings\\IIconSection'))
{
    class Section extends AbstractSection implements IIconSection
    {
        private $url;

        public function __construct(IURLGenerator $url, IL10N $l)
        {
            $this->url = $url;
        }

        public function getIcon()
        {
            return $this->url->imagePath('zimbradrive', 'app-dark.svg');
        }
    }
}
else
{
    class Section extends AbstractSection implements ISection
    {
        public function __construct()
        {
            \OC_Util::addStyle('zimbradrive', 'style');
        }

        public function getIconName()
        {
            return 'zimbradrive';
        }
   }
}

