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
    'Ext.ux.window.Notification'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  views: [
    'message.Panel'
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

    me.control({
      'nx-message-panel button[action=clear]': {
        click: me.clearMessages
      },
      'nx-message-panel button[action=test]': {
        click: me.testMessage
      }
    });

    me.getMessageStore().on('datachanged', me.updateTitle, me);
  },

  /**
   * Change the panel title when the # of records in the store changes.
   *
   * @private
   */
  updateTitle: function() {
    var me = this,
        count = me.getMessageStore().getCount(),
        title = 'Messages';

    if (count != 0) {
      title = Ext.util.Format.plural(count, 'Message');
    }
    me.getPanel().setTitle(title);
  },

  /**
   * @private
   */
  clearMessages: function (button) {
    this.getMessageStore().removeAll();
  },

  /**
   * @private
   */
  testMessage: function() {
    this.addMessage({ text: 'test' });
  },

  /**
   * @public
   */
  addMessage: function(message) {
    var me = this,
        store = me.getMessageStore();

    message.timestamp = new Date();

    // add new messages to the top of the store
    store.insert(0, message);

    // show transient message window
    Ext.create('Ext.ux.window.Notification', {
      title: message.text,
      position: 'br',
      manager: 'default',
      stickWhileHover: false,
      //iconCls: 'ux-notification-icon-information',
      //html: message.text,
      slideInDuration: 800,
      slideBackDuration: 1500,
      autoCloseDelay: 4000,
      slideInAnimation: 'elasticIn',
      slideBackAnimation: 'elasticIn',
      width: 200
      //height: 124
    }).show();
  }
});