#
# Copyright (C) 2017 ZeXtras S.r.l.
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

COMMIT_ID_LONG = $(shell git rev-parse HEAD)
VERSION = $(shell fgrep "\"version\":" package.json | sed -e 's/\s*"version":\s*"\(.*\)",/\1/')

all: dist/com_btactic_drive_open.zip

.PHONY: clean

node_modules:
	npm install

build/com_btactic_drive_open.properties:
	mkdir -p build
	cp i18n/*.properties build/

build/yuicompressor.jar:
	mkdir -p build
	# In Zimbra 8.6 is used `yuicompressor-2.4.2-zimbra.jar`, but We will use the latest.
	rm -f build/yuicompressor.jar
	wget https://github.com/yui/yuicompressor/releases/download/v2.4.8/yuicompressor-2.4.8.jar -O build/yuicompressor.jar

build/com_btactic_drive_open_hdlr.min.js: build/yuicompressor.jar build/com_btactic_drive_open_hdlr.js
	mkdir -p build
	# Test the bundle file against the YUI Compressor
	java -jar build/yuicompressor.jar --type js --nomunge --preserve-semi --disable-optimizations build/com_btactic_drive_open_hdlr.js -o build/com_btactic_drive_open_hdlr.min.js

build/com_btactic_drive_open.css:
	mkdir -p build
	cp src/com_btactic_drive_open.css build/
	cp -r src/assets/ build/ && cp src/i18n/*.properties build/

build/LICENSE:
	mkdir -p build
	cp ../LICENSE build/LICENSE

build/ZimbraDrive.template:
	mkdir -p build
	cp src/ZimbraDrive.template build/ZimbraDrive.template

build/com_btactic_drive_open.xml:
	mkdir -p build
	cp src/com_btactic_drive_open.template.xml build/com_btactic_drive_open.xml
	./applyVersion

build/com_btactic_drive_open_hdlr.js: node_modules
	mkdir -p build
	npm update
	# Check T4Z project if there are modifications
	cd src/zimbra && make check-exports
	# Lint the files
	./node_modules/.bin/tslint -c tslint.json --project tsconfig.json
	./node_modules/.bin/webpack

build/VERSION:
	mkdir -p build
	echo "$(VERSION)" >> build/VERSION
	echo "$(COMMIT_ID_LONG)" >> build/VERSION

dist/com_btactic_drive_open.zip: build/com_btactic_drive_open_hdlr.min.js \
								build/com_btactic_drive_open.css \
								build/com_btactic_drive_open_hdlr.js \
								build/com_btactic_drive_open.xml \
								build/ZimbraDrive.template \
								build/LICENSE \
								build/VERSION \
								build/com_btactic_drive_open.properties
	mkdir -p build
	mkdir -p dist
	rm -f dist/com_btactic_drive_open.zip
	cd build && zip ../dist/com_btactic_drive_open.zip \
		assets/* \
		com_btactic_drive_open.css \
		com_btactic_drive_open_hdlr.js \
		com_btactic_drive_open_hdlr.js.map \
		com_btactic_drive_open.xml \
		com_btactic_drive_open.properties \
		com_btactic_drive_open*.properties \
		ZimbraDrive.template \
		VERSION \
		LICENSE

clean:
	rm -f build/com_btactic_drive_open.css \
		build/com_btactic_drive_open_hdlr.js \
		build/com_btactic_drive_open_hdlr.js.map \
		build/com_btactic_drive_open_hdlr.min.js \
		build/com_btactic_drive_open.xml \
		build/com_btactic_drive_open.properties \
		build/com_btactic_drive_open*.properties \
		build/ZimbraDrive.template \
		build/LICENSE \
		build/VERSION \
		dist/com_btactic_drive_open.zip
	rm -rf build/assets/

install: guard-ZIMLET_DEV_SERVER dist/com_btactic_drive_open.zip
	scp dist/com_btactic_drive_open.zip root@${ZIMLET_DEV_SERVER}:/tmp/
	ssh root@${ZIMLET_DEV_SERVER} "chown zimbra:zimbra /tmp/com_btactic_drive_open.zip"
	ssh root@${ZIMLET_DEV_SERVER} "su - zimbra -c '/opt/zimbra/bin/zmzimletctl deploy /tmp/com_btactic_drive_open.zip'"

push-translations:
	zanata-cli push

pull-translations:
	zanata-cli -B pull
	mv i18n/com_btactic_drive_open_en_US.properties i18n/com_btactic_drive_open.properties

guard-%:
	@ if [ "${${*}}" = "" ]; then \
		echo "Environment variable $* not set"; \
		exit 1; \
	fi
