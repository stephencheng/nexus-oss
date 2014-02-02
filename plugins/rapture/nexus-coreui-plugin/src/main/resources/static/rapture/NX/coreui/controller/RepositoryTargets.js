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

  models: [
    'RepositoryTarget'
  ],
  stores: [
    'RepositoryTarget',
    'ContentClass'
  ],
  views: [
    'repositorytarget.Add',
    'repositorytarget.Feature',
    'repositorytarget.List',
    'repositorytarget.Settings'
  ],
  refs: [
    {
      ref: 'list',
      selector: 'nx-repositorytarget-list'
    },
    {
      ref: 'info',
      selector: 'nx-repositorytarget-feature nx-info-panel'
    },
    {
      ref: 'settings',
      selector: 'nx-repositorytarget-feature nx-repositorytarget-settings'
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
        },
        'nx-repositorytarget-settings button[action=save]': {
          click: me.update
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
      me.getSettings().loadRecord(model);
    }
  },

  showAddWindow: function () {
    Ext.widget('nx-repositorytarget-add');
  },

  create: function (button) {
    var me = this,
        win = button.up('window'),
        form = button.up('form'),
        model = me.getRepositoryTargetModel().create(),
        values = form.getValues();

    model.set(values);

    NX.direct.coreui_RepositoryTarget.create(model.data, function (response) {
      if (Ext.isDefined(response)) {
        if (response.success) {
          win.close();
          NX.Messages.add({
            text: 'Target created: ' + me.getDescription(me.getRepositoryTargetModel().create(response.data)),
            type: 'success'
          });
          me.loadStoresAndSelect(response.data.id);
        }
        else if (Ext.isDefined(response.errors)) {
          form.getForm().markInvalid(response.errors);
        }
      }
    });
  },

  update: function (button) {
    var me = this,
        form = button.up('form'),
        model = form.getRecord(),
        values = form.getValues();

    model.set(values);

    NX.direct.coreui_RepositoryTarget.update(model.data, function (response) {
      if (Ext.isDefined(response)) {
        if (response.success) {
          NX.Messages.add({
            text: 'Target updated: ' + me.getDescription(me.getRepositoryTargetModel().create(response.data)),
            type: 'success'
          });
          me.loadStores();
        }
        else if (Ext.isDefined(response.errors)) {
          form.getForm().markInvalid(response.errors);
        }
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