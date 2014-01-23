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

  // TODO: Add branding here, but only show if configured

  items: {
    xtype: 'toolbar',

    // dark background with south border highlight
    border: '0 0 2 0',
    style: {
      backgroundColor: '#000000',
      borderColor: '#4d801a'
    },

    defaults: {
      ui: 'header',
      scale: 'medium'
    },

    items: [
      {
        xtype: 'nx-header-logo'
      },
      {
        xtype: 'label',
        id: 'name',
        text: 'Sonatype Nexus',
        style: {
          'color': '#FFFFFF',
          'font-size': '20px'
        }
      },
      '-',
      {
        xtype: 'nx-header-version'
      },
      '->',
      {
        xtype: 'nx-header-quicksearch',
        width: 250
      },
      '-',
      {
        xtype: 'button',
        text: 'Refresh',
        action: 'refresh'
      },
      {
        xtype: 'button',
        text: 'Help',
        menu: [
          // HACK: This is context help for the selected feature, should update when feature changes
          { text: 'Repositories' },
          '-',
          { text: 'About' },
          { text: 'Manual' },
          { text: 'Support' }
        ]
      },
      '-',
      {
        xtype: 'button',
        text: 'Login',
        action: 'login',
        hidden: false
      },
      {
        xtype: 'button',
        text: 'User',
        action: 'user',
        hidden: true,
        menu: [
          {
            text: 'Profile'
          },
          '-',
          {
            text: 'Logout',
            action: 'logout'
          }
        ]
      }
    ]
  }
});
