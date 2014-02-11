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

  list: 'nx-coreui-repositorytarget-list',

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
      selector: 'nx-coreui-repositorytarget-list'
    },
    {
      ref: 'info',
      selector: 'nx-coreui-repositorytarget-feature nx-info-panel'
    },
    {
      ref: 'settings',
      selector: 'nx-coreui-repositorytarget-feature nx-coreui-repositorytarget-settings'
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
    view: { xtype: 'nx-coreui-repositorytarget-feature' },
    visible: function () {
      return NX.Permissions.check('nexus:targets', 'read');
    }
  },
  permission: 'nexus:targets',

  init: function () {
    var me = this;

    me.callParent();

    me.listen({
      store: {
        '#ContentClass': {
          load: me.reselect
        }
      },
      controller: {
        '#Refresh': {
          refresh: me.loadContentClass
        }
      },
      component: {
        'nx-coreui-repositorytarget-list': {
          beforerender: me.loadContentClass
        },
        'nx-coreui-repositorytarget-list button[action=new]': {
          click: me.showAddWindow
        },
        'nx-coreui-repositorytarget-add button[action=add]': {
          click: me.create
        },
        'nx-coreui-repositorytarget-settings button[action=save]': {
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
    Ext.widget('nx-coreui-repositorytarget-add');
  },

  loadContentClass: function () {
    var me = this,
        list = me.getList();

    if (list) {
      me.getContentClassStore().load();
    }
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
          me.loadStoreAndSelect(response.data.id);
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
          me.loadStore();
        }
        else if (Ext.isDefined(response.errors)) {
          form.getForm().markInvalid(response.errors);
        }
      }
    });
  },

  /**
   * @override
   * Delete repository target.
   * @param model repository target to be deleted
   */
  deleteModel: function (model) {
    var me = this,
        description = me.getDescription(model);

    NX.direct.coreui_RepositoryTarget.delete(model.getId(), function (response) {
      me.loadStore();
      if (Ext.isDefined(response) && response.success) {
        NX.Messages.add({
          text: 'Target deleted: ' + description, type: 'success'
        });
      }
    });
  }

});