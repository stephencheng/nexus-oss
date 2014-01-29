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
Ext.define('NX.coreui.controller.RepositoryTargets', {
  extend: 'NX.controller.MasterDetail',
  requires: [
    'NX.Dialogs',
  ],

  list: 'nx-repositorytarget-list',

  stores: [
    'RepositoryTarget',
    'ContentClass'
  ],
  views: [
    'repositorytarget.Add',
    'repositorytarget.Feature',
    'repositorytarget.List'
  ],
  refs: [
    {
      ref: 'list',
      selector: 'nx-repositorytarget-list'
    },
    {
      ref: 'info',
      selector: 'nx-repositorytarget-feature nx-info-panel'
    }
  ],
  icons: {
    'feature-repository-targets': {
      file: 'target.png',
      variants: ['x16', 'x32']
    },
    'target-default': {
      file: 'target.png',
      variants: ['x16', 'x32']
    }
  },
  features: {
    path: '/Repository/Targets',
    view: { xtype: 'nx-repositorytarget-feature' },
    visible: function () {
      return NX.Permissions.check('nexus:targets', 'read');
    }
  },
  permission: 'nexus:targets',

  init: function () {
    var me = this;

    me.callParent();

    me.listen({
      component: {
        'nx-repositorytarget-list button[action=new]': {
          click: me.showAddWindow
        },
        'nx-repositorytarget-list button[action=delete]': {
          click: me.delete
        },
        'nx-repositorytarget-add button[action=add]': {
          click: me.create
        }
      }
    });
  },

  getDescription: function (model) {
    return model.get('name');
  },

  onSelection: function (list, model) {
    var me = this;

    if (Ext.isDefined(model)) {
      me.getInfo().showInfo({
        'Id': model.get('id'),
        'Name': model.get('name'),
        'Repository Type': model.get('contentClassId'),
        'Patterns': model.get('patterns').join(',')
      });
    }
  },

  showAddWindow: function () {
    Ext.widget('nx-repositorytarget-add');
  },

  create: function (button) {
    var me = this,
        win = button.up('window'),
        form = button.up('form');

    form.submit({
      success: function (form, action) {
        NX.Messages.add({text: 'Target created', type: 'success' });
        win.close();
        me.loadStoresAndSelect(action.result.data);
      }
    });
  },

  delete: function () {
    var me = this,
        selection = me.getList().getSelectionModel().getSelection(),
        description;

    if (selection.length) {
      description = me.getDescription(selection[0]);
      NX.Dialogs.askConfirmation('Confirm deletion?', description, function () {
        NX.direct.coreui_RepositoryTarget.delete(selection[0].getId(), function (response) {
          me.loadStores();
          if (Ext.isDefined(response) && response.success) {
            NX.Messages.add({
              text: 'Target deleted: ' + description, type: 'success'
            });
          }
        });
      }, {scope: me});
    }
  }

});