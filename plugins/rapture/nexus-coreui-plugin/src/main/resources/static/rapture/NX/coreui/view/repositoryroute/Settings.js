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
Ext.define('NX.coreui.view.repositoryroute.Settings', {
  extend: 'Ext.form.Panel',
  alias: 'widget.nx-coreui-repositoryroute-settings',

  bodyPadding: 10,
  defaultType: 'textfield',
  autoScroll: true,

  models: [
    'Reference'
  ],

  defaults: {
    htmlDecode: true
  },

  buttonAlign: 'left',

  initComponent: function () {
    var me = this;

    me.groupStore = Ext.create('NX.coreui.store.RepositoryOfType');
    me.mon(me.groupStore, 'load', function (store) {
      store.add(Ext.create('NX.coreui.model.Reference', { id: '*', name: 'All Repository Groups' }));
    });

    me.repositoryStore = Ext.create('NX.coreui.store.RepositoryOfType');

    me.items = [
      {
        xtype: 'textfield',
        name: 'pattern',
        fieldLabel: 'URL pattern',
        emptyText: 'enter a pattern',
        allowBlank: false
      },
      {
        xtype: 'combo',
        name: 'mappingType',
        itemId: 'mappingType',
        fieldLabel: 'Rule Type',
        emptyText: 'select a type',
        allowBlank: false,
        editable: false,
        store: [
          ['BLOCKING', 'Blocking'],
          ['INCLUSION', 'Inclusive'],
          ['EXCLUSION', 'Exclusive']
        ],
        queryMode: 'local'
      },
      {
        xtype: 'combo',
        name: 'groupId',
        fieldLabel: 'Repository Group',
        emptyText: 'select a group',
        allowBlank: false,
        editable: false,
        store: me.groupStore,
        queryMode: 'local',
        displayField: 'name',
        valueField: 'id',
        width: 500
      },
      {
        xtype: 'nx-itemselector',
        name: 'mappedRepositoriesIds',
        itemId: 'mappedRepositoriesIds',
        buttons: ['up', 'add', 'remove', 'down'],
        fromTitle: 'Available Repositories',
        toTitle: 'Ordered Route Repositories',
        store: me.repositoryStore,
        valueField: 'id',
        displayField: 'name',
        delimiter: null
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

    me.reloadGroups();
    me.reloadRepositories();
  },

  reloadGroups: function () {
    var me = this;

    me.groupStore.load({
      params: {
        type: 'group'
      }
    });
  },

  reloadRepositories: function () {
    var me = this;

    // TODO: cannot load the store as the item selector used for mappedRepositoriesIds is giving errors
    if (!me.repositoryStore.getCount()) {
      me.repositoryStore.load();
    }
  }

});
