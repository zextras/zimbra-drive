/*
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

package com.zextras.zimbradrive.statustest;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.impl.client.HttpClientBuilder;

import java.io.IOException;
import java.net.*;

public class ConnectionTestUtils {

  public boolean pingHost(URL url, int connectionTimeout) throws MalformedURLException {
    String host = url.getHost();
    int port = url.getPort();
    if(port == -1)
    {
      if(url.getProtocol().equals("https"))
      {
        port = 443;
      }else {
        port = 80;
      }
    }
    try (Socket socket = new Socket()) {
      InetSocketAddress inetSocketAddress = new InetSocketAddress(host, port);
      socket.connect(inetSocketAddress, connectionTimeout);
      return true;
    } catch (IOException e) {
      return false; // Either timeout or unreachable or failed DNS lookup.
    }
  }

  public String assertHttpGetRequestResponse(URL url) throws URISyntaxException, IOException {
    HttpGet httpGet = new HttpGet(url.toURI());

    HttpClient client = HttpClientBuilder.create().build();
    HttpResponse httpResponse;
      httpResponse = client.execute(httpGet);

    BasicResponseHandler basicResponseHandler = new BasicResponseHandler();
    return basicResponseHandler.handleResponse(httpResponse);
  }
}
