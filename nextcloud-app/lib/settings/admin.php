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

use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;
use OCP\Settings\ISettings;
use OCP\Template;

class Admin implements ISettings
{
    const SECTION_PRIORITY = 0;
    const SECTION_ID = 'zimbradrive';
    /**
     * @var AdminTemplate
     */
    private $adminTemplate;

    /**
     * @param AdminTemplate $adminTemplate
     */
    public function __construct(AdminTemplate $adminTemplate)
    {
        $this->adminTemplate = $adminTemplate;
    }

    /**
     * @return TemplateResponse
     */
    public function getForm()
    {
        $template = $this->adminTemplate->getTemplate();
        return $template;
    }

    /**
     * @return string
     */
    public function getSection()
    {
        return self::SECTION_ID;
    }

    /**
     * @return int
     */
    public function getPriority()
    {
        return self::SECTION_PRIORITY;
    }

    /**
     * @since ownCloud 10.0
     * @return TemplateResponse | Template
     */
    public function getPanel()
    {
        return $this->getForm();
    }

    /**
     * @since ownCloud 10.0
     * @return string
     */
    public function getSectionID()
    {
        return $this->getSection();
    }
}
