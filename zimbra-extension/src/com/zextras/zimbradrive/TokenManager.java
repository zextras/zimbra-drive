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

package com.zextras.zimbradrive;

import org.openzal.zal.Account;

import java.util.HashMap;
import java.util.Map;

public class TokenManager
{

  private final Map<String, AccountToken> mTokenMap = new HashMap<>();

  public synchronized AccountToken getAccountToken(Account account)
  {
    final AccountToken accountToken;
    if (tokenExists(account.getId()))
    {
      accountToken = mTokenMap.get(account.getId());
      if (accountToken.isExpired())
      {
        accountToken.renew();
      }
    }
    else
    {
      accountToken = new AccountToken(account);
      mTokenMap.put(account.getId(), accountToken);
    }
    return accountToken;
  }

  public synchronized AccountToken getAccountToken(String accountId, String tokenStr)
  {
    if (mTokenMap.get(accountId) != null && mTokenMap.get(accountId).getToken().equals(tokenStr))
    {
      return mTokenMap.get(accountId);
    }
    return null;
  }

  public synchronized boolean tokenExists(String accountId)
  {
    return mTokenMap.containsKey(accountId);
  }

}
