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
Ext.define('NX.view.dev.Permissions', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.nx-dev-permissions',

  title: 'Permissions',
  store: 'Permission',

  columns: [
    { text: 'permission', dataIndex: 'id', width: 300 },
    { text: 'create',
      xtype: 'templatecolumn',
      width: 70,
      tpl: new Ext.XTemplate(
          '<img src="{[ Ext.BLANK_IMAGE_URL ]}" class="',
          '<tpl if="value & 8">nx-icon-message-success-x16<tpl else>nx-icon-message-danger-x16</tpl>',
          '"/>'
      )
    },
    { text: 'read',
      xtype: 'templatecolumn',
      width: 70,
      tpl: new Ext.XTemplate(
          '<img src="{[ Ext.BLANK_IMAGE_URL ]}" class="',
          '<tpl if="value & 1">nx-icon-message-success-x16<tpl else>nx-icon-message-danger-x16</tpl>',
          '"/>'
      )
    },
    { text: 'update',
      xtype: 'templatecolumn',
      width: 70,
      tpl: new Ext.XTemplate(
          '<img src="{[ Ext.BLANK_IMAGE_URL ]}" class="',
          '<tpl if="value & 2">nx-icon-message-success-x16<tpl else>nx-icon-message-danger-x16</tpl>',
          '"/>'
      )
    },
    { text: 'delete',
      xtype: 'templatecolumn',
      width: 70,
      tpl: new Ext.XTemplate(
          '<img src="{[ Ext.BLANK_IMAGE_URL ]}" class="',
          '<tpl if="value & 4">nx-icon-message-success-x16<tpl else>nx-icon-message-danger-x16</tpl>',
          '"/>'
      )
    }
  ]

});