<?php
/**
 * MIT License (MIT)
 *
 * Copyright (c) 2017 Zextras SRL
 */

namespace OCA\ZimbraDrive\Settings;

use OCA\ZimbraDrive\AppInfo\Application;
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
