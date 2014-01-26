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
Ext.define('NX.view.Main', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.nx-main',

  layout: 'border',

  defaults: {
    border: true
  },

  items: [
    {
      xtype: 'nx-header-panel',
      region: 'north',
      collapsible: false
    },

    {
      xtype: 'nx-feature-menu',
      region: 'west',
      collapsible: true,
      collapsed: false,
      resizable: true,
      resizeHandles: 'e'
    },

    {
      xtype: 'nx-feature-content',
      region: 'center'
    },

    {
      xtype: 'nx-message-panel',
      region: 'east',
      collapsible: true,
      collapsed: true,
      resizable: true,
      resizeHandles: 'w'
    },

    {
      xtype: 'nx-dev-panel',
      region: 'south',
      collapsible: true,
      collapsed: true,
      resizable: true,
      resizeHandles: 'n',

      // keep initial constraints to prevent huge panels
      height: 300,

      // default to hidden, only show if debug enabled
      hidden: true
    }
  ],

  /**
   * @protected
   */
  initComponent: function() {
    this.callParent();

    // if debug enabled, show developer tools
    if (NX.app.settings.debugEnabled && window.location.search === '?debug') {
      this.down('nx-dev-panel').show();
    }
  }
});