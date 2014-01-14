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
    'Header',
    'Developer',
    'FeatureMenu',
    'FeatureContent',
    'FeatureOptions',
    'Welcome'
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
      selector: 'nx-featurecontent'
    }
  ],

  init: function () {
    var me = this;

    me.control({
      'nx-featuremenu': {
        select: me.selectFeature
      }
    });
  },

  /**
   * @private
   */
  selectFeature: function(panel, record, index, opts) {
    var me = this,
        content = me.getFeatureContent(),
        view,
        cmp;

    view = record.get('view');
    me.logDebug('Selecting feature view: ' + view);

    // create new view and replace any current view
    cmp = me.getView(view).create();
    content.removeAll();
    content.add(cmp);
  }
});