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
Ext.define('NX.controller.Menu', {
  extend: 'Ext.app.Controller',
  requires: [
    'NX.Bookmark'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  views: [
    'feature.Menu',
    'feature.Content'
  ],

  stores: [
    'Feature',
    'FeatureMenu'
  ],

  refs: [
    {
      ref: 'headerVersion',
      selector: 'nx-header-version'
    },
    {
      ref: 'featureContent',
      selector: 'nx-feature-content'
    },
    {
      ref: 'featureMenu',
      selector: 'nx-feature-menu'
    }
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.listen({
      controller: {
        '#User': {
          permissionschanged: me.refreshMenu
        },
        '#Bookmarking': {
          navigate: me.onNavigate
        }
      },
      component: {
        'nx-feature-menu': {
          select: me.selectFeature,
          afterrender: me.refreshMenu
        }
      },
      store: {
        '#Feature': {
          update: me.refreshMenu
        }
      }
    });

    me.addEvents(
        /**
         * @event navigate
         * Fires when user navigates to a new bookmark.
         * @param {String} bookmark value
         */
        'navigate',
        /**
         * @event featureselected
         * Fires when a feature is selected.
         * @param {NX.model.Feature} selected feature
         */
        'featureselected'
    );
  },

  /**
   * @public
   * @returns {NX.Bookmark} a bookmark for current selected feature (if any)
   */
  getBookmark: function () {
    var me = this,
        selection = me.getFeatureMenu().getSelectionModel().getSelection();

    if (selection) {
      return NX.Bookmark.fromToken(selection[0].get('bookmark'));
    }
    return NX.Bookmark.fromToken();
  },

  /**
   * @private
   */
  selectFeature: function (panel, record) {
    var me = this,
        content = me.getFeatureContent(),
        view = record.get('view'),
        cmp;

    me.logDebug('Selected feature: ' + record.get('path'));

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
    content.setIconCls(NX.Icons.cls(record.get('iconName'), 'x32'));

    // install new feature view
    content.add(cmp);

    me.fireEvent('featureselected', me.getFeatureStore().getById(record.get('path')));

    me.bookmark(record);
  },

  /**
   * @private
   */
  onNavigate: function (bookmark) {
    var me = this,
        node;

    if (bookmark) {
      me.logDebug('Navigate to: ' + bookmark.getSegment(0));
      node = me.getFeatureMenuStore().getRootNode().findChild('bookmark', bookmark.getSegment(0), true);
    }
    if (!node) {
      me.logDebug('Bookmarked feature "' + bookmark.getSegment(0) + '" not found. Selecting first available feature');
      node = me.getFeatureMenuStore().getRootNode().firstChild;
    }
    if (node) {
      if (node.get('bookmark') != bookmark.getSegment(0)) {
        me.bookmark(node);
      }
      me.getFeatureMenu().selectPath(node.getPath('text'), 'text');
      me.fireEvent('navigate', bookmark);
    }
  },

  /**
   * @private
   */
  bookmark: function (node) {
    var me = this;
    me.getApplication().getBookmarkingController().bookmark(
        NX.Bookmark.fromToken(node.get('bookmark'))
    );
  },

  /**
   * Refresh feature menu.
   */
  refreshMenu: function () {
    var me = this,
        feature, segments, parent, child;

    me.logDebug('Refreshing menu');

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
                leaf: true,
                iconCls: NX.Icons.cls(feature.iconName, 'x16')
              }));
            }
          }
          parent = child;
        }
      }
    });

    me.getFeatureMenuStore().sort([
      {property: 'weight', direction: 'ASC'},
      {property: 'text', direction: 'ASC'}
    ]);

    // reselect bookmarked node
    me.onNavigate(me.getApplication().getBookmarkingController().getBookmark());
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
      else if (Ext.isFunction(feature.visible)) {
        visible = feature.visible.call();
      }
      else {
        visible = false;
      }
    }
    return visible;
  }

});