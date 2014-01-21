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
    'Header',
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
    'Feature'
  ],

  refs: [
    {
      ref: 'featureContent',
      selector: 'nx-feature-content'
    },
    {
      ref: 'featureMenu',
      selector: 'nx-feature-menu'
    }
  ],

  features: [],

  init: function () {
    var me = this;

    // The only requirement for this to work is that you must have a hidden field and
    // an iframe available in the page with ids corresponding to Ext.History.fieldId
    // and Ext.History.iframeId.  See history.html for an example.
    Ext.History.init();

    Ext.History.on('change', function (token) {
      me.restoreBookmark(token);
    });

    me.listen({
      controller: {
        '#User': {
          permissionsChanged: me.refresh
        }
      },
      component: {
        'nx-feature-menu': {
          select: me.selectFeature,
          beforerender: me.refresh,
          afterrender: me.initBookmark
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
        view,
        cmp;

    // records which are not leaves are groups, ignore selection
    if (!record.isLeaf()) {
      return;
    }

    view = record.get('view');
    me.logDebug('Selecting feature view: ' + view);

    // create new view and replace any current view
    cmp = me.getView(view).create();
    content.removeAll();
    content.add(cmp);

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

    node = me.getFeatureStore().getRootNode().findChild('bookmark', token, true);
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

  registerFeature: function (features) {
    var me = this;

    if (features) {
      if (!Ext.isArray(features)) {
        features = [features];
      }
      Ext.each(features, function(feature){
        // TODO assert feature path
        me.features.push(feature);
      });
    }
  },

  refresh: function () {
    var me = this,
        segments, parent, child, node;

    me.getFeatureStore().getRootNode().removeAll();

    Ext.each(me.features, function (feature) {
      if (Ext.isDefined(feature.view) && me.isFeatureVisible(feature)) {
        segments = feature.path.split('/');
        parent = me.getFeatureStore().getRootNode();
        for (var i = 1; i < segments.length; i++) {
          child = parent.findChild('text', segments[i], false);
          if (child) {
            if (i == segments.length - 1) {
              child.data = Ext.apply(child.data, Ext.apply(feature, {
                text: segments[i],
                leaf: true
              }));
            }
          }
          else {
            if (i < segments.length - 1) {
              child = parent.appendChild({
                text: segments[i],
                leaf: false
              });
            }
            else {
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

    Ext.each(me.features, function (feature) {
      if (!Ext.isDefined(feature.view) && me.isFeatureVisible(feature)) {
        segments = feature.path.split('/');
        parent = me.getFeatureStore().getRootNode();
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

    me.getFeatureStore().sort('weight', 'ASC');

    node = me.getFeatureStore().getRootNode().findChild('bookmark', Ext.History.getToken(), true);
    if (node) {
      me.restoreBookmark(Ext.History.getToken());
    }
    else {
      me.restoreBookmark('dashboard');
    }
  },

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