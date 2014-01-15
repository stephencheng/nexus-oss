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
Ext.define('NX.controller.Login', {
  extend: 'Ext.app.Controller',
  requires: [
    'NX.util.Url',
    'NX.util.Base64'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  views: [
    'Login'
  ],

  init: function () {
    var me = this;

    me.control({
      'nx-header button[action=login]': {
        click: me.showLoginWindow
      },
      'nx-login button[action=login]': {
        click: me.login
      }
    });
  },

  /**
   * @private
   */
  showLoginWindow: function () {
    Ext.widget('nx-login');
  },

  /**
   * @private
   */
  login: function (button) {
    var me = this,
        win = button.up('window'),
        form = button.up('form'),
        values = form.getValues();

    win.getEl().mask("Logging you in...");

    Ext.Ajax.request({
      method: 'GET',
      cbPassThru: {
        username: values.username
      },
      headers: {
        'Authorization': 'Basic ' + NX.util.Base64.encode(values.username + ':' + values.password)
      },
      url: NX.util.Url.urlOf('service/local/authentication/login'),
      success: function (response, options) {
        win.getEl().unmask();
        win.close();
      },
      failure: function (response, options) {
        win.getEl().unmask();
      }
    });
  }

});