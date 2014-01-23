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
Ext.define('NX.pluginconsole.controller.PluginConsole', {
  extend: 'Ext.app.Controller',

  requires: [
    'NX.util.Url',
    'NX.util.Permissions'
  ],

  stores: [
    'PluginInfo'
  ],
  views: [
    'Feature',
    'List'
  ],

  refs: [
    {
      ref: 'list',
      selector: 'nx-pluginconsole-list'
    }
  ],

  init: function () {
    var me = this;

    me.getApplication().getIconController().addIcon({
      name: 'feature-pluginconsole',
      file: 'plugin.png',
      variants: [ 'x16', 'x32' ]
    });

    me.listen({
      component: {
        'nx-pluginconsole-list': {
          beforerender: this.loadStores,
          selectionchange: this.onSelectionChange,
          refresh: me.loadStores
        }
      },
      store: {
        '#PluginInfo': {
          load: me.onPluginInfoStoreLoad
        }
      }
    });

    me.getApplication().getMainController().registerFeature({
      path: '/Foo/Plugins',
      view: 'NX.pluginconsole.view.Feature',
      bookmark: 'plugins',
      visible: true,
      weight: 10,
      iconCls: 'nx-icon-feature-pluginconsole-x16'
    });
  },

  loadStores: function () {
    this.getPluginInfoStore().load();
  },

  onPluginInfoStoreLoad: function (store) {
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

  showDetails: function (pluginInfoModel) {
    var me = this,
        masterdetail = me.getList().up('nx-masterdetail-panel'),
        info;

    if (Ext.isDefined(pluginInfoModel)) {
      masterdetail.setDescription(pluginInfoModel.get('name'));
      info = {
        'Name': pluginInfoModel.get('name'),
        'Version': pluginInfoModel.get('version'),
        'Status': pluginInfoModel.get('status'),
        'Description': pluginInfoModel.get('description'),
        'SCM Version': pluginInfoModel.get('scmVersion'),
        'SCM Timestamp': pluginInfoModel.get('scmTimestamp'),
        'Site': NX.util.Url.asLink(pluginInfoModel.get('site'))
      };
      if (Ext.isDefined(pluginInfoModel.get('documentation'))) {
        Ext.each(pluginInfoModel.get('documentation'), function (doc) {
          if (!Ext.isEmpty(doc.url)) {
            info['Documentation'] = NX.util.Url.asLink(doc.url, doc.label);
          }
        });
      }
      masterdetail.down("nx-info-panel").showInfo(info);
    }
  }

});