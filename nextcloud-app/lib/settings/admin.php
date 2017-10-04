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
