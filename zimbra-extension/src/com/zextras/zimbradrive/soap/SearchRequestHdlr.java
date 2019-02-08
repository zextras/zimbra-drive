/*
 * Copyright (C) 2017 ZeXtras SRL
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

package com.zextras.zimbradrive.soap;


import com.zextras.zimbradrive.*;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.impl.client.BasicResponseHandler;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONArray;
import org.openzal.zal.soap.*;

import java.io.IOException;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class SearchRequestHdlr implements SoapHandler
{
  private static final String COMMAND = "Search";

  public static final QName QNAME = new QName(COMMAND +"Request", ZimbraDriveExtension.SOAP_NAMESPACE);
  private static final QName RESPONSE_QNAME = new QName(COMMAND + "Response", ZimbraDriveExtension.SOAP_NAMESPACE);

  private final CloudHttpRequestUtils mCloudHttpRequestUtils;

  public SearchRequestHdlr(CloudHttpRequestUtils cloudHttpRequestUtils)
  {
    mCloudHttpRequestUtils = cloudHttpRequestUtils;
  }

  @Override
  public void handleRequest(ZimbraContext zimbraContext, SoapResponse soapResponse, ZimbraExceptionContainer zimbraExceptionContainer)
  {
    try
    {
      privateHandleRequest(zimbraContext, soapResponse);
    } catch (Exception exception)
    {
      zimbraExceptionContainer.setException(exception);
    }
  }

  private void privateHandleRequest(ZimbraContext zimbraContext, SoapResponse soapResponse) throws IOException
  {
    soapResponse.setQName(RESPONSE_QNAME);

    String query = zimbraContext.getParameter("query", "");
    soapResponse.setValue("query", query);

    String requestedTypesCsv = zimbraContext.getParameter("types", "");
    soapResponse.setValue("types", requestedTypesCsv);

    Boolean isCaseSensitive = false;
    if(zimbraContext.getParameterMap().containsKey(ZimbraDriveItem.F_CASESENSITIVE))
    {
      isCaseSensitive = true;
      soapResponse.setValue(ZimbraDriveItem.F_CASESENSITIVE, "");
    }

    if (query.equals("")) { return; }
    String parsedQuery = getStandardQuery(query);

    String[] requestedTypesArray = requestedTypesCsv.split(",");
    if(requestedTypesArray.length == 1 && requestedTypesArray[0].length() == 0)
    {
      requestedTypesArray = new String[]{ZimbraDriveItem.F_NODE_TYPE_FILE,
        ZimbraDriveItem.F_NODE_TYPE_FOLDER};
    }

    JSONArray defaultTypesJsonArray = new JSONArray(requestedTypesArray);
    requestedTypesCsv = defaultTypesJsonArray.toString();


    HttpResponse response = queryDriveOnCloudServerService(zimbraContext,
        parsedQuery,
        isCaseSensitive,
        requestedTypesCsv);
    BasicResponseHandler basicResponseHandler = new BasicResponseHandler();
    String responseBody = basicResponseHandler.handleResponse(response);  //throw HttpResponseException if status code >= 300

    mCloudHttpRequestUtils.appendArrayNodesAttributeToSoapResponse(soapResponse, responseBody);
  }

  private String getStandardQuery(String query) {
    StringBuilder parsedQueryBuilder = new StringBuilder();

    Pattern nonQuotedTokenSValuePattern = Pattern.compile("([^ :]+:)([^\"]*?)( |$)"); //preTokenDelimiter tokenName : nonQuotedTokenValue postTokenDelimiter
    Matcher nonQuotedTokenSValueMatcher = nonQuotedTokenSValuePattern.matcher(query);
    int lastMatchEndIndex = 0;
    while(nonQuotedTokenSValueMatcher.find())
    {
      String preMatchValueQuery = query.substring(lastMatchEndIndex, nonQuotedTokenSValueMatcher.end(1));

      String matchValueQuery = query.substring(nonQuotedTokenSValueMatcher.start(2), nonQuotedTokenSValueMatcher.end(2));

      parsedQueryBuilder.append(preMatchValueQuery).append("\"").append(matchValueQuery).append("\"");

      lastMatchEndIndex  = nonQuotedTokenSValueMatcher.end(2);
    }

    parsedQueryBuilder.append(query.substring(lastMatchEndIndex));

    return  parsedQueryBuilder.toString();
  }

  private HttpResponse queryDriveOnCloudServerService(final ZimbraContext zimbraContext,
                                                      final String query,
                                                      Boolean isCaseSensitive,
                                                      final String types) throws IOException {
    List<NameValuePair> driveOnCloudParameters = mCloudHttpRequestUtils.createDriveOnCloudAuthenticationParams(zimbraContext);
    driveOnCloudParameters.add(new BasicNameValuePair("query", query));
    driveOnCloudParameters.add(new BasicNameValuePair("types", types));
    driveOnCloudParameters.add(new BasicNameValuePair("caseSensitive", isCaseSensitive.toString()));
    return mCloudHttpRequestUtils.sendRequestToCloud(zimbraContext, driveOnCloudParameters, COMMAND + "Request",
      "2.0");
  }

  @Override
  public boolean needsAdminAuthentication(ZimbraContext zimbraContext)
  {
    return false;
  }

  @Override
  public boolean needsAuthentication(ZimbraContext zimbraContext)
  {
    return true;
  }

}
