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
Ext.define('NX.view.Viewport', {
  extend: 'Ext.container.Viewport',

  // TODO: Keep the viewport simple have it delegate to another component w/fit layout so that we can
  // TODO: easily switch the entire UI (for startup/upgrade or licensing wizards)
  layout: 'border',
  items: [
    {
      xtype: 'nx-header',
      region: 'north',
      collapsible: false
    },

    // HACK: nav placeholder
    {
      xtype: 'treepanel',
      region: 'west',
      resizable: true,
      resizeHandles: 'e',

      width: 200,
      store: 'Feature',
      rootVisible: false,
      lines: false
    },

    {
      xtype: 'nx-featurebrowser',
      region: 'center'
    },

    // HACK: options placeholder
    {
      xtype: 'panel',
      region: 'east',
      title: 'Options',
      collapsible: true,
      collapsed: true,
      resizable: true,
      resizeHandles: 'w',
      items: {
        xtype: 'label',
        text: 'TEST'
      }
    },

    {
      xtype: 'nx-devtools',
      region: 'south',
      collapsible: true,
      collapsed: true,
      resizable: true,
      resizeHandles: 'n',

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
    if (window.location.search === '?debug') {
      this.down('nx-devtools').show();
    }
  }
});