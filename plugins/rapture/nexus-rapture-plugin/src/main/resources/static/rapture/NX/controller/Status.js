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
    'NX.util.Base64',
    'NX.util.Permissions'
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
   * @private
   */
  onData: function (provider, event) {
    var me = this,
        status;

    if (event.data) {
      status = event.data.data;
      me.fireEvent('info', status.info);
      me.fireEvent('user', status.user);
      if (status.commands) {
        Ext.each(status.commands, function (command) {
          me.fireEvent('command' + command.type.toLowerCase(), command.data);
        });
      }
    }
    else {
      if (event.code === 'xhr') {
        me.getApplication().getMessageController().addMessage({text: 'Server disconnected', type: 'warning' });
      }
      else if (event.type === 'exception') {
        me.getApplication().getMessageController().addMessage({text: event.message, type: 'danger' });
      }
    }
  },

  refresh: function () {
    var me = this;

    me.statusProvider.disconnect();
    me.statusProvider.connect();
  }

});