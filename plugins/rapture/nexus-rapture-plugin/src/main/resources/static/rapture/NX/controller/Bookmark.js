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
Ext.define('NX.controller.Bookmark', {
  extend: 'Ext.app.Controller',
  require: [
    'Ext.util.History'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  init: function () {
    var me = this;

    // The only requirement for this to work is that you must have a hidden field and
    // an iframe available in the page with ids corresponding to Ext.History.fieldId
    // and Ext.History.iframeId.  See history.html for an example.
    Ext.History.init();

    Ext.History.on('change', function (token) {
      me.restoreBookmark(token);
    });

    this.control({
      'nx-featurebrowser': {
        tabchange: me.bookmark,
        afterrender: me.initBookmark
      }
    });
  },

  initBookmark: function (featurebrowser) {
    var me = this,
        token = Ext.History.getToken();

    if (token) {
      me.restoreBookmark(token);
    }
    else {
      featurebrowser.setActiveTab(0);
    }
  },

  bookmark: function (featurebrowser) {
    var newToken = featurebrowser.getActiveTab().bookmark,
        oldToken = Ext.History.getToken();

    if (newToken && oldToken === null || oldToken.search(newToken) === -1) {
      Ext.History.add(newToken);
    }
  },

  restoreBookmark: function (token) {
    var comp = Ext.ComponentQuery.query('nx-featurebrowser'),
        featurebrowser;

    if (comp && comp.length > 0) {
      featurebrowser = comp[0];
      var panel = featurebrowser.down('panel[bookmark=' + token + ']');
      if (panel) {
        featurebrowser.setActiveTab(panel);
      }
    }
  }

});