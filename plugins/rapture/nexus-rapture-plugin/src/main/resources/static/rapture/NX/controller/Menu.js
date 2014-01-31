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
    'feature.Group',
    'feature.TODO',
    'header.DashboardMode',
    'header.SearchMode',
    'header.BrowseMode',
    'header.AdminMode',
  ],

  stores: [
    'Feature',
    'FeatureMenu',
    'FeatureGroup'
  ],

  refs: [
    {
      ref: 'featureMenu',
      selector: 'nx-feature-menu'
    },
    {
      ref: 'headerPanel',
      selector: 'nx-header-panel'
    }
  ],

  /**
   * @private
   * Current mode.
   */
  mode: undefined,

  /**
   * @private
   * Modes discovered by searching all buttons with a mode property.
   */
  availableModes: [],

  bookmarkingEnabled: true,

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.listen({
      controller: {
        '#User': {
          permissionschanged: me.onPermissionsChange
        },
        '#Bookmarking': {
          navigate: me.navigateTo
        }
      },
      component: {
        'nx-feature-menu': {
          select: me.onSelection,
          afterrender: me.refreshMenu
        },
        'nx-header-panel button[mode]': {
          click: me.onModeChanged
        },
        'button[mode]': {
          afterrender: me.registerModeButton,
          destroy: me.unregisterModeButton
        },
        'nx-feature-group dataview': {
          selectionchange: me.groupItemSelected
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

    return NX.Bookmark.fromToken(selection ? selection[0].get('bookmark') : me.mode);
  },

  /**
   * @private
   */
  onPermissionsChange: function () {
    var me = this;

    me.refreshMenu();
    me.navigateTo(me.getApplication().getBookmarkingController().getBookmark());
  },

  /**
   * @private
   */
  onSelection: function (panel, record) {
    var me = this,
        path = record.get('path');

    me.logDebug('Selected feature: ' + path);

    me.populateFeatureGroupStore(record);

    me.fireEvent('featureselected', me.getFeatureStore().getById(path));
    if (me.bookmarkingEnabled) {
      me.bookmark(record);
    }
  },

  /**
   * Updates the FeatureGroup store with children of selected feature.
   *
   * @private
   * @param {FeatureMenu} record
   */
  populateFeatureGroupStore: function(record) {
    var me = this,
        features = [],
        featureStore = me.getFeatureStore();

    record.eachChild(function(node) {
      features.push(featureStore.getById(node.get('path')));
    });

    me.getFeatureGroupStore().loadData(features);
  },

  /**
   * Invoked when NX.view.feature.Group item is selected.
   *
   * @private
   * @param {NX.view.feature.Group} view
   * @param {Feature[]} records
   */
  groupItemSelected: function (view, records) {
    var me = this,
        feature;

    if (records.length > 0) {
      feature = records[0];
      me.getApplication().getBookmarkingController().navigate(NX.Bookmark.fromToken(feature.get('bookmark')));
    }
  },

  /**
   * @private
   */
  navigateTo: function (bookmark) {
    var me = this,
        node, mode;

    if (bookmark) {
      me.logDebug('Navigate to: ' + bookmark.getSegment(0));
      mode = me.getMode(bookmark);
      if (me.mode != mode) {
        me.mode = mode;
        me.refreshModeButtons();
        me.refreshTree();
        me.toggleMenu();
      }
      node = me.getFeatureMenuStore().getRootNode().findChild('bookmark', bookmark.getSegment(0), true);
    }
    if (!node) {
      me.logDebug('Feature "' + bookmark.getSegment(0) + '" not found. Selecting first available feature');
      node = me.getFeatureMenuStore().getRootNode().firstChild;
    }
    if (node) {
      me.bookmarkingEnabled = false;
      me.getFeatureMenu().selectPath(node.getPath('text'), 'text', undefined, function () {
        me.bookmarkingEnabled = true;
      });
    }
  },

  /**
   * @private
   */
  bookmark: function (node) {
    var me = this,
        bookmark = node.get('bookmark'),
        bookmarking = me.getApplication().getBookmarkingController();

    if (!(bookmarking.getBookmark().getSegment(0) === bookmark)) {
      bookmarking.bookmark(NX.Bookmark.fromToken(bookmark), me);
    }
  },

  /**
   * @public
   * Refresh modes & feature menu.
   */
  refreshMenu: function () {
    var me = this;

    me.logDebug('Refreshing menu (mode ' + me.mode + ')');

    me.refreshVisibleModes();
    me.refreshTree();
    me.toggleMenu();
  },

  /**
   * @private
   * Refreshes modes buttons based on the fact that there are features visible for that mode or not.
   * In case that current mode is no longer visible, auto selects a new one.
   */
  refreshVisibleModes: function () {
    var me = this,
        visibleModes = [],
        feature;

    me.getFeatureStore().each(function (rec) {
      feature = rec.getData();
      if (me.isFeatureVisible(feature) && visibleModes.indexOf(feature.mode) === -1) {
        visibleModes.push(feature.mode);
      }
    });

    me.logDebug('Visible modes: ' + visibleModes);

    Ext.each(me.availableModes, function (button) {
      button.toggle(false, true);
      if (button.autoHide) {
        if (visibleModes.indexOf(button.mode) > -1) {
          button.show();
        }
        else {
          button.hide();
        }
      }
    });

    me.refreshModeButtons();
  },

  refreshModeButtons: function () {
    var me = this,
        headerPanel = me.getHeaderPanel(),
        modeButton;

    Ext.each(me.availableModes, function (button) {
      button.toggle(false, true);
    });

    if (me.mode) {
      modeButton = headerPanel.down('button[mode=' + me.mode + ']');
      if (modeButton.isHidden()) {
        delete me.mode;
      }
    }
    if (!me.mode) {
      Ext.each(me.availableModes, function (button) {
        if (!button.isHidden()) {
          me.mode = button.mode;
          return false;
        }
        return true;
      });
      me.logDebug('Auto selecting mode: ' + me.mode);
    }
    modeButton = headerPanel.down('button[mode=' + me.mode + ']');
    modeButton.toggle(true, true);
  },

  /**
   * @private
   * Automatically expand/collapse menu if there is only one feature to display and button is configured to do so.
   */
  toggleMenu: function () {
    var me = this,
        menu = me.getFeatureMenu(),
        menuCollapsed = false,
        numberOfFeatures = me.getFeatureMenuStore().getRootNode().childNodes.length;

    if (numberOfFeatures <= 1) {
      Ext.each(me.availableModes, function (button) {
        if ((me.mode === button.mode) && (button.collapseMenu === true)) {
          menuCollapsed = true;
        }
      });
    }

    // expand/collapse w/o animation to avoid problems with undefined panel placeholder.el
    if (menuCollapsed) {
      menu.collapse(undefined, false);
    }
    else {
      menu.expand(false);
    }
  },

  refreshTree: function () {
    var me = this,
        feature, segments, parent, child;

    me.logDebug('Refreshing tree (mode ' + me.mode + ')');

    Ext.suspendLayouts();
    me.getFeatureMenuStore().getRootNode().removeAll();

    // create leafs and all parent groups of those leafs
    me.getFeatureStore().each(function (rec) {
      feature = rec.getData();
      // iterate only visible features
      if ((!me.mode || (me.mode == feature.mode)) && me.isFeatureVisible(feature)) {
        segments = feature.path.split('/');
        parent = me.getFeatureMenuStore().getRootNode();
        for (var i = 2; i < segments.length; i++) {
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
      { property: 'weight', direction: 'ASC' },
      { property: 'text', direction: 'ASC' }
    ]);

    Ext.resumeLayouts(true);
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
  },

  getMode: function (bookmark) {
    return bookmark.getSegment(0).split('/')[0];
  },

  /**
   * @private
   */
  onModeChanged: function (button) {
    var me = this,
        mode = button.mode;

    me.changeMode(mode);
  },

  /**
   * @public
   * Change mode.
   * @param {String} mode to change to
   */
  changeMode: function (mode) {
    var me = this;

    me.logDebug('Mode changed: ' + mode);
    me.navigateTo(NX.Bookmark.fromToken(mode));
    me.getApplication().getBookmarkingController().bookmark(me.getBookmark());
  },

  /**
   * @private
   * Register a mode button.
   */
  registerModeButton: function (button) {
    var me = this;

    me.availableModes.push(button);
  },

  /**
   * @private
   * Unregister a mode button.
   */
  unregisterModeButton: function (button) {
    var me = this;

    me.availableModes.remove(button);
  }

});