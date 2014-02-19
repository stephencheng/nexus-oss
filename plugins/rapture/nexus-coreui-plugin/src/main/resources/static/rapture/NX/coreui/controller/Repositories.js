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
    'NX.Dialogs'
  ],

  list: 'nx-coreui-repository-list',

  models: [
    'Repository'
  ],
  stores: [
    'Repository',
    'RepositoryTemplate'
  ],
  views: [
    'repository.RepositoryAddGroup',
    'repository.RepositoryAddHosted',
    'repository.RepositoryAddHostedMaven',
    'repository.RepositoryFeature',
    'repository.RepositoryList',
    'repository.RepositorySettings',
    'repository.RepositorySettingsCommon',
    'repository.RepositorySettingsGroup',
    'repository.RepositorySettingsHosted',
    'repository.RepositorySettingsHostedMaven'
  ],
  refs: [
    {
      ref: 'list',
      selector: 'nx-coreui-repository-list'
    },
    {
      ref: 'info',
      selector: 'nx-coreui-repository-feature nx-info-panel'
    },
    {
      ref: 'settings',
      selector: 'nx-coreui-repository-feature nx-coreui-repository-settings'
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
    view: { xtype: 'nx-coreui-repository-feature' },
    visible: function () {
      return NX.Permissions.check('nexus:repositories', 'read');
    }
  },
  permission: 'nexus:repositories',

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.callParent();

    me.listen({
      store: {
        '#RepositoryTemplate': {
          load: me.onRepositoryTemplateLoad
        }
      },
      controller: {
        '#Refresh': {
          refresh: me.loadRepositoryTemplate
        }
      },
      component: {
        'nx-coreui-repository-list': {
          beforerender: me.loadRepositoryTemplate
        },
        'nx-coreui-repository-list menuitem[action=new]': {
          click: me.showAddWindow
        },
        'nx-coreui-repository-add button[action=add]': {
          click: me.create
        },
        'nx-coreui-repository-settings button[action=save]': {
          click: me.update
        },
        'nx-coreui-repository-settings button[action=discard]': {
          click: me.discard
        }
      }
    });
  },

  getDescription: function (model) {
    return model.get('name');
  },

  onSelection: function (list, model) {
    var me = this,
        settingsTab, settingsForm;

    if (Ext.isDefined(model)) {
      me.getInfo().showInfo({
        'Id': model.get('id'),
        'Name': model.get('name'),
        'Type': model.get('type'),
        'Format': model.get('format'),
        'Local status': me.getLocalStatus(model),
        'Proxy mode': me.getProxyMode(model),
        'Remote status': me.getRemoteStatus(model),
        'Url': NX.util.Url.asLink(model.get('url'))
      });

      settingsForm = me.createComponent(
          'settings',
          {
            type: model.get('type').toLowerCase(),
            provider: model.get('provider'),
            format: model.get('format')
          }
      );
      settingsTab = me.getSettings();
      settingsTab.removeAll();
      if (settingsForm) {
        settingsTab.add(settingsForm);
        settingsForm.loadRecord(model);
      }
    }
  },

  /**
   * @private
   * (Re)load repository template store.
   */
  loadRepositoryTemplate: function () {
    var me = this,
        list = me.getList();

    if (list) {
      me.getRepositoryTemplateStore().load();
    }
  },

  onRepositoryTemplateLoad: function (store) {
    var me = this,
        list = me.getList(),
        newButton, templatesPerType = {};

    if (list) {
      newButton = list.down('button[action=new]');
      newButton.menu.removeAll();
      store.each(function (template) {
        if (!templatesPerType[template.get('type')]) {
          templatesPerType[template.get('type')] = [];
        }
        templatesPerType[template.get('type')].push({
          text: template.get('providerName'),
          action: 'new',
          template: template
        })
      });
      Ext.Object.each(templatesPerType, function (key, value) {
        newButton.menu.add({
          text: Ext.String.capitalize(key) + ' Repository',
          menu: value
        });
      });
      me.reselect();
    }
  },

  /**
   * @private
   */
  showAddWindow: function (menu) {
    var me = this,
        template = menu.template;

    me.createComponent('add', Ext.apply({}, template.data));
  },

  createComponent: function (action, template) {
    var me = this,
        cmpName = 'widget.nx-repository-' + action + '-' + template.type + '-' + template.provider,
        cmpClass;

    cmpClass = Ext.ClassManager.getByAlias(cmpName);
    if (!cmpClass) {
      cmpClass = Ext.ClassManager.getByAlias('widget.nx-repository-' + action + '-' + template.type);
    }
    if (cmpClass) {
      return cmpClass.create({ template: template });
    }
    me.logWarn('Could not create component for: ' + cmpName);
    return undefined;
  },

  /**
   * @private
   * Rests form.
   */
  discard: function (button) {
    var form = button.up('form');
    form.loadRecord(form.getRecord());
  },

  /**
   * @private
   * Creates a new repository.
   */
  create: function (button) {
    var me = this,
        win = button.up('window'),
        form = button.up('form');

    form.submit({
      waitMsg: 'Creating repository...',
      success: function (form, action) {
        win.close();
        NX.Messages.add({
          text: 'Repository created: ' + me.getDescription(me.getRepositoryModel().create(action.result.data)),
          type: 'success'
        });
        me.loadStoreAndSelect(action.result.data.id);
      }
    });
  },

  /**
   * @private
   * Updates a repository.
   */
  update: function (button) {
    var me = this,
        form = button.up('form');

    form.submit({
      waitMsg: 'Updating repository...',
      success: function (form, action) {
        NX.Messages.add({
          text: 'Repository updated: ' + me.getDescription(me.getRepositoryModel().create(action.result.data)),
          type: 'success'
        });
        me.loadStore();
      }
    });
  },

  /**
   * @override
   * Delete repository.
   * @param model repository to be deleted
   */
  deleteModel: function (model) {
    var me = this,
        description = me.getDescription(model);

    NX.direct.coreui_Repository.delete(model.getId(), function (response) {
      me.loadStore();
      if (Ext.isDefined(response) && response.success) {
        NX.Messages.add({
          text: 'Repository deleted: ' + description, type: 'success'
        });
      }
    });
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