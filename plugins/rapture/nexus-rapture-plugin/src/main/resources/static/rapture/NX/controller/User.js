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
    'NX.Permissions',
    'Ext.ux.ActivityMonitor'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  views: [
    'Login',
    'ExpireSession'
  ],

  stores: [
    'Permission'
  ],

  refs: [
    {
      ref: 'loginButton',
      selector: 'nx-header-login'
    },
    {
      ref: 'userButton',
      selector: 'nx-header-user'
    },
    {
      ref: 'login',
      selector: 'nx-login'
    }
  ],

  SECONDS_TO_EXPIRE: 30,

  user: undefined,

  activityMonitor: undefined,

  expirationTicker: undefined,

  init: function () {
    var me = this;

    me.getApplication().getIconController().addIcons({
      'user-settings': {
        file: 'setting_tools.png',
        variants: ['x16', 'x32']
      },
      'user-logout': {
        file: 'door_out.png',
        variants: ['x16', 'x32']
      }
    });

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
          update: me.firePermissionsChanged,
          remove: me.firePermissionsChanged
        }
      },
      component: {
        'nx-header-login': {
          click: me.showLoginWindow
        },
        'nx-header-user menuitem[action=logout]': {
          click: me.logout
        },
        'nx-login button[action=login]': {
          click: me.login
        },
        'nx-login form': {
          afterrender: me.installEnterKey
        },
        'nx-expire-session': {
          afterrender: me.startTicking
        },
        'nx-expire-session button[action=cancel]': {
          click: me.stopTicking
        }
      }
    });
  },

  /**
   * @private
   */
  updateUser: function (user) {
    var me = this,
        loginButton = me.getLoginButton(),
        userButton = me.getUserButton();

    if (user) {
      if (!Ext.isDefined(me.user) || (me.user.id != user.id)) {
        NX.Messages.add({text: 'User logged in: ' + user.id, type: 'default' });
        loginButton.hide();
        userButton.setText(user.id);
        userButton.show();

        me.user = user;
        me.fetchPermissions();

        if (NX.app.settings.sessionTimeout > 0) {
          me.activityMonitor = Ext.create('Ext.ux.ActivityMonitor', {
            interval: 1000, // check every second,
            maxInactive: ((NX.app.settings.sessionTimeout * 60) - me.SECONDS_TO_EXPIRE) * 1000,
            isInactive: me.showExpirationWindow.bind(me)
          });
          me.activityMonitor.start();
          me.logDebug('Session expiration enabled for ' + NX.app.settings.sessionTimeout + ' minutes');
        }
      }
    }
    else {
      if (me.user) {
        NX.Messages.add({text: 'User logged out', type: 'default' });
        loginButton.show();
        userButton.hide();

        if (me.activityMonitor) {
          me.activityMonitor.stop();
          delete me.activityMonitor;
        }
        if (me.expirationTicker) {
          me.expirationTicker.destroy();
          delete me.expirationTicker;
        }

        delete me.user;
        me.getPermissionStore().removeAll();
        me.firePermissionsChanged();
      }
    }
  },

  /**
   * Returns true if there is a logged in user.
   *
   * @public
   * @return {boolean}
   */
  hasUser: function () {
    return Ext.isDefined(this.user);
  },

  /**
   * @private
   */
  showExpirationWindow: function () {
    var me = this;

    NX.Messages.add({text: 'Session is about to expire', type: 'warning' });
    me.getExpireSessionView().create();
  },

  /**
   * @private
   */
  startTicking: function (win) {
    var me = this;

    me.expirationTicker = Ext.util.TaskManager.newTask({
      run: function (count) {
        win.down('label').setText('Session will expire in ' + (me.SECONDS_TO_EXPIRE - count) + ' seconds');
        if (count == me.SECONDS_TO_EXPIRE) {
          win.close();
          NX.Messages.add({
            text: 'Session expired after being inactive for ' + NX.app.settings.sessionTimeout + ' minutes',
            type: 'warning'
          });
          me.logout();
        }
      },
      interval: 1000,
      repeat: me.SECONDS_TO_EXPIRE
    });
    me.expirationTicker.start();
  },

  /**
   * @private
   */
  stopTicking: function (button) {
    var me = this,
        win = button.up('window');

    if (me.expirationTicker) {
      me.expirationTicker.destroy();
      delete me.expirationTicker;
    }
    if (win) {
      win.close();
    }
    me.activityMonitor.start();
  },

  /**
   * @public
   * Shows login window.
   */
  showLoginWindow: function () {
    var me = this;

    if (!me.getLogin()) {
      me.getLoginView().create();
    }
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

    NX.direct.rapture_Application.login(userName, userPass, values.remember === 'on', function (response) {
      win.getEl().unmask();
      if (Ext.isDefined(response) && response.success) {
        me.updateUser(response.data);
        win.close();
      }
    });
  },

  /**
   * @private
   */
  logout: function () {
    var me = this;

    me.logDebug('Logout...');

    NX.direct.rapture_Application.logout(function (response) {
      if (Ext.isDefined(response) && response.success) {
        me.updateUser();
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

    NX.Permissions.setPermissions(me.getPermissions());
    me.logDebug('Permissions changed. Firing event');
    me.fireEvent('permissionschanged', NX.Permissions);
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
  }

});