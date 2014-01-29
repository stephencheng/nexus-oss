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
    'Ext.Error',
    'Ext.Direct',
    'Ext.state.Manager',
    'Ext.state.CookieProvider',
    'Ext.state.LocalStorageProvider',
    'Ext.util.LocalStorage',
    'NX.view.Viewport',
    'NX.util.Url',
    'NX.Bookmark',

    // require custom extensions so we don't need to requirement explicitly everywhere
    'NX.ext.grid.IconColumn',
    'NX.ext.SearchBox'
  ],

  uses: [
    'NX.ext.grid.plugin.FilterBox',
    'NX.ext.grid.plugin.Filtering'
  ],

  mixins: {
    logAware: 'NX.LogAware'
  },

  name: 'NX',
  appFolder: 'static/rapture/NX', // relative to /rapture.html

  paths: {
    'Ext.ux': 'static/rapture/Ext/ux'
  },

  namespaces: [],
  controllers: [
    'Bookmarking',
    'Dashboard',
    'dev.Developer',
    'dev.Permissions',
    'Features',
    'Help',
    'Icon',
    'Main',
    'Menu',
    'Message',
    'Status',
    'User',
    'ExtDirect',

    // HACK: Temporary controller for random stuff while we are building out the framework
    'Temp'
  ],
  models: [
    'Message'
  ],
  stores: [
    'Message'
  ],
  views: [
    'masterdetail.Panel',
    'masterdetail.Tabs'
  ],
  refs: [],

  constructor: function (config) {
    var me = this, custom, keys;

    me.logDebug('create');

    // only these customizations will be allowed
    custom = {
      namespaces: me.namespaces,
      controllers: me.controllers,
      models: me.models,
      refs: me.refs,
      stores: me.stores,
      views: me.views
    };
    keys = Object.keys(custom);
    me.logDebug('Supported customizations: ' + keys);

    // TODO: More error handling around pluginConfigClassNames content, this needs to be defined, should have at least one element, etc

    // for each plugin, merge its customizations
    me.logDebug('Plugins config class names: ' + NX.app.pluginConfigClassNames);
    Ext.each(NX.app.pluginConfigClassNames, function (className) {
      var pluginConfig;

      me.logDebug('Loading plugin config from class: ' + className);
      pluginConfig = Ext.create(className);

      // Detect customizations, these are simply fields defined on the plugin object
      // supported types are Array and String only
      Ext.each(keys, function (key) {
        var value = pluginConfig[key];
        if (value) {
          me.logDebug(key + ': ' + value);
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
    me.logDebug('Applying customizations');

    Ext.each(keys, function (key) {
      me.logDebug(key + ': ' + custom[key]);
    });
    Ext.apply(me, custom);

    // Have to manually add namespaces, this is done by onClassExtended in super not in parent call
    if (custom.namespaces) {
      Ext.app.addNamespaces(custom.namespaces);
    }

    // and then let the super-class do the real work
    me.callParent(arguments);
  },

  /**
   * @override
   *
   * @param app
   */
  init: function (app) {
    NX.Log.debug('init');

    // Configure blank image URL
    Ext.BLANK_IMAGE_URL = NX.util.Url.baseUrl + '/static/rapture/resources/images/s.gif';

    app.initErrorHandler();
    app.initDirect();
    app.initState();
  },

  /**
   * @private
   */
  initErrorHandler: function () {
    var me = this,
        originalOnerror = window.onerror;

    // FIXME: This needs further refinement, seems like javascript errors are lost in Firefox (but show up fine in Chrome)

    // pass unhandled errors to application error handler
    Ext.Error.handle = function (err) {
      me.errorHandler(err);
    };

    // FIXME: This will catch more errors, but duplicates messages for ext errors
    // FIXME: Without this however some javascript errors will go unhandled
    window.onerror = function (msg, url, line) {
      me.errorHandler({ msg: msg + ' (' + url + ':' + line + ')' });

      // maybe delegate to original window.onerror handler
      if (originalOnerror) {
        originalOnerror(msg, url, line);
      }
    };
  },

  /**
   * Customize error to-string handling.
   *
   * Ext.Error.toString() assumes instance, but raise(String) makes anonymous object.
   *
   * @private
   */
  errorAsString: function (error) {
    var className = error.sourceClass ? error.sourceClass : '',
        methodName = error.sourceMethod ? '.' + error.sourceMethod + '(): ' : '',
        msg = error.msg || '(No description provided)';
    return className + methodName + msg;
  },

  /**
   * @private
   */
  errorHandler: function (error) {
    var me = this;
    NX.Messages.add({
      type: 'danger',
      text: me.errorAsString(error)
    });
  },

  /**
   * @private
   */
  initDirect: function () {
    Ext.Direct.addProvider(NX.direct.api.REMOTING_API);
    this.logDebug('Configured direct');
  },

  /**
   * @private
   */
  initState: function () {
    var me = this, provider;

    // prefer local storage if its supported
    if (Ext.util.LocalStorage.supported) {
      provider = Ext.create('Ext.state.LocalStorageProvider');
      me.logDebug('Using state provider: local');
    }
    else {
      // FIXME: We may want to either not support state, or implement remoting to used
      // FIXME: The remote session of the user to store state
      // FIXME: Cookie impl will create too many cookies and could cause lots of weird things to break
      provider = Ext.create('Ext.state.CookieProvider');
      me.logDebug('Using state provider: cookie');
    }

    // HACK: for debugging
    //provider.on('statechange', function (provider, key, value, opts) {
    //  me.logDebug('State changed: ' + key + '=' + value);
    //});

    Ext.state.Manager.setProvider(provider);
  },

  /**
   * @public
   */
  launch: function (profile) {
    var me = this;
    me.logDebug('launch: profile=' + profile);

    Ext.create('NX.view.Viewport');

    // hide the loading mask after we have loaded
    var hideMask = function () {
      me.logDebug('hide loading mask');

      Ext.get('loading').remove();
      Ext.fly('loading-mask').animate({
        opacity: 0,
        remove: true
      });
    };

    // FIXME: Need a better way to know when the UI is actually rendered so we can hide the mask
    // HACK: for now increasing delay slightly to cope with longer loading times
    Ext.defer(hideMask, 500);
  }
});