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
Ext.define('NX.controller.Message', {
  extend: 'Ext.app.Controller',
  requires: [
    'NX.Messages'
  ],

  mixins: {
    logAware: 'NX.LogAware'
  },

  views: [
    'message.Panel',
    'message.Notification'
  ],

  stores: [
    'Message'
  ],

  refs: [
    {
      ref: 'panel',
      selector: 'nx-message-panel'
    }
  ],

  /**
   * @protected
   */
  init: function () {
    var me = this;

    me.getApplication().getIconController().addIcons({
      'message-default': {
        file: 'bell.png',
        variants: ['x16', 'x32'],
        preload: true
      },
      'message-primary': {
        file: 'information.png',
        variants: ['x16', 'x32'],
        preload: true
      },
      'message-danger': {
        file: 'exclamation.png',
        variants: ['x16', 'x32'],
        preload: true
      },
      'message-warning': {
        file: 'warning.png',
        variants: ['x16', 'x32'],
        preload: true
      },
      'message-success': {
        file: 'accept.png',
        variants: ['x16', 'x32'],
        preload: true
      }
    });

    me.control({
      'nx-message-panel button[action=clear]': {
        click: me.clearMessages
      }
    });

    me.getMessageStore().on('datachanged', me.updateHeader, me);

    // Attach to helper
    NX.Messages.install(me);
  },

  /**
   * Change the panel title when the # of records in the store changes.
   *
   * @private
   */
  updateHeader: function () {
    var me = this,
        count = me.getMessageStore().getCount(),
        title = 'Messages';

    if (me.getPanel()) {
      if (count != 0) {
        title = Ext.util.Format.plural(count, 'Message');

        // update icon to highlight new messages
        me.getPanel().setIconCls(NX.controller.Icon.iconCls('message-default', 'x16'));
      }
      else {
        me.getPanel().setIconCls(undefined);
      }

      me.getPanel().setTitle(title);
    }
  },

  /**
   * @private
   */
  clearMessages: function (button) {
    this.getMessageStore().removeAll();
  },

  /**
   * @public
   */
  addMessage: function (message) {
    var me = this,
        store = me.getMessageStore();

    if (!message.type) {
      message.type = 'default'
    }

    message.timestamp = new Date();

    // add new messages to the top of the store
    store.insert(0, message);

    // show transient message notification
    me.getView('message.Notification').create({
      ui: 'message-' + message.type,
      iconCls: NX.controller.Icon.iconCls('message-' + message.type, 'x16'),
      title: Ext.String.capitalize(message.type),
      html: message.text
    });
  }
});