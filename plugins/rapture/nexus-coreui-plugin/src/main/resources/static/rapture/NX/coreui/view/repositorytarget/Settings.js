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
Ext.define('NX.coreui.view.repositorytarget.Settings', {
  extend: 'Ext.form.Panel',
  alias: 'widget.nx-coreui-repositorytarget-settings',

  api: {
    submit: 'NX.direct.coreui_RepositoryTarget.update'
  },

  bodyPadding: 10,
  defaultType: 'textfield',
  autoScroll: true,

  defaults: {
    htmlDecode: true
  },

  buttonAlign: 'left',

  initComponent: function () {
    var me = this;

    me.items = [
      {
        xtype: 'hiddenfield',
        name: 'id'
      },
      {
        xtype: 'textfield',
        name: 'name',
        itemId: 'name',
        fieldLabel: 'Name',
        emptyText: 'enter a target name',
        //allowBlank: false
      },
      {
        xtype: 'combo',
        name: 'contentClassId',
        fieldLabel: 'Repository Type',
        emptyText: 'select a repository type',
        //allowBlank: false,
        store: 'ContentClass',
        queryMode: 'local',
        displayField: 'name',
        valueField: 'id'
      },
      {
        xtype: 'nx-valueset',
        name: 'patterns',
        itemId: 'patterns',
        fieldLabel: 'Patterns',
        emptyText: 'enter a pattern expression',
        //allowBlank: false,
        sorted: true,
        //height: 600
      }
    ];

    if (!me.buttons) {
      me.buttons = [
        { text: 'Save', action: 'save', ui: 'primary' },
        { text: 'Discard',
          handler: function () {
            var form = this.up('form');
            form.loadRecord(form.getRecord());
          }
        }
      ];
    }

    me.callParent(arguments);
  }

});
