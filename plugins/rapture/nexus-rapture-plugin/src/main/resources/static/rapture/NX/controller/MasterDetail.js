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
Ext.define('NX.controller.MasterDetail', {
  extend: 'Ext.app.Controller',
  requires: [
    'NX.util.Permissions'
  ],

  mixins: {
    logAware: 'NX.LogAware'
  },

  init: function () {
    var me = this,
        store = me.stores[0],
        componentListener = {},
        storeListener = {};

    componentListener[me.list] = {
      beforerender: me.loadStores,
      selectionchange: me.onSelectionChange,
      refresh: me.loadStores,
      selection: me.onSelection
    };
    storeListener['#' + store] = {
      load: me.onStoreLoad
    };

    me.listen({
      component: componentListener,
      store: storeListener
    });
    me.listen({
      controller: {
        '#User': {
          permissionsChanged: me.applyPermissions
        }
      }
    });

    if (Ext.isDefined(me.icons)) {
      me.getApplication().getIconController().addIcons(me.icons);
    }
    if (Ext.isDefined(me.features)) {
      me.getApplication().getMainController().registerFeature(me.features);
    }
  },

  onSelection: Ext.emptyFn,

  onPermissionsChanged: Ext.emptyFn,

  getDescription: Ext.emptyFn,

  isListRendered: function () {
    var me = this;

    return Ext.isDefined(me.getList());
  },

  loadStores: function () {
    var me = this;

    Ext.each(me.stores, function (store) {
      me.getApplication().getStore(store).load();
    });
  },

  onStoreLoad: function () {
    var me = this,
        sm;

    if (me.isListRendered()) {
      sm = me.getList().getSelectionModel();
      me.onSelectionChange(sm, sm.getSelection());
    }
  },

  onSelectionChange: function (selectionModel, selected) {
    var me = this,
        tabs = me.getList().up('nx-masterdetail-panel').down('nx-masterdetail-tabs'),
        model;

    if (Ext.isDefined(selected) && selected.length > 0) {
      model = selected[0];
      tabs.getLayout().setActiveItem(1);
      tabs.setDescription(me.getDescription(model));
    }
    else {
      tabs.setTitle('Empty selection');
      tabs.getLayout().setActiveItem(0);
    }

    me.getList().fireEvent('selection', me.getList(), model);
  },

  applyPermissions: function () {
    var me = this;

    if (me.isListRendered()) {
      me.onPermissionsChanged();
    }
  }

});