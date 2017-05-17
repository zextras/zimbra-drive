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
        return new TemplateResponse(
            'zimbradrive',
            'admin',
            [
                "zimbra_url" => $this->config->getAppValue('zimbradrive', 'zimbra_url'),
                "zimbra_port" => $this->config->getAppValue('zimbradrive', 'zimbra_port'),
                "use_ssl" => $this->config->getAppValue('zimbradrive', 'use_ssl', 'true') == 'true',
                "trust_invalid_certs" => $this->config->getAppValue('zimbradrive', 'trust_invalid_certs', 'false') == 'true',
                "preauth_key" => $this->config->getAppValue('zimbradrive', 'preauth_key'),
            ],
            'blank'
        );
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
