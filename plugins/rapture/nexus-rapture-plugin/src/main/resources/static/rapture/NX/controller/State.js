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
 * @since 2.8
 */
Ext.define('NX.controller.State', {
  extend: 'Ext.app.Controller',
  requires: [
    'Ext.Direct',
    'NX.Dialogs'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  models: [
    'State'
  ],
  stores: [
    'State'
  ],

  /**
   * @private
   */
  disconnectedTimes: 0,

  /**
   * Max number of times to show a warning, before disabling the UI.
   *
   * @private
   */
  maxDisconnectWarnings: 3,

  init: function () {
    var me = this;

    me.listen({
      controller: {
        '#State': {
          uisettingschanged: me.onUiSettingsChanged,
          licensechanged: me.onLicenseChanged
        }
      },
      store: {
        '#State': {
          add: me.onEntryAdded,
          update: me.onEntryUpdated,
          remove: me.onEntryRemoved
        }
      }
    });

    me.addEvents(
        /**
         * @event changed
         * Fires when any of application context values changes.
         */
        'changed'
    );
  },

  onLaunch: function () {
    NX.State.setBrowserSupported(false);
    NX.State.setValues(NX.app.state);
  },

  getValue: function (key, defaultValue) {
    var me = this,
        model = me.getStateStore().getById(key),
        value = defaultValue;

    if (model) {
      value = model.get('value');
    }
    return value;
  },

  setValue: function (key, value) {
    var me = this,
        model = me.getStateStore().getById(key);

    if (!model) {
      if (value) {
        me.getStateStore().add(me.getStateModel().create({ key: key, value: value }));
      }
    }
    else {
      if (value) {
        model.set('value', value);
      }
      else {
        me.getStateStore().remove(model);
      }
    }
  },

  setValueIfDifferent: function (key, value) {
    var me = this;

    if (!Ext.Object.equals(value, me.getValue(key))) {
      me.setValue(key, value);
    }
  },

  setValues: function (map) {
    var me = this,
        valueToSet;

    if (map) {
      Ext.Object.each(map, function (key, value) {
        valueToSet = value;
        if (!Ext.isPrimitive(value) && !Ext.isArray(value)
            && Ext.ClassManager.getByAlias('nx.state.' + key)) {
          valueToSet = Ext.ClassManager.instantiateByAlias('nx.state.' + key, value);
        }
        me.setValueIfDifferent(key, valueToSet);
      });
    }
  },

  onEntryAdded: function (store, models) {
    var me = this;
    Ext.each(models, function (model) {
      me.notifyChange(model.get('key'), model.get('value'));
    });
  },

  onEntryUpdated: function (store, model) {
    var me = this;
    me.notifyChange(model.get('key'), model.get('value'), model.modified.value);
  },

  onEntryRemoved: function (store, model) {
    var me = this;
    me.notifyChange(model.get('key'), undefined, model.get('value'));
  },

  notifyChange: function (key, value, oldValue) {
    var me = this;
    me.logDebug('Changed: ' + key + ' -> ' + (value ? Ext.JSON.encode(value) : '(deleted)'));
    me.fireEvent(key.toLowerCase() + 'changed', value, oldValue);
    me.fireEvent('changed', key, value, oldValue);
  },

  /**
   * @private
   * Reset state pooling when uiSettings.statusInterval changes.
   * @param {Object} uiSettings
   * @param {Number} uiSettings.statusInterval
   * @param {Object} oldUiSettings
   * @param {Number} oldUiSettings.statusInterval
   */
  onUiSettingsChanged: function (uiSettings, oldUiSettings) {
    var me = this;

    if (uiSettings && uiSettings.statusInterval > 0) {
      if (!oldUiSettings || (uiSettings.statusInterval !== oldUiSettings.statusInterval)) {
        if (me.statusProvider) {
          me.statusProvider.disconnect();
        }
        me.statusProvider = Ext.Direct.addProvider({
          type: 'polling',
          url: NX.direct.api.POLLING_URLS.rapture_State_get,
          interval: uiSettings.statusInterval * 1000,
          listeners: {
            data: me.onServerData,
            scope: me
          }
        });
        me.logDebug('State pooling configured for ' + (uiSettings.statusInterval) + ' seconds');
      }
    }
    else {
      if (me.statusProvider) {
        me.statusProvider.disconnect();
      }
      me.logDebug('State pooling disabled');
    }
  },

  /**
   * Called when there is new data from state callback.
   *
   * @private
   */
  onServerData: function (provider, event) {
    var me = this;
    if (event.data) {
      me.onSuccess(event);
    }
    else {
      me.onError(event);
    }
  },

  /**
   * @private
   * Called when state pooling was successful.
   */
  onSuccess: function (event) {
    var me = this,
        state;

    // TODO: determine if the server has been restarted and force reload of the UI

    // re-enable the UI we are now connected again
    if (me.disconnectedTimes > 0) {
      me.disconnectedTimes = 0;
      NX.Messages.add({text: 'Server reconnected', type: 'success' });
    }

    // propagate event data
    state = event.data.data;

    me.setValues(state.values);

    // fire commands if there are any
    if (state.commands) {
      Ext.each(state.commands, function (command) {
        me.fireEvent('command' + command.type.toLowerCase(), command.data);
      });
    }

    // TODO: Fire global refresh event
  },

  /**
   * @private
   * Called when state pooling failed.
   */
  onError: function (event) {
    var me = this;

    if (event.code === 'xhr') {
      if (event.xhr.status === 402) {
        if (NX.State.isLicenseInstalled()) {
          NX.State.setValue('license', Ext.apply(NX.State.getValue('license'), { installed: false }));
        }
      }
      else {
        // we appear to have lost the server connection
        me.disconnectedTimes++;
        if (me.disconnectedTimes <= me.maxDisconnectWarnings) {
          NX.Messages.add({ text: 'Server disconnected', type: 'warning' });
        }

        // Give up after a few attempts and disable the UI
        if (me.disconnectedTimes > me.maxDisconnectWarnings) {
          NX.Messages.add({text: 'Server disconnected', type: 'danger' });

          // Stop polling
          me.statusProvider.disconnect();

          // Show the UI with a modal dialog error
          NX.Dialogs.showError(
              'Server disconnected',
              'There is a problem communicating with the server',
              {
                fn: function () {
                  // retry after the dialog is dismissed
                  me.statusProvider.connect();
                }

                // FIXME: Show "Retry" as button text
                // FIXME: Get icon to show up ... stupid icons
              }
          );
        }
      }
    }
    else if (event.type === 'exception') {
      NX.Messages.add({ text: event.message, type: 'danger' });
    }
  },

  /**
   * @private
   * Show messages about license.
   * @param {Object} license
   * @param {Number} license.installed
   * @param {Object} oldLicense
   * @param {Number} oldLicense.installed
   */
  onLicenseChanged: function (license, oldLicense) {
    var me = this;

    if (license && oldLicense) {
      if (license.installed && !oldLicense.installed) {
        NX.Messages.add({ text: 'License installed', type: 'success' });
      }
      else if (!license.installed && oldLicense.installed) {
        NX.Messages.add({ text: 'License uninstalled', type: 'warning' });
      }
    }
  }

});