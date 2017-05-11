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

use OCP\Settings\ISection;

class Section implements ISection
{

    public function __construct()
    {
    }

    /**
     * {@inheritdoc}
     */
    public function getID()
    {
        return Admin::SECTION_ID;
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
        return Admin::SECTION_PRIORITY;
    }

    /**
     * @since ownCloud 10.0
     * @return string
     */
    public function getIconName()
    {
        return 'config';
    }
}
