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

ZAL_VERSION=1.11
ZAL_ZIMBRA_VERSION?=dev-last

all: dist/zimbradrive-extension.jar

lib/commons-io-1.4.jar:
	mkdir -p lib
	wget https://repo1.maven.org/maven2/commons-io/commons-io/1.4/commons-io-1.4.jar \
		-O lib/commons-io-1.4.jar

lib/javax.servlet-api-3.1.0.jar:
	mkdir -p lib
	wget https://repo1.maven.org/maven2/javax/servlet/javax.servlet-api/3.1.0/javax.servlet-api-3.1.0.jar \
		-O lib/javax.servlet-api-3.1.0.jar

lib/json-20160810.jar:
	mkdir -p lib
	wget https://repo1.maven.org/maven2/org/json/json/20160810/json-20160810.jar \
		-O lib/json-20160810.jar

lib/httpcore-4.4.6.jar:
	mkdir -p lib
	wget https://repo1.maven.org/maven2/org/apache/httpcomponents/httpcore/4.4.6/httpcore-4.4.6.jar \
		-O lib/httpcore-4.4.6.jar

lib/httpclient-4.5.2.jar:
	mkdir -p lib
	wget https://repo1.maven.org/maven2/org/apache/httpcomponents/httpclient/4.5.2/httpclient-4.5.2.jar \
		-O lib/httpclient-4.5.2.jar

lib/zal.jar:
	mkdir -p lib
	wget https://github.com/btactic/openzal/releases/download/v${ZAL_VERSION}-${ZAL_ZIMBRA_VERSION}/zal-${ZAL_VERSION}-${ZAL_ZIMBRA_VERSION}.jar \
		-O lib/zal.jar

dist/zimbradrive-extension.jar: lib/commons-io-1.4.jar \
								lib/javax.servlet-api-3.1.0.jar \
								lib/json-20160810.jar \
								lib/httpcore-4.4.6.jar \
								lib/httpclient-4.5.2.jar \
								lib/zal.jar
	ant jar-bundle

clean:
	rm -rf build/*
	rm -f dist/zimbradrive-extension.jar
	rm -rf lib/zal.jar

install: guard-ZIMLET_DEV_SERVER dist/zimbradrive-extension.jar lib/zal.jar
	ssh root@${ZIMLET_DEV_SERVER} "mkdir -p /opt/zimbra/lib/ext/zimbradrive"
	scp dist/zimbradrive-extension.jar root@${ZIMLET_DEV_SERVER}:/opt/zimbra/lib/ext/zimbradrive/
	scp lib/zal.jar root@${ZIMLET_DEV_SERVER}:/opt/zimbra/lib/ext/zimbradrive/ # TODO replace with 2prev row
	ssh root@${ZIMLET_DEV_SERVER} "su - zimbra -c '/opt/zimbra/bin/zmmailboxdctl restart'"

guard-%:
	@ if [ "${${*}}" = "" ]; then \
		echo "Environment variable $* not set"; \
		exit 1; \
	fi
