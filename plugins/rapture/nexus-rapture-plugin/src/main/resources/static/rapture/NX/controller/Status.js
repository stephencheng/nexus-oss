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
Ext.define('NX.controller.Status', {
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

  refs: [
    {
      ref: 'header',
      selector: 'nx-header'
    }
  ],

  init: function () {
    var me = this;

    me.control({
      'nx-header button[action=login]': {
        click: me.showLoginWindow
      },
      'nx-login button[action=login]': {
        click: me.login
      },
      'nx-header button[action=user] menuitem[action=logout]': {
        click: me.logout
      }
    });

    me.statusProvider = Ext.Direct.addProvider({
      type: 'polling',
      url: NX.direct.api.POLLING_URLS.status,
      interval: 5000,
      listeners: {
        data: me.updateStatus,
        scope: this
      },
      connectNow: function () {
        me.statusProvider.disconnect();
        me.statusProvider.connect();
      }
    });
  },

  /**
   * @private
   */
  updateStatus: function (provider, event) {
    var me = this,
        status = event.data.data,
        loginButton = me.getHeader().down('button[action=login]'),
        userButton = me.getHeader().down('button[action=user]'),
        nameLabel = me.getHeader().down('label#name'),
        editionLabel = me.getHeader().down('label#edition');

    nameLabel.setText(status.name);
    editionLabel.setText(status.edition + ' ' + status.version);

    if (status.loggedIn) {
      loginButton.hide();
      userButton.setText(status.loggedInUsername);
      userButton.show();

      // FIXME: This actually shows way too many times, but good to show data for now
      me.getApplication().getMessageController().addMessage({text: 'User logged in: ' + status.loggedInUsername});
    }
    else {
      loginButton.show();
      userButton.hide();

      // FIXME: Again not ideal, but good for showing data for now
      me.getApplication().getMessageController().addMessage({text: 'User logged out'});
    }
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
        values = form.getValues(),
        userName = NX.util.Base64.encode(values.username),
        userPass = NX.util.Base64.encode(values.password);

    win.getEl().mask("Logging you in...");

    me.logDebug('Login...');

    NX.direct.Application.login(userName, userPass, function (response, status) {
      if (!NX.util.ExtDirect.showExceptionIfPresent('User could not be logged in', response, status)) {
        if (Ext.isDefined(response)) {
          if (response.success) {
            me.statusProvider.connectNow();
            win.getEl().unmask();
            win.close();
          }
          else {
            win.getEl().unmask();
          }
        }
      }
      else {
        win.getEl().unmask();
      }
    });
  },

  /**
   * @private
   */
  logout: function () {
    var me = this;

    me.logDebug('Logout...');

    NX.direct.Application.logout(function (response, status) {
      if (!NX.util.ExtDirect.showExceptionIfPresent('User could not be logged out', response, status)) {
        if (Ext.isDefined(response)) {
          if (response.success) {
            me.statusProvider.connectNow();
          }
        }
      }
    });
  }

});