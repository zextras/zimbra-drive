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

app_name=zimbradrive

all: dist/zimbradrive.tar.gz

clean:
	rm -rf build/*
	rm -f dist/zimbradrive.tar.gz

dist/zimbradrive.tar.gz:
	mkdir -p build
	mkdir -p dist
	rsync -rv \
		--exclude=Makefile \
		--exclude=*.iml \
		--exclude=.gitignore \
		--exclude=dist \
		--exclude=.git \
		--exclude=build/ \
		. build/$(app_name)/
	cp LICENSE build/LICENSE
	cd "build/$(app_name)" && find . -type f -not -name "$(app_name).md5" -exec md5sum "{}" + > "$(app_name).md5"
	cd build/ && tar cvzf $(app_name).tar.gz $(app_name) --owner=0 --group=0
	mv build/$(app_name).tar.gz dist/

install: guard-MYCLOUD_DEV_SERVER dist/zimbradrive.tar.gz
	scp dist/zimbradrive.tar.gz root@${MYCLOUD_DEV_SERVER}:/tmp/
	ssh root@${MYCLOUD_DEV_SERVER} "cd /var/www/nextcloud/apps && rm -rf zimbradrive/ && tar -xvzf /tmp/zimbradrive.tar.gz"

guard-%:
	@ if [ "${${*}}" = "" ]; then \
		echo "Environment variable $* not set"; \
		exit 1; \
	fi
