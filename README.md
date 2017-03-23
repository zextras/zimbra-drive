Zimbra Drive
============

Zimbra and NextCloud integration.

Features:
- Use Zimbra credentials in NextCloud

## Installation

### 0. Check package integrity
Verify the files using the provided `md5` file:
```bash
md5sum -c zimbra-drive.md5
```

### 1. Install the Zimbra Extension
Install the Zimbra Extension and restart the mailbox to let the extension to be loaded correctly.

### 2. Configure the Zimbra Extension
Add a configuration file for the zimbra extension at `/opt/zimbra/lib/ext/zimbradrive/zimbradrive-extension.conf` with
the content like the example:
```json
{
  "domains": {
    "example.com": "https://mycloud.example.com"
  }
}
```

### 3. Install NextCloud ZimbraDrive App
Install and activate the `ZimbraDrive` App for NextCloud.

### 4. Configure NextCloud ZimbraDrive App
Configure the Zimbra Server into to the `Zimbra Drive` section in the **Admin Configuration** of Your NextCloud instance.

### 5. Edit NextCloud Configuration
Add these lines to the NextCloud configuration to allow Zimbra users to use their credentials to use NextCloud:
```php
'user_backends' => array (
    0 => array (
      'class' => 'OC_User_Zimbra',
      'arguments' => array(),
    ),
  ),
```
