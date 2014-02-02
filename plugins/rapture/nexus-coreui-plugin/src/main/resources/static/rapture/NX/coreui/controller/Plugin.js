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
Ext.define('NX.coreui.controller.Plugin', {
  extend: 'Ext.app.Controller',
  mixins: {
    logAware: 'NX.LogAware'
  },

  views: [
    'system.General',
    'system.Http',
    'system.Notifications'
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.getApplication().getIconController().addIcons({
      'feature-system-general': {
        file: 'wrench.png',
        variants: ['x16', 'x32']
      },
      'feature-system-http': {
        file: 'transmit.png',
        variants: ['x16', 'x32']
      },
      'feature-system-notifications': {
        file: 'emails.png',
        variants: ['x16', 'x32']
      }
    });

    // HACK: Show some items only if user is logged in for testing
    var visibleIfLoggedIn = function () {
      return me.getApplication().getUserController().hasUser();
    };

    me.getApplication().getFeaturesController().registerFeature([
      {
        mode: 'admin',
        path: '/System/General',
        view: 'NX.coreui.view.system.General',
        visible: visibleIfLoggedIn
      },
      {
        mode: 'admin',
        path: '/System/HTTP',
        view: 'NX.coreui.view.system.Http',
        visible: visibleIfLoggedIn
      },
      {
        mode: 'admin',
        path: '/System/Notifications',
        view: 'NX.coreui.view.system.Notifications',
        visible: visibleIfLoggedIn
      },
    ]);
  }
});