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
Ext.define('NX.app.Application', {
  extend: 'Ext.app.Application',

  requires: [
    'Ext.Direct',
    'Ext.state.Manager',
    'Ext.state.CookieProvider',
    'Ext.state.LocalStorageProvider',
    'Ext.util.LocalStorage',
    'NX.view.Viewport'
  ],

  mixins: {
    logAware: 'NX.LogAware'
  },

  name: 'NX',
  appFolder: 'static/rapture/NX', // relative to /rapture.html

  namespaces: [],
  controllers: [
    'Main',
    'Bookmark',
    'MasterDetail'
  ],
  models: [
    'Feature'
  ],
  refs: [],
  stores: [
    'Feature'
  ],
  views: [
    'Header',
    'Developer'
  ],

  constructor: function (config) {
    var self = this, custom, keys;

    // only these customizations will be allowed
    custom = {
      namespaces: self.namespaces,
      controllers: self.controllers,
      models: self.models,
      refs: self.refs,
      stores: self.stores,
      views: self.views
    };
    keys = Object.keys(custom);
    self.logDebug('Supported customizations: ' + keys);

    // TODO: More error handling around pluginConfigClassNames content, this needs to be defined, should have at least one element, etc

    // for each plugin, merge its customizations
    self.logDebug('Plugins config class names: ' + NX.app.pluginConfigClassNames);
    Ext.each(NX.app.pluginConfigClassNames, function (className) {
      var pluginConfig;

      self.logDebug('Loading plugin config from class: ' + className);
      pluginConfig = Ext.create(className);

      // Detect customizations, these are simply fields defined on the plugin object
      // supported types are Array and String only
      Ext.each(keys, function (key) {
        var value = pluginConfig[key];
        if (value) {
          self.logDebug(key + ': ' + value);
          if (Ext.isString(value)) {
            custom[key].push(value);
          }
          else if (Ext.isArray(value)) {
            custom[key] = custom[key].concat(value);
          }
          else {
            Ext.Error.raise('Invalid customization; class: ' + className + ', property: ' + key);
          }
        }
      });
    });

    // apply the customization to this application
    self.logDebug('Applying customizations');

    Ext.each(keys, function (key) {
      self.logDebug(key + ': ' + custom[key]);
    });
    Ext.apply(self, custom);

    // Have to manually add namespaces, this is done by onClassExtended in super not in parent call
    if (custom.namespaces) {
      Ext.app.addNamespaces(custom.namespaces);
    }

    // and then let the super-class do the real work
    self.callParent(arguments);
  },

  init: function (app) {
    app.initState();
  },

  initState: function () {
    var self = this, provider;

    // prefer local storage if its supported
    if (Ext.util.LocalStorage.supported) {
      provider = Ext.create('Ext.state.LocalStorageProvider');
      this.logDebug('Using state provider: local');
    }
    else {
      provider = Ext.create('Ext.state.CookieProvider');
      this.logDebug('Using state provider: cookie');
    }

    // HACK: for debugging
    provider.on('statechange', function (provider, key, value, opts) {
      self.logDebug('State changed: ' + key + '=' + value);
    });

    Ext.state.Manager.setProvider(provider);
  },

  launch: function (profile) {
    Ext.create('NX.view.Viewport');

    // hide the loading mask after we have loaded
    var hideMask = function () {
      Ext.get('loading').remove();
      Ext.fly('loading-mask').animate({
        opacity: 0,
        remove: true
      });
    };

    Ext.defer(hideMask, 250);
  }
});