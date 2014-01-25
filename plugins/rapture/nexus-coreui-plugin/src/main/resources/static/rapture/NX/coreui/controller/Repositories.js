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
Ext.define('NX.coreui.controller.Repositories', {
  extend: 'Ext.app.Controller',

  requires: [
    'NX.util.Url',
    'NX.util.Msg',
    'NX.util.ExtDirect',
    'NX.util.Permissions'
  ],

  stores: [
    'Repository'
  ],
  views: [
    'Repositories',
    'RepositoryList'
  ],

  refs: [
    {
      ref: 'list',
      selector: 'nx-repository-list'
    }
  ],

  init: function () {
    var me = this;

    me.getApplication().getIconController().addIcons({
      'feature-repositories': {
        file: 'database.png',
        variants: ['x16', 'x32']
      }
    });

    me.listen({
      controller: {
        '#User': {
          permissionsChanged: me.applyPermissions
        }
      },
      store: {
        '#Repository': {
          load: me.onRepositoryStoreLoad,
          beforeload: me.onRepositoryStoreBeforeLoad
        }
      },
      component: {
        'nx-repository-list': {
          beforerender: me.onListRendered,
          selectionchange: me.onSelectionChange,
          refresh: me.loadStores
        },
        'nx-repository-list button[action=delete]': {
          click: me.deleteRepository
        }
      }
    });

    me.getApplication().getMainController().registerFeature([
      {
        path: '/Repository/Repositories',
        view: 'NX.coreui.view.Repositories',
        bookmark: 'repositories',
        iconName: 'feature-repositories',
        visible: function () {
          var perms = NX.util.Permissions;
          return perms.check('nexus:repositories', perms.READ);
        }
      }
    ]);
  },

  onListRendered: function () {
    var me = this;

    me.loadStores();
    me.applyPermissions();
  },

  loadStores: function () {
    this.getRepositoryStore().load();
  },

  onRepositoryStoreBeforeLoad: function () {
    this.getList().down('button[action=delete]').disable();
  },

  onRepositoryStoreLoad: function (store) {
    var me = this,
        selectedModels = me.getList().getSelectionModel().getSelection();

    if (selectedModels.length > 0) {
      me.applyPermissions();
      me.showDetails(store.getById(selectedModels[0].getId()));
    }
  },

  onSelectionChange: function (selectionModel, selectedModels) {
    var me = this;

    if (selectedModels.length > 0) {
      me.applyPermissions();
      me.showDetails(selectedModels[0]);
    }
  },

  showDetails: function (repositoryModel) {
    var me = this,
        masterdetail = me.getList().up('nx-masterdetail-panel'),
        info;

    if (Ext.isDefined(repositoryModel)) {
      masterdetail.setDescription(repositoryModel.get('name'));
      info = {
        'Id': repositoryModel.get('id'),
        'Name': repositoryModel.get('name'),
        'type': repositoryModel.get('type'),
        'Format': repositoryModel.get('format'),
        'Local status': me.getLocalStatus(repositoryModel),
        'Proxy mode': me.getProxyMode(repositoryModel),
        'Remote status': me.getRemoteStatus(repositoryModel),
        'Url': NX.util.Url.asLink(repositoryModel.get('url'))
      };
      masterdetail.down('nx-info-panel').showInfo(info);
    }
  },

  deleteRepository: function () {
    var me = this,
        selection = me.getList().getSelectionModel().getSelection();

    if (Ext.isDefined(selection) && selection.length > 0) {
      NX.util.Msg.askConfirmation('Confirm deletion?', me.describeRepository(selection[0]), function () {
        NX.direct.Repository.delete(selection[0].getId(), function (response, status) {
          if (!NX.util.ExtDirect.showExceptionIfPresent('Repository could not be deleted', response, status)) {
            if (Ext.isDefined(response)) {
              me.loadStores();
              if (!response.success) {
                NX.util.Msg.showError('Repository could not be deleted', response.message);
              }
            }
          }
        });
      }, {scope: me});
    }
  },

  describeRepository: function (repositoryModel) {
    return repositoryModel.get('name');
  },

  getLocalStatus: function (repositoryModel) {
    var localStatus = repositoryModel.get('localStatus');

    if (localStatus === 'IN_SERVICE') {
      return 'In Service';
    }
    else if (localStatus === 'OUT_OF_SERVICE') {
      return 'Out Of Service';
    }
    return localStatus;
  },

  getProxyMode: function (repositoryModel) {
    var proxyMode = repositoryModel.get('proxyMode');

    if (proxyMode === 'ALLOW') {
      return 'Allowed';
    }
    else if (proxyMode === 'BLOCKED_MANUAL') {
      return 'Manually blocked';
    }
    else if (proxyMode === 'BLOCKED_AUTO') {
      return 'Automatically blocked';
    }
    return proxyMode;
  },

  getRemoteStatus: function (repositoryModel) {
    var remoteStatus = repositoryModel.get('remoteStatus'),
        remoteStatusReason = repositoryModel.get('remoteStatusReason');

    if (remoteStatus === 'UNKNOWN') {
      return 'Unknown';
    }
    else if (remoteStatus === 'AVAILABLE') {
      return 'Available';
    }
    else if (remoteStatus === 'UNAVAILABLE') {
      return 'Unavailable' + (remoteStatusReason ? ' due to ' + remoteStatusReason : '');
    }
    return remoteStatus;
  },

  applyPermissions: function () {
    var me = this,
        perms = NX.util.Permissions,
        list = me.getList(),
        selectedModels, deleteButton;

    if (list) {
      selectedModels = me.getList().getSelectionModel().getSelection();
      deleteButton = me.getList().down('button[action=delete]');

      if (selectedModels.length > 0 && perms.check('nexus:repositories', perms.DELETE)) {
        deleteButton.enable();
      }
      else {
        deleteButton.disable();
      }
    }
  }

});