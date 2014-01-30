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
Ext.define('NX.view.header.Panel', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.nx-header-panel',

  layout: {
    type: 'vbox',
    align: 'stretch',
    pack: 'start'
  },

  items: [
    { xtype: 'nx-header-branding', hidden: true },
    {
      xtype: 'toolbar',

      style: {
        backgroundColor: '#000000'
      },
      anchor: '100%',

      defaults: {
        ui: 'header',
        scale: 'medium'
      },

      items: [
        { xtype: 'nx-header-logo' },
        {
          xtype: 'label',
          text: 'Sonatype Nexus',
          style: {
            'color': '#FFFFFF',
            'font-size': '20px'
          }
        },
        '->',
        { xtype: 'nx-header-dashboard-mode' },
        { xtype: 'nx-header-search-mode' },
        { xtype: 'nx-header-browse-mode' },
        { xtype: 'nx-header-admin-mode' },
        '->',
        { xtype: 'nx-searchbox', itemId: 'quicksearch', emptyText: 'quick search' },
        ' ',
        { xtype: 'nx-header-refresh' },
        { xtype: 'nx-header-help' },
        '-',
        { xtype: 'nx-header-login' },
        { xtype: 'nx-header-user', hidden: true },
        { xtype: 'nx-header-logout' }
      ]
    }
  ]
});
