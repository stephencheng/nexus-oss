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
Ext.define('NX.controller.Main', {
  extend: 'Ext.app.Controller',
  mixins: {
    logAware: 'NX.LogAware'
  },

  views: [
    'Main',
    'header.Panel',
    'header.Branding',
    'header.Logo',
    'header.Version',
    'header.QuickSearch',
    'header.Refresh',
    'header.Help',
    'header.Login',
    'header.User',
    'dev.Panel',
    'feature.Menu',
    'feature.Content',
    'message.Panel',
    'info.Entry',
    'info.Panel',
    'TODO'
  ],
  models: [
    'Feature'
  ],
  stores: [
    'Feature',
    'FeatureMenu'
  ],

  refs: [
    {
      ref: 'featureContent',
      selector: 'nx-feature-content'
    },
    {
      ref: 'featureMenu',
      selector: 'nx-feature-menu'
    },
    {
      ref: 'featureHelp',
      selector: 'nx-header-help menuitem[action=feature]'
    }
  ],

  init: function () {
    var me = this;

    // The only requirement for this to work is that you must have a hidden field and
    // an iframe available in the page with ids corresponding to Ext.History.fieldId
    // and Ext.History.iframeId.  See history.html for an example.
    Ext.History.init();

    Ext.History.on('change', function (token) {
      me.restoreBookmark(token);
    });

    me.getApplication().getIconController().addIcons({
      'nexus': {
        file: 'nexus.png',
        variants: ['x16', 'x32']
      },
      'sonatype': {
        file: 'sonatype.png',
        variants: ['x16', 'x32']
      },
      'refresh': {
        file: 'arrow_refresh.png',
        variants: ['x16', 'x32']
      },
      'help-support': {
        file: 'support.png',
        variants: ['x16', 'x32']
      },
      'help-manual': {
        file: 'book_picture.png',
        variants: ['x16', 'x32']
      },
      'feature-system': {
        file: 'cog.png',
        variants: ['x16', 'x32']
      },
      'feature-staging': {
        file: 'database_green.png',
        variants: ['x16', 'x32']
      },
      'feature-targets': {
        file: 'target.png',
        variants: ['x16'] // FIXME: missing x32 here
      },
      'feature-routing': {
        file: 'arrow_branch.png',
        variants: ['x16', 'x32']
      },
      'feature-rules': {
        file: 'measure.png',
        variants: ['x16', 'x32']
      },
      'feature-users': {
        file: 'group.png',
        variants: ['x16', 'x32']
      },
      'feature-notifications': {
        file: 'emails.png',
        variants: ['x16', 'x32']
      },
      'feature-tasks': {
        file: 'time.png',
        variants: ['x16', 'x32']
      },
      'feature-logging': {
        file: 'book.png',
        variants: ['x16', 'x32']
      },
      'feature-feeds': {
        file: 'feed.png',
        variants: ['x16', 'x32']
      },
      'feature-search': {
        file: 'magnifier.png',
        variants: ['x16', 'x32']
      },
      'feature-roles': {
        file: 'user_policeman.png',
        variants: ['x16', 'x32']
      },
      'feature-privileges': {
        file: 'medal_gold_1.png',
        variants: ['x16', 'x32']
      },
      'feature-usertoken': {
        file: 'key.png',
        variants: ['x16', 'x32']
      },
      'feature-pgp': {
        file: 'gnupg_keys.png',
        variants: ['x16', 'x32']
      },
      'feature-supporttools': {
        file: 'globe_place.png',
        variants: ['x16', 'x32']
      },
      'feature-smartproxy': {
        file: 'download_cloud.png',
        variants: ['x16', 'x32']
      },
      'feature-profiles': {
        file: 'palette.png',
        variants: ['x16', 'x32']
      },
      'feature-ldap': {
        file: 'server_key.png',
        variants: ['x16', 'x32']
      },
      'feature-crowd': {
        file: 'server_key.png',
        variants: ['x16', 'x32']
      },
      'feature-http': {
        file: 'transmit.png',
        variants: ['x16', 'x32']
      },
      'feature-security': {
        file: 'shield.png',
        variants: ['x16', 'x32']
      },
      'feature-ssl': {
        file: 'ssl_certificates.png',
        variants: ['x16', 'x32']
      },
      'feature-repository': {
        file: 'database.png',
        variants: ['x16', 'x32']
      },
      'feature-procurement': {
        file: 'database_blue.png',
        variants: ['x16', 'x32']
      },
      'feature-analytics': {
        file: 'system_monitor.png',
        variants: ['x16', 'x32']
      },
      'feature-support': {
        file: 'support.png',
        variants: ['x16', 'x32']
      },
      'feature-sysinfo': {
        file: 'server_information.png',
        variants: ['x16', 'x32']
      },
      'feature-supportzip': {
        file: 'file_extension_zip.png',
        variants: ['x16', 'x32']
      }
    });

    me.getApplication().getMainController().registerFeature([
      {
        path: '/System',
        weight: 1000,
        iconName: 'feature-system'
      },

      // TESTING: Adding features to fleshout target menu design
      {
        path: '/Search',
        view: 'NX.view.TODO',
        iconName: 'feature-search'
      },
      {
        path: '/Feeds',
        view: 'NX.view.TODO',
        iconName: 'feature-feeds'
      },
      // FIXME: This should provide view and drop /Repository/Repositories
      {
        path: '/Repository',
        iconName: 'feature-repository'
      },
      {
        path: '/Repository/Targets',
        view: 'NX.view.TODO',
        iconName: 'feature-targets'
      },
      {
        path: '/Repository/Routing',
        view: 'NX.view.TODO',
        iconName: 'feature-routing'
      },
      {
        path: '/Staging',
        iconName: 'feature-staging'
      },
      // TODO: ^^^ should provide view instead of vvv
      //{
      //  path: '/Staging/Repositories',
      //  view: 'NX.view.TODO',
      //  iconName: 'feature-staging'
      //},
      {
        path: '/Staging/Profiles',
        view: 'NX.view.TODO',
        iconName: 'feature-profiles'
      },
      {
        path: '/Staging/Rules',
        view: 'NX.view.TODO',
        iconName: 'feature-rules'
      },
      {
        path: '/Procurement',
        view: 'NX.view.TODO',
        iconName: 'feature-procurement'
      },
      {
        path: '/Security',
        iconName: 'feature-security'
      },
      // TODO: ^^^ should provide view instead of vvv
      //{
      //  path: '/Security/Settings',
      //  view: 'TODO'
      //},
      {
        path: '/Security/Users',
        view: 'NX.view.TODO',
        iconName: 'feature-users'
      },
      {
        path: '/Security/Roles',
        view: 'NX.view.TODO',
        iconName: 'feature-roles'
      },
      {
        path: '/Security/Privileges',
        view: 'NX.view.TODO',
        iconName: 'feature-privileges'
      },
      {
        path: '/Security/User Token',
        view: 'NX.view.TODO',
        iconName: 'feature-usertoken'
      },
      {
        path: '/Security/LDAP',
        view: 'NX.view.TODO',
        iconName: 'feature-ldap'
      },
      {
        path: '/Security/Atlassian Crowd',
        view: 'NX.view.TODO',
        iconName: 'feature-crowd'
      },
      // TODO: /System should provide view instead of vvv
      //{
      //  path: '/System/General',
      //  view: 'TODO'
      //},
      {
        path: '/System/Notifications',
        view: 'NX.view.TODO',
        iconName: 'feature-notifications'
      },
      {
        path: '/System/HTTP',
        view: 'NX.view.TODO',
        iconName: 'feature-http'
      },
      {
        path: '/System/PGP',
        view: 'NX.view.TODO',
        iconName: 'feature-pgp'
      },
      {
        path: '/System/Tasks',
        view: 'NX.view.TODO',
        iconName: 'feature-tasks'
      },
      {
        path: '/System/Smart Proxy',
        view: 'NX.view.TODO',
        iconName: 'feature-smartproxy'
      },
      {
        path: '/System/SSL',
        view: 'NX.view.TODO',
        iconName: 'feature-ssl'
      },
      {
        path: '/Support',
        iconName: 'feature-support'
      },
      {
        path: '/Support/System Information',
        view: 'NX.view.TODO',
        iconName: 'feature-sysinfo'
      },
      {
        path: '/Support/Logging',
        view: 'NX.view.TODO',
        iconName: 'feature-logging'
      },
      {
        path: '/Support/Support ZIP',
        view: 'NX.view.TODO',
        iconName: 'feature-supportzip'
      },
      {
        path: '/Support/Analytics',
        view: 'NX.view.TODO',
        iconName: 'feature-analytics'
      }
    ]);

    me.listen({
      controller: {
        '#User': {
          permissionsChanged: me.refreshMenu
        }
      },
      component: {
        'nx-feature-menu': {
          select: me.selectFeature,
          beforerender: me.refreshMenu,
          afterrender: me.initBookmark
        },
        'nx-header-refresh': {
          click: me.refresh
        }
      },
      store: {
        '#Feature': {
          update: me.refreshMenu
        }
      }
    });
  },

  /**
   * @private
   */
  selectFeature: function (panel, record, index, opts) {
    var me = this,
        content = me.getFeatureContent(),
        featureHelp = me.getFeatureHelp(),
        view,
        cmp;

    if (record.isLeaf()) {
      view = record.get('view');
      me.logDebug('Selecting feature view: ' + view);

      // create new view and replace any current view
      cmp = me.getView(view).create();

      // remove the current contents
      content.removeAll();

      // update title and icon
      content.setTitle(record.get('text'));
      content.setIconCls(NX.controller.Icon.iconCls(record.get('iconName'), 'x32'));

      // Update help menu content
      featureHelp.setText(record.get('text'));
      featureHelp.setIconCls(NX.controller.Icon.iconCls(record.get('iconName'), 'x16'));

      // install new feature view
      content.add(cmp);

      me.bookmark(record.get('bookmark'));
    }

    // FIXME: This has been disabled, as it causes unwanted side-effects on dbl click
    //else {
    //  // if a group, automatically select first leaf
    //  if (record.hasChildNodes()) {
    //    me.getFeatureMenu().selectPath(record.firstChild.getPath('text'), 'text');
    //  }
    //}
  },

  /**
   * @private
   */
  bookmark: function (newToken) {
    var oldToken = Ext.History.getToken();

    if (newToken && oldToken === null || oldToken.search(newToken) === -1) {
      Ext.History.add(newToken);
    }
  },

  /**
   * @private
   */
  restoreBookmark: function (token) {
    var me = this,
        node;

    node = me.getFeatureMenuStore().getRootNode().findChild('bookmark', token, true);
    if (node) {
      me.getFeatureMenu().selectPath(node.getPath('text'), 'text');
    }
  },

  /**
   * @private
   */
  initBookmark: function () {
    var me = this,
        token = Ext.History.getToken();

    // default to the dashboard feature
    if (!token) {
      token = 'dashboard';
    }
    me.restoreBookmark(token);
  },

  refresh: function () {
    var refreshables = Ext.ComponentQuery.query('panel[refreshable=true]');

    if (refreshables) {
      Ext.each(refreshables, function (refreshable) {
        refreshable.fireEvent('refresh', refreshable);
      });
    }
  },

  /**
   * Registers features.
   * @param {Array/Object} features to be registered
   */
  registerFeature: function (features) {
    var me = this;

    if (features) {
      if (!Ext.isArray(features)) {
        features = [features];
      }
      Ext.each(features, function (feature) {
        // HACK: Auto-set iconCls from icon name for use in tree panels
        if (feature.iconName) {
          feature.iconCls = NX.controller.Icon.iconCls(feature.iconName, 'x16');
        }
        me.getFeatureStore().add(feature);
      });
    }
  },

  /**
   * Refresh feature menu.
   */
  refreshMenu: function () {
    var me = this,
        feature, segments, parent, child, node;

    me.getFeatureMenuStore().getRootNode().removeAll();

    // create leafs and all parent groups of those leafs
    me.getFeatureStore().each(function (rec) {
      feature = rec.getData();
      // iterate only visible leafs
      if (Ext.isDefined(feature.view) && me.isFeatureVisible(feature)) {
        segments = feature.path.split('/');
        parent = me.getFeatureMenuStore().getRootNode();
        for (var i = 1; i < segments.length; i++) {
          child = parent.findChild('text', segments[i], false);
          if (child) {
            // if leaf was already created (leaf configured more times), merge the definitions
            if (i == segments.length - 1) {
              child.data = Ext.apply(child.data, Ext.apply(feature, {
                text: segments[i],
                leaf: true
              }));
            }
          }
          else {
            if (i < segments.length - 1) {
              // create the group
              child = parent.appendChild({
                text: segments[i],
                leaf: false,
                // expand the menu by default
                expanded: true
              });
            }
            else {
              // create the leaf
              child = parent.appendChild(Ext.apply(feature, {
                text: segments[i],
                leaf: true
              }));
            }
          }
          parent = child;
        }
      }
    });

    // apply configuration for group entries
    me.getFeatureStore().each(function (rec) {
      feature = rec.getData();
      // iterate only visible groups
      if (!Ext.isDefined(feature.view) && me.isFeatureVisible(feature)) {
        segments = feature.path.split('/');
        parent = me.getFeatureMenuStore().getRootNode();
        for (var i = 1; i < segments.length; i++) {
          child = parent.findChild('text', segments[i], false);
          if (child && !child.data.leaf) {
            if (i == segments.length - 1) {
              child.data = Ext.apply(child.data, feature);
            }
          }
          parent = child;
        }
      }
    });

    // FIXME: This needs to sort by weight, and then alpha for same weight.
    me.getFeatureMenuStore().sort('weight', 'ASC');

    // check out if current view is still valid. if not go to dashboard
    node = me.getFeatureMenuStore().getRootNode().findChild('bookmark', Ext.History.getToken(), true);
    if (node) {
      me.restoreBookmark(Ext.History.getToken());
    }
    else {
      me.restoreBookmark('dashboard');
    }
  },

  /**
   * Check if a feature is visible.
   * @private
   */
  isFeatureVisible: function (feature) {
    var visible = true;
    if (feature.visible) {
      if (Ext.isBoolean(feature.visible)) {
        visible = feature.visible;
      }
      else if (typeof feature.visible === 'function') {
        visible = feature.visible.call();
      }
      else {
        visible = false;
      }
    }
    return visible;
  }

});