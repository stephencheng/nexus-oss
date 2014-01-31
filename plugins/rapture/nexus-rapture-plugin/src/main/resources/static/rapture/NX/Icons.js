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

/**
 * Helpers to interact with Icon controller.
 *
 * @since 2.8
 */
Ext.define('NX.Icons', {
  singleton: true,

  mixins: {
    logAware: 'NX.LogAware'
  },

  /**
   * Reference to the controller, set when it initializes.
   *
   * @private
   * @type {NX.controller.Icons}
   */
  controller: undefined,

  /**
   * Install the controller reference.
   *
   * @public
   * @static
   * @param {NX.controller.Icons} controller
   */
  install: function(controller) {
    this.controller = controller;
  },

  /**
   * Helper to get the CSS class for a named icon with optional variant.
   *
   * @public
   * @static
   */
  cls: function (name, variant) {
    var cls = 'nx-icon-' + name;
    if (variant) {
      cls += '-' + variant;
    }
    return cls;
  },

  /**
   * Helper to get html text for a named icon with variant.
   *
   * @public
   * @static
   */
  img: function(name, variant) {
    var cls = this.cls(name, variant);
    return '<img src="' + Ext.BLANK_IMAGE_URL + '" class="' + cls + '"/>';
  }

});