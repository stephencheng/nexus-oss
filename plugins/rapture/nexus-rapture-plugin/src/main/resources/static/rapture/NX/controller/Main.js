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
    'header.Refresh',
    'header.Help',
    'header.Login',
    'header.User',
    'dev.Panel',
    'feature.Menu',
    'feature.Content',
    'message.Panel',
    'info.Entry',
    'info.Panel'
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

  /**
   * @override
   */
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
      'user-settings': {
        file: 'setting_tools.png',
        variants: ['x16', 'x32']
      },
      'user-logout': {
        file: 'door_out.png',
        variants: ['x16', 'x32']
      }
    });

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

    view = record.get('view');
    me.logDebug('Selecting feature view: ' + view);

    // create new view and replace any current view
    if (Ext.isString(view)) {
      cmp = me.getView(view).create();
    }
    else {
      cmp = Ext.widget(view);
    }

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
    me.fireEvent('featureselected', cmp);

    me.bookmark(record.get('bookmark'));
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
    var me = this,
        refreshables = Ext.ComponentQuery.query('panel[refreshable=true]');

    if (refreshables) {
      Ext.each(refreshables, function (refreshable) {
        refreshable.fireEvent('refresh', refreshable);
      });
    }

    me.getApplication().getMessageController().addMessage({ text: 'Refreshed', type: 'default'});
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
        if (!feature.path) {
          throw Ext.Error.raise('Feature missing path');
        }

        if (!feature.view) {
          me.logWarn('Using default view for feature at path: ' + feature.path);
          feature.view = 'NX.view.TODO';
        }

        // normalize path, strip off leading '/'
        var path = feature.path;
        if (path.charAt(0) === '/') {
          path = path.substr(1, path.length);
        }

        // auto-set bookmark
        if (!feature.bookmark) {
          feature.bookmark = path.toLowerCase().replace(' ', '');
        }

        // auto-set iconName
        if (!feature.iconName) {
          feature.iconName = 'feature-' + path.toLowerCase().replace('/', '-').replace(' ', '');
        }

        // auto-set iconCls for rendering in tree
        feature.iconCls = NX.controller.Icon.iconCls(feature.iconName, 'x16');

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
      if (me.isFeatureVisible(feature)) {
        segments = feature.path.split('/');
        parent = me.getFeatureMenuStore().getRootNode();
        for (var i = 1; i < segments.length; i++) {
          child = parent.findChild('text', segments[i], false);
          if (child) {
            if (i < segments.length - 1) {
              child.data = Ext.apply(child.data, {
                leaf: false
              });
            }
            else {
              child.data = Ext.apply(child.data, Ext.apply(feature, {
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

    // FIXME: This needs to sort by weight, and then alpha for same weight.
    me.getFeatureMenuStore().sort([
      {property: 'weight', direction: 'ASC'},
      {property: 'text', direction: 'ASC'}
    ]);

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