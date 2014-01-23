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
Ext.define('NX.util.Msg', {
  singleton: true,

  /**
   * @public
   */
  showError: function (title, message, options) {
    if (Ext.isDefined(message)) {
      options = options || {};
      Ext.Msg.show({
        title: title || 'Operation failed',
        msg: message,
        buttons: Ext.Msg.OK,
        icon: Ext.MessageBox.ERROR,
        closeable: false,
        animEl: options.animEl
      });
    }
  },

  /**
   * @public
   */
  askConfirmation: function (title, message, onYesFn, options) {
    options = options || {};
    Ext.Msg.show({
      title: title,
      msg: message,
      buttons: Ext.Msg.YESNO,
      icon: Ext.MessageBox.QUESTION,
      closeable: false,
      animEl: options.animEl,
      fn: function (buttonName) {
        if (buttonName === 'yes' || buttonName === 'ok') {
          if (Ext.isDefined(onYesFn)) {
            onYesFn.call(options.scope);
          }
        }
      }
    });
  }

});