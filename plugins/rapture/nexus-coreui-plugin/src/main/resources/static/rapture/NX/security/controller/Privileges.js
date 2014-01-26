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
Ext.define('NX.security.controller.Privileges', {
  extend: 'Ext.app.Controller',

  requires: [
    'NX.util.Permissions'
  ],

  stores: [
    'Privilege'
  ],
  views: [
    'privilege.Feature',
    'privilege.List'
  ],

  refs: [
    {
      ref: 'list',
      selector: 'nx-privilege-list'
    }
  ],

  init: function () {
    var me = this;

    me.getApplication().getIconController().addIcons({
      'feature-privileges': {
        file: 'medal_gold_1.png',
        variants: ['x16', 'x32']
      }
    });

    me.listen({
      component: {
        'nx-privilege-list': {
          beforerender: this.loadStores,
          selectionchange: this.onSelectionChange,
          refresh: me.loadStores
        }
      },
      store: {
        '#Privilege': {
          load: me.onPrivilegeStoreLoad
        }
      }
    });

    me.getApplication().getMainController().registerFeature({
      path: '/Security/Privileges',
      view: 'NX.security.view.privilege.Feature',
      bookmark: 'privileges',
      weight: 10,
      iconName: 'feature-privileges',
      visible: function () {
        return NX.util.Permissions.check('security:privileges', 'read');
      }
    });
  },

  loadStores: function () {
    this.getPrivilegeStore().load();
  },

  onPrivilegeStoreLoad: function (store) {
    var selectedModels = this.getList().getSelectionModel().getSelection();
    if (selectedModels.length > 0) {
      this.showDetails(store.getById(selectedModels[0].getId()));
    }
  },

  onSelectionChange: function (selectionModel, selectedModels) {
    if (selectedModels.length > 0) {
      this.showDetails(selectedModels[0]);
    }
  },

  showDetails: function (model) {
    var me = this,
        masterdetail = me.getList().up('nx-masterdetail-panel'),
        info;

    if (Ext.isDefined(model)) {
      masterdetail.setDescription(model.get('name'));
      info = {
        'Id': model.get('id'),
        'Name': model.get('name'),
        'Description': model.get('description')
      };
      masterdetail.down("nx-info-panel").showInfo(info);
    }
  }

});