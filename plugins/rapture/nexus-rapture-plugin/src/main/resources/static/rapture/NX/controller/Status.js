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
    'NX.util.Msg'
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
      url: NX.direct.api.POLLING_URLS.status,
      interval: 5000,
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
   * Called when status event data request was successfull.
   *
   * @private
   */
  onSuccess: function(event) {
    var me = this, status;

    // re-enable the UI we are now connected again
    if (me.disconnectedTimes > 0) {
      me.disconnectedTimes = 0;
      me.getApplication().getMessageController().addMessage({text: 'Server reconnected', type: 'success' });
    }

    // propagate event data
    status = event.data.data;
    me.fireEvent('info', status.info);
    me.fireEvent('user', status.user);

    // fire commands if there are any
    if (status.commands) {
      Ext.each(status.commands, function (command) {
        me.fireEvent('command' + command.type.toLowerCase(), command.data);
      });
    }
  },

  /**
   * Called when status event data request failed.
   *
   * @private
   */
  onError: function(event) {
    var me = this,
        messages = me.getApplication().getMessageController();

    if (event.code === 'xhr') {
      // we appear to have lost the server connection
      me.disconnectedTimes++;
      if (me.disconnectedTimes <= me.maxDisconnectWarnings) {
        messages.addMessage({text: 'Server disconnected', type: 'warning' });
      }

      // Give up after a few attempts and disable the UI
      if (me.disconnectedTimes > me.maxDisconnectWarnings) {
        messages.addMessage({text: 'Server disconnected', type: 'danger' });

        // Stop polling
        me.statusProvider.disconnect();

        // Show the UI with a modal dialog error
        NX.util.Msg.showError(
            'Server disconnected',
            'There is a problem communicating with the server',
            {
              fn: function() {
                // retry after the dialog is dismissed
                me.statusProvider.connect();
              }

              // FIXME: Show "Retry" as button text
              // FIXME: Get icon to show up ... stupid icons
            }
        );
      }
    }
    else if (event.type === 'exception') {
      messages.addMessage({text: event.message, type: 'danger' });
    }
  },

  refresh: function () {
    var me = this;

    me.statusProvider.disconnect();
    me.statusProvider.connect();
  }

});