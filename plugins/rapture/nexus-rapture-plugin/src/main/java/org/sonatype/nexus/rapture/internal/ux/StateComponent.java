/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2007-2013 Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */

package org.sonatype.nexus.rapture.internal.ux;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;
import javax.servlet.http.HttpSession;

import org.sonatype.nexus.ApplicationStatusSource;
import org.sonatype.nexus.SystemStatus;
import org.sonatype.nexus.extdirect.DirectComponentSupport;
import org.sonatype.nexus.rapture.Rapture;
import org.sonatype.nexus.util.DigesterUtils;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.softwarementors.extjs.djn.config.annotations.DirectAction;
import com.softwarementors.extjs.djn.config.annotations.DirectPollMethod;
import com.softwarementors.extjs.djn.servlet.ssm.WebContextManager;
import org.apache.commons.lang.ObjectUtils;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * State Ext.Direct component.
 *
 * @since 2.8
 */
@Named
@Singleton
@DirectAction(action = "rapture_State")
public class StateComponent
    extends DirectComponentSupport
{

  private final Rapture rapture;

  private final ApplicationStatusSource applicationStatusSource;

  private final SecurityComponent security;

  private final static Gson gson = new GsonBuilder().create();

  @Inject
  public StateComponent(final Rapture rapture,
                        final ApplicationStatusSource applicationStatusSource,
                        final SecurityComponent security)
  {
    this.rapture = checkNotNull(rapture, "rapture");
    this.applicationStatusSource = checkNotNull(applicationStatusSource);
    this.security = checkNotNull(security);
  }

  @DirectPollMethod(event = "rapture_State_get")
  public StateXO get(final Map<String, String> parameters) {
    StateXO stateXO = new StateXO();

    stateXO.setValues(getValues());
    stateXO.setCommands(getCommands());

    return stateXO;
  }

  public Map<String, Object> getValues() {
    HashMap<String, Object> values = Maps.newHashMap();

    send(values, "license", getLicense());
    send(values, "uiSettings", rapture.getSettings());
    send(values, "user", security.getUser());

    return values;
  }

  public List<CommandXO> getCommands() {
    List<CommandXO> commands = Lists.newArrayList();

    send(commands, security.getCommands());

    return commands;
  }

  private void send(final Map<String, Object> values, final String key, final Object value) {
    boolean shouldSend = shouldSend(key, value);
    if (shouldSend) {
      values.put(key, value);
    }
  }

  private void send(List<CommandXO> toSend, final List<CommandXO> commands) {
    if (commands != null) {
      toSend.addAll(commands);
    }
  }

  public static boolean shouldSend(final String key, final Object value) {
    boolean shouldSend = true;
    if (WebContextManager.isWebContextAttachedToCurrentThread()) {
      HttpSession session = WebContextManager.get().getRequest().getSession(false);
      if (session != null) {
        String sessionAttribute = "state-digest-" + key;
        String currentDigest = (String) session.getAttribute(sessionAttribute);
        String newDigest = null;
        if (value != null) {
          // TODO is there another way to not use serialized json? :D
          newDigest = DigesterUtils.getSha1Digest(gson.toJson(value));
        }
        if (ObjectUtils.equals(currentDigest, newDigest)) {
          shouldSend = false;
        }
        else {
          if (newDigest != null) {
            session.setAttribute(sessionAttribute, newDigest);
          }
          else {
            session.removeAttribute(sessionAttribute);
          }
        }
      }
    }
    return shouldSend;
  }

  public LicenseXO getLicense() {
    LicenseXO licenseXO = new LicenseXO();
    SystemStatus status = applicationStatusSource.getSystemStatus();

    licenseXO.setRequired(!"OSS".equals(status.getEditionShort()));
    licenseXO.setInstalled(status.isLicenseInstalled());

    return licenseXO;
  }

}
