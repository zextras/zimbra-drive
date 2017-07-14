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

namespace OCA\ZimbraDrive\Response;

use OC\Files\Filesystem;
use OCA\ZimbraDrive\Service\BadRequestException;
use OCP\AppFramework\Http\ICallbackResponse;
use OCP\AppFramework\Http\IOutput;
use OCP\AppFramework\Http\Response;
use OCP\Files\File;
use \OC\Files\View;

class DownloadFileResponse extends Response  implements ICallbackResponse
{
    /** @var File $file */
    private $file;

    /** @var NodeLocker  */
    private $nodeLocker;

    /** @var View  */
    private $view;

    /**
     * Creates a response that prompts the user to download the file
     * @param File $file
     * @throws BadRequestException
     */
    public function __construct(File $file)
    {
        $this->file = $file;

        $this->nodeLocker = new NodeLocker($this->file);

        $this->view = Filesystem::getView();
    }

    /**
     *
     * @param IOutput $output a small wrapper that handles output
     * @since 8.1.0
     */
    public function callback (IOutput $output)
    {
        $this->nodeLocker->lock();

        $this->streamFileTo($output);

        $this->nodeLocker->unlock();
    }

    private function streamFileTo(IOutput $output)
    {
        $filename = $this->file->getName();
        $contentType = \OC::$server->getMimeTypeDetector()->getSecureMimeType(Filesystem::getMimeType($this->file->getPath()));

        $output->setHeader('Content-Disposition: attachment; filename="' . $filename . '"');
        $output->setHeader('Content-Type: ' . $contentType);

        $fileHandler = $this->file->fopen('rb');

        fpassthru($fileHandler);

        fclose($fileHandler);
    }

}