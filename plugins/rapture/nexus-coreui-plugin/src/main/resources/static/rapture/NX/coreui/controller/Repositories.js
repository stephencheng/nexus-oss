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
  extend: 'NX.controller.MasterDetail',
  requires: [
    'NX.util.Url',
    'NX.util.Msg',
    'NX.util.ExtDirect'
  ],

  list: 'nx-repository-list',

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
    },
    {
      ref: 'info',
      selector: 'nx-repository-feature nx-info-panel'
    }
  ],
  icons: {
    'feature-repository-repositories': {
      file: 'database.png',
      variants: ['x16', 'x32']
    },
    'repository-default': {
      file: 'database.png',
      variants: ['x16', 'x32']
    }
  },
  features: {
    path: '/Repository/Repositories',
    view: { xtype: 'nx-repository-feature' },
    visible: function () {
      return NX.util.Permissions.check('nexus:repositories', 'read');
    }
  },
  permission: 'nexus:repositories',

  init: function () {
    var me = this;

    me.callParent();

    me.listen({
      component: {
        'nx-repository-list button[action=delete]': {
          click: me.deleteRepository
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
        'type': model.get('type'),
        'Format': model.get('format'),
        'Local status': me.getLocalStatus(model),
        'Proxy mode': me.getProxyMode(model),
        'Remote status': me.getRemoteStatus(model),
        'Url': NX.util.Url.asLink(model.get('url'))
      });
    }
  },

  deleteRepository: function () {
    var me = this,
        selection = me.getList().getSelectionModel().getSelection();

    if (Ext.isDefined(selection) && selection.length > 0) {
      NX.util.Msg.askConfirmation('Confirm deletion?', me.getDescription(selection[0]), function () {
        NX.direct.coreui_Repository.delete(selection[0].getId(), function (response, status) {
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

  getLocalStatus: function (model) {
    var localStatus = model.get('localStatus');

    if (localStatus === 'IN_SERVICE') {
      return 'In Service';
    }
    else if (localStatus === 'OUT_OF_SERVICE') {
      return 'Out Of Service';
    }
    return localStatus;
  },

  getProxyMode: function (model) {
    var proxyMode = model.get('proxyMode');

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

  getRemoteStatus: function (model) {
    var remoteStatus = model.get('remoteStatus'),
        remoteStatusReason = model.get('remoteStatusReason');

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
  }

});