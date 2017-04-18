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

namespace OCA\ZimbraDrive;


use OCP\AppFramework\Http\TemplateResponse;

$server = \OC::$server;
$config = $server->getConfig();

$template = new TemplateResponse(
    'zimbradrive',
    'admin',
    [
        "zimbra_url" => $config->getAppValue('zimbradrive', 'zimbra_url'),
        "zimbra_port" => $config->getAppValue('zimbradrive', 'zimbra_port'),
        "use_ssl" => $config->getAppValue('zimbradrive', 'use_ssl', 'true') == 'true',
        "trust_invalid_certs" => $config->getAppValue('zimbradrive', 'trust_invalid_certs', 'false') == 'true',
        "preauth_key" => $config->getAppValue('zimbradrive', 'preauth_key'),
    ],
    'blank'
);

return $template->render();

?>

