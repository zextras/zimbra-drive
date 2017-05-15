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

import java.util.UUID;

public class AccountToken
{
  private static long EXPIRATION = 12 * 60 * 60 * 1000L;

  private long mCreation;
  private final Account mAccount;
  private String mToken;

  public AccountToken(Account account)
  {
    mAccount = account;
    renew();
  }

  public boolean isExpired()
  {
    return System.currentTimeMillis() >= mCreation + EXPIRATION;
  }

  public Account getAccount()
  {
    return mAccount;
  }

  public String getToken()
  {
    return mToken;
  }

  public void renew()
  {
    mCreation = System.currentTimeMillis();
    mToken = UUID.randomUUID().toString().replace("-", "");
  }
}
