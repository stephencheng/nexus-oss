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
    'dashboard.Feature',
    'dev.Panel',
    'dev.Buttons',
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
      store:{
        '#Feature': {
          beforeremove: me.checkFeature
        }
      },
      component: {
        'nx-feature-menu': {
          select: me.selectFeature,
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

    me.logDebug('Restore bookmark: ' + token);

    node = me.getFeatureStore().getRootNode().findChild('bookmark', token, true);
    if (node) {
      me.getFeatureMenu().getSelectionModel().select(node);
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

    me.logDebug('Init bookmark: ' + token);

    me.restoreBookmark(token);
  },

  /**
   * @private
   */
  checkFeature: function (treeStore, node) {
    var me = this;

    if (node.data.bookmark === Ext.History.getToken()) {
      me.restoreBookmark('dashboard');
    }
  }

});