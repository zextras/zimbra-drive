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

namespace OCA\ZimbraDrive\Settings;

use OCA\ZimbraDrive\AppInfo\Application;
use OCP\Settings\ISection;
use OCP\Settings\IIconSection;
use OCP\IURLGenerator;
use OCP\IL10N;

class SectionBase
{
    /**
     * {@inheritdoc}
     */
    public function getID()
    {
        return 'zimbradrive';
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'Zimbra Drive';
    }

    /**
     * {@inheritdoc}
     */
    public function getPriority()
    {
        return 75;
    }
}

if (interface_exists('OCP\\Settings\\IIconSection'))
{
    class Section extends SectionBase implements IIconSection
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
    class Section extends SectionBase implements ISection
    {
        public function __construct()
        {
        }
   }
}

