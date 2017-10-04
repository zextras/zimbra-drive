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

namespace OCA\ZimbraDrive\Response;

use OCA\ZimbraDrive\Service\BadRequestException;
use OCP\AppFramework\Http\ICallbackResponse;
use OCP\AppFramework\Http\IOutput;
use OCP\AppFramework\Http\Response;
use OCP\Files\File;
use OCP\Files\Folder;
use OCP\Files\Node;

class DownloadNodeResponse extends Response  implements ICallbackResponse
{
    /** @var  ICallbackResponse */
    private $downloadResponseInstance;

    public function __construct(DownloadItemResponseFactory $downloadResponseFactory, Node $node) {
        if( $node instanceof Folder )
        {
            /** @var Folder $node */
            $this->downloadResponseInstance = $downloadResponseFactory->makeDownloadZipFolderResponseFactory($node);
        } elseif ($node instanceof File)
        {
            /** @var File $node */
            $this->downloadResponseInstance = $downloadResponseFactory->makeDownloadFileResponse($node);
        } else
        {
            throw new BadRequestException($node->getPath() . " is not a file or a folder.");
        }
    }

    /**
     *
     * @param IOutput $output a small wrapper that handles output
     * @since 8.1.0
     */
    public function callback (IOutput $output)
    {
        $this->downloadResponseInstance->callback ($output);
    }

}