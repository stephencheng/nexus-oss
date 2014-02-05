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
 * Holds application context values.
 *
 * @since 2.8
 */
Ext.define('NX.ApplicationContext', {
  singleton: true,
  requires: [
    'Ext.util.HashMap'
  ],
  mixins: {
    observable: 'Ext.util.Observable',
    logAware: 'NX.LogAware'
  },

  /**
   * @private
   * {@link Ext.util.HashMap} containing context values by key
   */
  values: new Ext.util.HashMap(),

  constructor: function (config) {
    var me = this;

    me.mixins.observable.constructor.call(me, config);

    me.values.on('replace', me.notifyChange, me);

    me.addEvents(
        /**
         * @event changed
         * Fires when any of application contex values changes.
         * @param {NX.ApplicationContext} this
         */
        'changed'
    );
  },

  /**
   * @public
   * @returns {boolean} true, if browser is supported
   */
  isBrowserSupported: function () {
    var me = this;
    return me.values.get('browserSupported') === true;
  },

  /**
   * @public
   * @param {boolean} value true, if browser is supported
   */
  setBrowserSupported: function (value) {
    var me = this;

    me.setIfNotEqual('browserSupported', value === true, me.isBrowserSupported());
  },

  /**
   * @public
   * @returns {boolean} true, if license is required
   */
  requiresLicense: function () {
    var me = this;
    return me.values.get('requiresLicense') === true;
  },

  /**
   * @public
   * @param {boolean} value true, if license is required
   */
  setRequiresLicense: function (value) {
    var me = this;
    me.setIfNotEqual('requiresLicense', value === true, me.requiresLicense());
  },

  /**
   * @public
   * @returns {boolean} true, if license is installed
   */
  isLicenseInstalled: function () {
    var me = this;
    return me.values.get('licenseInstalled') === true;
  },

  /**
   * @public
   * @param {boolean} value true, if license is installed
   */
  setLicenseInstalled: function (value) {
    var me = this;
    me.setIfNotEqual('licenseInstalled', value === true, me.isLicenseInstalled());
  },

  setIfNotEqual: function (key, value, oldValue) {
    var me = this;

    if (value != oldValue) {
      me.values.replace(key, value);
    }
  },

  notifyChange: function (map, key, value) {
    var me = this;
    me.logDebug('Changed: ' + key + ' -> ' + value);
    me.fireEvent('changed', me);
  }

});