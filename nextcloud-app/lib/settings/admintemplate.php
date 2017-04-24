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

use OCA\ZimbraDrive\AppInfo\Application;
use OCA\ZimbraDrive\Controller\AdminApiController;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\IConfig;

class AdminTemplate
{
    public static function getTemplate(IConfig $config)
    {
        /** @var array $user_backends */
        $user_backends = $config->getSystemValue(AdminApiController::USER_BACKEND_VAR_NAME, array());
        /** @var bool $isUserBackEndOC_User_ZimbraDefined */
        $isUserBackEndOC_User_ZimbraDefined = false;
        foreach($user_backends as $user_backend){
            $class = $user_backend['class'];
            if(isset($class) && $class === AdminApiController::ZIMBRA_USER_BACKEND_CLASS_VALUE)
            {
                $isUserBackEndOC_User_ZimbraDefined = true;
                break;
            }
        }

        $template = new TemplateResponse(
            Application::APP_NAME,
            'admin',
            [
                "zimbra_url" => $config->getAppValue(Application::APP_NAME, 'zimbra_url'),
                "zimbra_port" => $config->getAppValue(Application::APP_NAME, 'zimbra_port'),
                "use_ssl" => $config->getAppValue(Application::APP_NAME, 'use_ssl', 'true') == 'true',
                "trust_invalid_certs" => $config->getAppValue(Application::APP_NAME, 'trust_invalid_certs', 'false') == 'true',
                "preauth_key" => $config->getAppValue(Application::APP_NAME, 'preauth_key'),
                "use_zimbra_auth" => $isUserBackEndOC_User_ZimbraDefined,
            ],
            'blank'
        );

        return $template;
    }
}