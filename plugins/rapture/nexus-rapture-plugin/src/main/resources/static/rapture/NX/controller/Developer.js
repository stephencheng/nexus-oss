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
Ext.define('NX.controller.Developer', {
  extend: 'Ext.app.Controller',
  mixins: {
    logAware: 'NX.LogAware'
  },

  views: [
    'dev.Panel',
    'dev.Tests',
    'dev.Buttons',
    'dev.Icons',
    'dev.Features',
    'dev.Permissions'
  ],

  /**
   * @protected
   */
  init: function () {
    var me = this,
        icons = me.getApplication().getIconController();

    icons.addIcons({
      'permission-granted': {
        file: 'tick.png',
        variants: [ 'x16', 'x32' ]
      },
      'permission-denied': {
        file: 'cross.png',
        variants: [ 'x16', 'x32' ]
      }
    });

    // FIXME: These are for testing only
    icons.addIcon({
      name: 'arrow_refresh',
      file: 'arrow_refresh.png',
      variant: 'x16'
    });

    icons.addIcon({
      name: 'arrow_refresh',
      file: 'arrow_refresh.png',
      variant: 'x32'
    });

    icons.addIcon({
      name: 'refresh',
      ref: 'arrow_refresh',
      variant: 'x16'
    });

    icons.addIcon({
      name: 'refresh',
      ref: 'arrow_refresh',
      variant: 'x32'
    });

    me.listen({
      component: {
        'nx-dev-tests button[action=testError]': {
          click: me.testError
        },
        'nx-dev-tests button[action=testExtError]': {
          click: me.testExtError
        },
        'nx-dev-tests button[action=testMessages]': {
          click: me.testMessages
        }
      },
      store: {
        '#FeatureMenu': {
          update: me.onFeatureUpdated
        }
      }
    });
  },

  /**
   * @private
   */
  testError: function () {
    console.log_no_such_method();
  },

  /**
   * @private
   */
  testExtError: function () {
    Ext.Error.raise('simulated error');
  },

  /**
   * @private
   */
  testMessages: function () {
    var me = this;

    Ext.each(['default', 'primary', 'danger', 'warning', 'success'], function (type) {
      me.getApplication().getMessageController().addMessage({
        type: type,
        text: 'test of ' + type
      });
    });
  },

  /**
   * @private
   */
  onFeatureUpdated: function () {
    var me = this;

    me.getApplication().getMainController().refresh();
  }
});