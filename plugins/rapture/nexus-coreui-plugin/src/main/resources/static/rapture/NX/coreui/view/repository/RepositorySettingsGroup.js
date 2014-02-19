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
Ext.define('NX.coreui.view.repository.RepositorySettingsGroup', {
  extend: 'Ext.form.Panel',
  alias: 'widget.nx-repository-settings-group',

  api: {
    submit: 'NX.direct.coreui_Repository.updateGroup'
  },
  trackResetOnLoad: true,

  bodyPadding: 10,
  defaultType: 'textfield',
  autoScroll: true,

  defaults: {
    allowBlank: false,
    htmlDecode: true
  },

  buttonAlign: 'left',

  initComponent: function () {
    var me = this;

    me.repositoriesStore = Ext.create('NX.coreui.store.RepositoryOfType');
    me.reloadRepositories();

    me.items = [
      {
        name: 'id',
        itemId: 'id',
        fieldLabel: 'Group Id',
        emptyText: 'enter a repository id',
        readOnly: true
      },
      {
        name: 'name',
        fieldLabel: 'Group Name',
        emptyText: 'enter a repository name'
      },
      {
        name: 'providerName',
        fieldLabel: 'Provider',
        value: me.template.providerName,
        readOnly: true,
        submitValue: false,
        allowBlank: true
      },
      {
        name: 'formatName',
        fieldLabel: 'Format',
        value: me.template.formatName,
        readOnly: true,
        submitValue: false,
        allowBlank: true
      },
      {
        xtype: 'checkbox',
        name: 'publishUrl',
        fieldLabel: 'Publish URL',
        value: true
      },
      {
        xtype: 'nx-itemselector',
        name: 'memberRepositoryIds',
        buttons: ['up', 'add', 'remove', 'down'],
        fromTitle: 'Available Repositories',
        toTitle: 'Ordered Member Repositories',
        store: me.repositoriesStore,
        valueField: 'id',
        displayField: 'name',
        delimiter: null
      }
    ];

    if (!me.buttons) {
      me.buttons = [
        { text: 'Save', action: 'save', ui: 'primary' },
        { text: 'Discard', action: 'discard' }
      ];
    }

    me.callParent(arguments);
  },

  reloadRepositories: function () {
    var me = this;

    // TODO: cannot load the store as the item selector used for members is giving errors
    if (me.repositoriesStore.getCount() === 0) {
      me.repositoriesStore.load({
        params: {
          format: me.template.format
        }
      });
    }
  }

});
