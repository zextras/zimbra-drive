Zimbra Drive
============

Zimbra and NextCloud integration.

Features:
- Use Zimbra credentials in NextCloud / OwnCloud.
- Navigate NextCloud / OwnCloud files inside Zimbra.
- Manage NextCloud / OwnCloud files inside Zimbra (Move, Rename).
- Attach NextCloud / OwnCloud files to email.

Supported Versions:
- NextCloud: 10+
- OwnCloud: 9+

## Install

### 0. Check package integrity
Verify the files using the provided `md5` file:
```bash
md5sum -c zimbra-drive.md5
```

### 1. Extract files
Extract `zimbra_drive.tgz`
```bash
mkdir /tmp/zimbradrive
tar -xvf zimbra_drive.tgz --directory /tmp/zimbradrive
```

### 2. Install the Zimbra Extension
- Create directory `/opt/zimbra/lib/ext/zimbradrive`
- From `/tmp/zimbradrive/zimbra-extension/`, copy `zal-1.11.8-8.6.0.jar`, `zimbradrive-extension.conf.example` and `zimbradrive-extension.jar` in `/opt/zimbra/lib/ext/zimbradrive`
- Rename `zimbradrive-extension.conf.example` in `zimbradrive-extension.conf`
- Restart the mailbox to let the extension to be loaded correctly.
```bash
zmmailboxdctl restart
```

### 2. Configure the Zimbra Extension
Change `/opt/zimbra/lib/ext/zimbradrive/zimbradrive-extension.conf` and set the user's domains and the url to `index.php` of your the Own/Next Cloud server
```json
{
  "domains": {
    "example.com": "https://mycloud.example.com/index.php",
    "example2.com": "https://mycloud2.example.com/index.php"
  }
}
```
 For security reason is strongly recommended to use https.

### 3. Install the ZimbraDrive zimlet
Change owner and group of `/tmp/zimbradrive/zimlet/com_zextras_drive_open.zip`
```bash
chown zimbra:zimbra /tmp/com_zextras_drive_open.zip
```
Deploy zimlet
```bash
zmzimletctl deploy /tmp/com_zextras_drive_open.zip
```

### 4. Install NextCloud ZimbraDrive App
Extract `/tmp/zimbradrive/nextcloud-app/zimbradrive.tar.gz` in the folder `apps` of Own/Next Cloud.  
Login in Own/Next Cloud as an administrator, in `App` menu, enable `ZimbraDrive`.

### 5. Configure NextCloud ZimbraDrive App
Configure the Zimbra Server into to the `Zimbra Drive` section in the **Admin Configuration** of Your NextCloud instance.  

`Enable authentication through Zimbra` must be enabled to let Zimbra's users login.  
To manually enable the authentication through Zimbra add these lines to the Own/Next Cloud configuration:
```php
'user_backends' => array (
 0 => array (
   'class' => 'OC_User_Zimbra',
   'arguments' => array(),
 ),
),
```

`Domain Preauth Key` must be set to let Own/Next Cloud user go to Zimbra mail box.
The preauth key can be generate with:
```bash
zmprov generateDomainPreAuthKey domain.com
```
If the preauth key already exists, it can be obtained with:
```bash
zmprov getDomain domain.com zimbraPreAuthKey
```

## Uninstall

### Remove all Zimbra Users from NextCloud / OwnCloud

If the administrator remove the NextCloud / OwnCloud App the Zimbra users will not be visible anymore in the
NextCloud / OwnCloud administration panel.

**WARNING:** This process will delete all the Zimbra Users data from NextCloud / OwnCloud and is not reversible.

To remove all the Zimbra Users from the NextCloud / OwnCloud installation run this command:
```bash
cd /var/www/nextcloud # Go to the OCC path
mysql_pwd='password'  # Set the database password
occ_db='nextcloud'    # Set the database name for the NextCloud / OwnCloud

mysql -u root --password="${mysql_pwd}" "${occ_db}" -N -s \
    -e 'SELECT `uid` FROM `oc_zimbradrive_users`' \
    | while read uid; do \
        sudo -u www-data php ./occ user:delete "${uid}"; \
        mysql -u root --password="${mysql_pwd}" "${occ_db}" \
            -e "DELETE FROM oc_accounts WHERE uid = '${uid}' LIMIT 1"; \
      done
```
