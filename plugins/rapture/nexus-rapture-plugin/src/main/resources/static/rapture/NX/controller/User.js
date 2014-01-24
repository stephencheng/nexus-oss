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
Ext.define('NX.controller.User', {
  extend: 'Ext.app.Controller',
  requires: [
    'NX.util.Base64',
    'NX.util.Permissions'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  views: [
    'Login'
  ],

  stores: [
    'Permission'
  ],

  refs: [
    {
      ref: 'header',
      selector: 'nx-header-panel'
    }
  ],

  user: {
  },

  init: function () {
    var me = this;

    me.listen({
      controller: {
        '#Status': {
          user: me.updateUser,
          commandfetchpermissions: me.fetchPermissions
        }
      },
      store: {
        '#Permission': {
          load: me.firePermissionsChanged,
          update: me.firePermissionsChanged
        }
      },
      component: {
        'nx-header-panel button[action=login]': {
          click: me.showLoginWindow
        },
        'nx-header-panel button[action=user] menuitem[action=logout]': {
          click: me.logout
        },
        'nx-login button[action=login]': {
          click: me.login
        },
        'nx-login form': {
          afterrender: me.installEnterKey
        }
      },
      direct: {
        '*': {
          beforecallback: me.checkIfAuthenticationIsRequired
        }
      }
    });
  },

  /**
   * @private
   */
  updateUser: function (user) {
    var me = this,
        loginButton = me.getHeader().down('button[action=login]'),
        userButton = me.getHeader().down('button[action=user]');

    if (user) {
      if (me.user.id != user.id) {
        me.getApplication().getMessageController().addMessage({text: 'User logged in: ' + user.id, type: 'success' });
        loginButton.hide();
        userButton.setText(user.id);
        userButton.show();

        me.user = user;
        me.fetchPermissions();
      }
    }
    else {
      if (me.user.id) {
        me.getApplication().getMessageController().addMessage({text: 'User logged out', type: 'success' });
        loginButton.show();
        userButton.hide();

        me.user = {};
        me.getPermissionStore().removeAll();
        me.firePermissionsChanged();
      }
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
  installEnterKey: function (form) {
    var me = this;

    me.keyNav = Ext.create('Ext.util.KeyNav', form.el, {
      enter: function () {
        if (form.isValid()) {
          me.login(form.down('button[action=login]'));
        }
      },
      scope: this
    });
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

    NX.direct.Application.login(userName, userPass, values.remember === 'on', function (response, status) {
      if (!NX.util.ExtDirect.showExceptionIfPresent('User could not be logged in', response, status)) {
        if (Ext.isDefined(response)) {
          if (response.success) {
            me.updateUser(response.data);
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
            me.updateUser();
          }
        }
      }
    });
  },

  /**
   * @private
   */
  fetchPermissions: function () {
    var me = this;

    me.getPermissionStore().load();
  },

  /**
   * @private
   */
  firePermissionsChanged: function () {
    var me = this;

    NX.util.Permissions.setPermissions(me.getPermissions());
    me.fireEvent('permissionsChanged', NX.util.Permissions);
  },

  /**
   * @private
   */
  getPermissions: function () {
    var me = this,
        perms = {};

    me.getPermissionStore().each(function (rec) {
      perms[rec.get('id')] = rec.get('value');
    });

    return perms;
  },

  /**
   * @private
   */
  checkIfAuthenticationIsRequired: function (provider, transaction) {
    var me = this,
        result = transaction.result;

    if (Ext.isDefined(result)
        && Ext.isDefined(result.success) && result.success === false
        && Ext.isDefined(result.authenticationRequired) && result.authenticationRequired === true) {
      me.getApplication().getMessageController().addMessage({
        type: 'danger',
        text: result.message
      });
      me.showLoginWindow();
      // cancel Ext.Direct callback
      return false;
    }
  }

});