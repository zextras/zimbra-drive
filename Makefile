#
# Copyright (C) 2017 ZeXtras SRL
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation, version 2 of
# the License.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License.
# If not, see <http://www.gnu.org/licenses/>.
#

# Remember to edit these values also in `zimbra-extension/Makefile`
ZAL_VERSION=1.11
ZAL_VERSION_EXTENDED=1.11.8
ZIMBRA_VERSION=8.7.10

all: dist/zimbra_drive.tgz dist/zimbradrive.tar.gz dist/zimbra_drive.md5

clean:
	rm -rf build/nextcloud-app \
		build/zimbra-extension \
		build/zimlet
	rm -f build/LICENSE	\
		build/README.md \
		build/zimbra_drive.md5 \
		dist/zimbra_drive.tgz \
		dist/zimbra_drive.md5 \
		dist/zimbradrive.tar.gz
	cd nextcloud-app && make clean
	cd zimbra-extension && make clean
	cd zimlet && make clean

# (Own|Next)Cloud App
nextcloud-app/dist/zimbradrive.tar.gz:
	cd nextcloud-app && make dist/zimbradrive.tar.gz

build/nextcloud-app/zimbradrive.tar.gz: nextcloud-app/dist/zimbradrive.tar.gz
	mkdir -p build/nextcloud-app
	cp nextcloud-app/dist/zimbradrive.tar.gz build/nextcloud-app/

# Zimbra Extension
build/zimbra-extension/zimbradrive-extension.conf.example:
	mkdir -p build/zimbra-extension
	cp zimbra-extension/zimbradrive-extension.conf.example build/zimbra-extension/

build/zimbra-extension/zal-${ZAL_VERSION_EXTENDED}-${ZIMBRA_VERSION}.jar:
	mkdir -p build/zimbra-extension
	cd zimbra-extension && make lib/zal-${ZAL_VERSION_EXTENDED}-${ZIMBRA_VERSION}.jar
	cp zimbra-extension/lib/zal-${ZAL_VERSION_EXTENDED}-${ZIMBRA_VERSION}.jar build/zimbra-extension/

zimbra-extension/dist/zimbradrive-extension.jar:
	cd zimbra-extension && make dist/zimbradrive-extension.jar

build/zimbra-extension/zimbradrive-extension.jar: build/zimbra-extension/zimbradrive-extension.conf.example \
													build/zimbra-extension/zal-${ZAL_VERSION_EXTENDED}-${ZIMBRA_VERSION}.jar \
													zimbra-extension/dist/zimbradrive-extension.jar
	mkdir -p build/zimbra-extension
	cp zimbra-extension/dist/zimbradrive-extension.jar build/zimbra-extension/

# Zimlet for Zimbra
zimlet/dist/com_zextras_drive_open.zip:
	cd zimlet && make dist/com_zextras_drive_open.zip

build/zimlet/com_zextras_drive_open.zip: zimlet/dist/com_zextras_drive_open.zip
	mkdir -p build/zimlet
	cp zimlet/dist/com_zextras_drive_open.zip build/zimlet/

# Project package
build/README.md:
	mkdir -p build
	cp README.md build/

build/LICENSE:
	mkdir -p build
	cp LICENSE build/

build/zimbra_drive.md5: build/README.md \
						build/LICENSE \
						build/zimbra-extension/zimbradrive-extension.jar \
						build/zimlet/com_zextras_drive_open.zip
	mkdir -p build
	cd build && find . -type f -not -name "zimbra_drive.md5" -exec md5sum "{}" + > zimbra_drive.md5

dist/zimbra_drive.tgz: build/README.md \
						build/LICENSE \
						build/zimbra-extension/zimbradrive-extension.jar \
						build/zimlet/com_zextras_drive_open.zip \
						build/zimbra_drive.md5
	mkdir -p build
	mkdir -p dist
	cd build && tar -czvf ../dist/zimbra_drive.tgz \
		zimbra-extension/ \
		zimlet/ \
		README.md \
		LICENSE \
		zimbra_drive.md5 \
		--owner=0 --group=0

dist/zimbradrive.tar.gz: build/nextcloud-app/zimbradrive.tar.gz
	mkdir -p build
	mkdir -p dist
	cp build/nextcloud-app/zimbradrive.tar.gz dist/zimbradrive.tar.gz

dist/zimbra_drive.md5: dist/zimbra_drive.tgz
	cd dist && md5sum zimbra_drive.tgz > zimbra_drive.md5
