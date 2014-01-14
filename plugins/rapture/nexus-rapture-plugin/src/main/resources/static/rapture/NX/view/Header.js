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
Ext.define('NX.view.Header', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.nx-header',

  // TODO: Add branding here, but only show if configured

  items: {
    xtype: 'toolbar',
    items: [
      {
        xtype: 'image',
        src: 'http://localhost:8081/nexus/static/rapture/resources/images/nexus-16x16.png',
        autoEl: 'span',
        width: 16
      },
      {
        xtype: 'label',
        text: 'Sonatype Nexus'
      },
      '-',
      {
        xtype: 'label',
        text: 'Community Edition v3.0-beta'
      },
      '->',
      {
        xtype: 'textfield',
        emptyText: 'quick search'

      },
      '-',
      {
        xtype: 'button',
        text: 'Refresh'
      },
      {
        xtype: 'button',
        text: 'Help'
      },
      '-',
      {
        xtype: 'button',
        text: 'User',
        menu: [
          {
            text: 'Profile'
          },
          '-',
          {
            text: 'Logout'
          }
        ]
      }
    ]
  }
});
