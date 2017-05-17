<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */

namespace OCA\ZimbraDrive\Settings;

use OCA\ZimbraDrive\AppInfo\Application;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;
use OCP\Settings\ISettings;

class Admin implements ISettings
{
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
        return 'zimbradrive';
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
        return 0;
    }
}
