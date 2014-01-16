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
startTest(function (t) {
  t.diag("Sanity test, loading classes on demand and verifying they were indeed loaded.");

  Ext.Direct.addProvider(NX.direct.api.REMOTING_API);

  t.requireOk('NX.capability.app.PluginConfig');
  t.requireOk('NX.capability.controller.Capabilities');
  t.requireOk('NX.capability.model.Capability');
  t.requireOk('NX.capability.model.CapabilityStatus');
  t.requireOk('NX.capability.model.CapabilityType');
  t.requireOk('NX.capability.store.Capability');
  t.requireOk('NX.capability.store.CapabilityStatus');
  t.requireOk('NX.capability.store.CapabilityType');
  t.requireOk('NX.capability.view.About');
  t.requireOk('NX.capability.view.Add');
  t.requireOk('NX.capability.view.List');
  t.requireOk('NX.capability.view.Settings');
  t.requireOk('NX.capability.view.SettingsFieldSet');
  t.requireOk('NX.capability.view.Status');
  t.requireOk('NX.capability.view.Summary');

});
