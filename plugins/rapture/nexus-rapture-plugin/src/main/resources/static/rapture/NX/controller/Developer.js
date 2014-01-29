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
    'dev.Messages',
    'dev.Features'
  ],

  refs: [
    {
      ref: 'branding',
      selector: 'nx-header-branding'
    }
  ],

  /**
   * @protected
   */
  init: function () {
    var me = this;

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
        },
        'nx-dev-tests button[action=toggleBranding]': {
          click: me.toggleBranding
        }
      }
    });
  },

  /**
   * Attempts to call a object's method that doesn't exist to produce a low-level javascript error.
   *
   * @private
   */
  testError: function () {
    console.log_no_such_method();
  },

  /**
   * Raises an Ext.Error so we can see how that behaves.
   *
   * @private
   */
  testExtError: function () {
    Ext.Error.raise('simulated error');
  },

  /**
   * Adds messages for each of the major types to view styling, etc.
   *
   * @private
   */
  testMessages: function () {
    var me = this;

    Ext.each(['default', 'primary', 'danger', 'warning', 'success'], function (type) {
      NX.Messages.add({
        type: type,
        text: 'test of ' + type
      });
    });
  },

  /**
   * @private
   */
  toggleBranding: function () {
    var me = this,
        branding = me.getBranding();

    if (branding.isVisible()) {
      branding.hide();
    }
    else {
      branding.show();
    }
  }

});