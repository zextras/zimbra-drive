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

namespace OCA\ZimbraDrive\Settings;

use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;
use OCP\Settings\ISettings;
use OCP\Template;

class Admin implements ISettings
{
    const SECTION_PRIORITY = 75;
    const SECTION_ID = 'zimbradrive';
    /** @var IConfig */
    private $config;

    /**
     * @param IConfig $config
     */
    public function __construct(IConfig $config)
    {
        $this->config = $config;
    }

    /**
     * @return TemplateResponse
     */
    public function getForm()
    {
        $appSettings = new AppSettings($this->config);
        $adminTemplate = new AdminTemplate($this->config, $appSettings);
        $template = $adminTemplate->getTemplate();
        return $template;
    }

    /**
     * @return string the section ID, e.g. 'sharing'
     */
    public function getSection()
    {
        return self::SECTION_ID;
    }

    /**
     * @return int whether the form should be rather on the top or bottom of
     * the admin section. The forms are arranged in ascending order of the
     * priority values. It is required to return a value between 0 and 100.
     *
     * keep the server setting at the top, right after "server settings"
     */
    public function getPriority()
    {
        return self::SECTION_PRIORITY;
    }

    /**
     * The panel controller method that returns a template to the UI
     * @since ownCloud 10.0
     * @return TemplateResponse | Template
     */
    public function getPanel()
    {
        return $this->getForm();
    }

    /**
     * A string to identify the section in the UI / HTML and URL
     * @since ownCloud 10.0
     * @return string
     */
    public function getSectionID()
    {
        return $this->getSection();
    }
}
