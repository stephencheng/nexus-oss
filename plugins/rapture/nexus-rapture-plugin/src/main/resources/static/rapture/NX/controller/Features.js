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
Ext.define('NX.controller.Features', {
  extend: 'Ext.app.Controller',
  mixins: {
    logAware: 'NX.LogAware'
  },

  statics: {
    /**
     * @public
     * Supported modes.
     */
    MODES: ['dashboard', 'search', 'browse', 'admin', 'user'],
    /**
     * @public
     * Check if a mode is supported.
     * @param mode to check
     * @returns {boolean} true, if mode is supported
     */
    isSupported: function (mode) {
      return NX.controller.Features.MODES.indexOf(mode) > -1;
    }
  },

  models: [
    'Feature'
  ],
  stores: [
    'Feature',
    'FeatureMenu'
  ],

  /**
   * Registers features.
   * @param {Array/Object} features to be registered
   */
  registerFeature: function (features) {
    var me = this,
        segments, mode, path;

    if (features) {
      if (!Ext.isArray(features)) {
        features = [features];
      }
      Ext.each(features, function (feature) {
        if (!feature.path) {
          throw Ext.Error.raise('Feature missing path');
        }

        path = feature.path;
        if (path.charAt(0) === '/') {
          path = path.substr(1, path.length);
        }
        segments = path.split('/');
        mode = segments[0];
        if (!NX.controller.Features.isSupported(mode)) {
          me.logWarn('Using mode "admin" for feature at path: ' + feature.path);
          mode = 'admin';
          path = mode + '/' + path;
        }
        feature.mode = mode;
        feature.path = '/' + path;

        if (!feature.view) {
          me.logWarn('Using default view for feature at path: ' + feature.path);
          feature.view = 'NX.view.TODO';
        }

        // auto-set bookmark
        if (!feature.bookmark) {
          feature.bookmark = NX.Bookmark.encode(path);
        }

        // auto-set iconName
        if (!feature.iconName) {
          feature.iconName = 'feature-'
              + path.substring(mode.length + 1, path.length).toLowerCase().replace('/', '-').replace(' ', '');
        }

        me.getFeatureStore().addSorted(me.getFeatureModel().create(feature));
      });
    }
  }

});