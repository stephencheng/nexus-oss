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

import org.sonatype.nexus.ApplicationStatusSource;
import org.sonatype.nexus.SystemStatus;
import org.sonatype.nexus.extdirect.DirectComponentSupport;
import org.sonatype.nexus.rapture.Rapture;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.softwarementors.extjs.djn.config.annotations.DirectAction;
import com.softwarementors.extjs.djn.config.annotations.DirectPollMethod;

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

    stateXO.setValues(get());

    List<CommandXO> commands = Lists.newArrayList();
    stateXO.setCommands(commands);
    CommandXO fetchPermissionsCommand = security.checkPermissions();
    if (fetchPermissionsCommand != null) {
      commands.add(fetchPermissionsCommand);
    }

    return stateXO;
  }

  public Map<String, Object> get() {
    HashMap<String, Object> status = Maps.newHashMap();

    // TODO only set if values changed
    setIfNotNull(status, "license", getLicense());
    setIfNotNull(status, "uiSettings", rapture.getSettings());
    status.put("user", security.getUser());

    return status;
  }

  private void setIfNotNull(final Map<String, Object> status, final String key, final Object value) {
    if (value != null) {
      status.put(key, value);
    }
  }

  public LicenseXO getLicense() {
    LicenseXO licenseXO = new LicenseXO();
    SystemStatus status = applicationStatusSource.getSystemStatus();

    licenseXO.setRequired(!"OSS".equals(status.getEditionShort()));
    licenseXO.setInstalled(status.isLicenseInstalled());

    return licenseXO;
  }

}
