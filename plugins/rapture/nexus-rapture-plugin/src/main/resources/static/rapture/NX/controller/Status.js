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
    'Ext.Direct',
    'NX.Dialogs'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  /**
   * @private
   */
  disconnectedTimes: 0,

  /**
   * Max number of times to show a warning, before disabling the UI.
   *
   * @private
   */
  maxDisconnectWarnings: 3,

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.addEvents(
        'info',
        'user'
    );

    me.statusProvider = Ext.Direct.addProvider({
      type: 'polling',
      url: NX.direct.api.POLLING_URLS.rapture_Application_status,
      interval: NX.app.settings.statusInterval * 1000,
      listeners: {
        data: me.onData,
        scope: me
      }
    });
  },

  /**
   * Called when there is new data from status callback.
   *
   * @private
   */
  onData: function (provider, event) {
    var me = this;
    if (event.data) {
      me.onSuccess(event);
    }
    else {
      me.onError(event);
    }
  },

  /**
   * Called when status event data request was successful.
   *
   * @private
   */
  onSuccess: function (event) {
    var me = this,
        ctx = NX.ApplicationContext,
        status;

    // TODO: determine if the server has been restarted and force reload of the UI

    // re-enable the UI we are now connected again
    if (me.disconnectedTimes > 0) {
      me.disconnectedTimes = 0;
      NX.Messages.add({text: 'Server reconnected', type: 'success' });
    }

    // propagate event data
    status = event.data.data;
    me.fireEvent('info', status.info);
    me.fireEvent('user', status.user);

    if (!ctx.isLicenseInstalled() && status.info.licenseInstalled) {
      NX.Messages.add({ text: 'License installed', type: 'success' });
    }
    ctx.setRequiresLicense(status.info.requiresLicense);
    ctx.setLicenseInstalled(status.info.licenseInstalled);

    // fire commands if there are any
    if (status.commands) {
      Ext.each(status.commands, function (command) {
        me.fireEvent('command' + command.type.toLowerCase(), command.data);
      });
    }

    // TODO: Fire global refresh event
  },

  /**
   * Called when status event data request failed.
   *
   * @private
   */
  onError: function (event) {
    var me = this,
        ctx = NX.ApplicationContext;

    if (event.code === 'xhr') {
      if (event.xhr.status === 402) {
        if (ctx.isLicenseInstalled()) {
          NX.Messages.add({ text: 'License uninstalled', type: 'warning' });
          ctx.setLicenseInstalled(false);
        }
      }
      else {
        // we appear to have lost the server connection
        me.disconnectedTimes++;
        if (me.disconnectedTimes <= me.maxDisconnectWarnings) {
          NX.Messages.add({ text: 'Server disconnected', type: 'warning' });
        }

        // Give up after a few attempts and disable the UI
        if (me.disconnectedTimes > me.maxDisconnectWarnings) {
          NX.Messages.add({text: 'Server disconnected', type: 'danger' });

          // Stop polling
          me.statusProvider.disconnect();

          // Show the UI with a modal dialog error
          NX.Dialogs.showError(
              'Server disconnected',
              'There is a problem communicating with the server',
              {
                fn: function () {
                  // retry after the dialog is dismissed
                  me.statusProvider.connect();
                }

                // FIXME: Show "Retry" as button text
                // FIXME: Get icon to show up ... stupid icons
              }
          );
        }
      }
    }
    else if (event.type === 'exception') {
      NX.Messages.add({text: event.message, type: 'danger' });
    }
  },

  refresh: function () {
    var me = this;

    me.statusProvider.disconnect();
    me.statusProvider.connect();
  }

});