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
Ext.define('NX.capability.controller.Capabilities', {
  extend: 'NX.controller.MasterDetail',
  requires: [
    'NX.util.Msg',
    'NX.util.ExtDirect'
  ],

  name: 'capability',

  stores: [
    'CapabilityStatus',
    'Capability',
    'CapabilityType'
  ],
  models: [
    'Capability'
  ],
  views: [
    'Feature',
    'Add',
    'List',
    'Summary',
    'Settings',
    'Status',
    'About',
    'SettingsFieldSet'
  ],
  refs: [
    { ref: 'list', selector: 'nx-capability-list' },
    { ref: 'summary', selector: 'nx-capability-summary' },
    { ref: 'settings', selector: 'nx-capability-settings' },
    { ref: 'status', selector: 'nx-capability-status' },
    { ref: 'about', selector: 'nx-capability-about' }
  ],
  icons: {
    name: 'feature-capability',
    file: 'brick.png',
    variants: ['x16', 'x32']
  },
  features: {
    path: '/System/Capabilities',
    view: 'NX.capability.view.Feature',
    bookmark: 'capabilities',
    visible: function () {
      return NX.util.Permissions.check('nexus:capabilities', 'read');
    },
    iconName: 'feature-capability'
  },

  init: function () {
    var me = this;

    me.callParent();

    me.listen({
      component: {
        'nx-capability-list button[action=new]': {
          click: me.showAddWindow
        },
        'nx-capability-list button[action=delete]': {
          click: me.deleteCapability
        },
        'nx-capability-summary button[action=save]': {
          click: me.updateCapability
        },
        'nx-capability-settings button[action=save]': {
          click: me.updateCapability
        },
        'nx-capability-add combo[name=typeId]': {
          select: me.changeCapabilityType
        },
        'nx-capability-add button[action=add]': {
          click: me.createCapability
        }
      },
      store: {
        '#CapabilityType': {
          load: me.enableNewButton
        }
      }
    });
  },

  /**
   * Returns a description of capability suitable to be displayed.
   */
  getDescription: function (model) {
    var description = model.get('typeName');
    if (model.get('description')) {
      description += ' - ' + model.get('description');
    }
    return description;
  },

  onSelection: function (list, model) {
    var me = this,
        capabilityModel, capabilityTypeModel;

    if (Ext.isDefined(model)) {
      capabilityModel = me.getCapabilityStore().getById(model.get('id'));
      capabilityTypeModel = me.getCapabilityTypeStore().getById(model.get('typeId'));

      me.showTitle(model);
      me.showSummary(model, capabilityModel);
      me.showSettings(capabilityModel, capabilityTypeModel);
      me.showAbout(capabilityTypeModel);
      me.showStatus(model);
    }

    me.enableDeleteButton();
  },

  showTitle: function (model) {
    var masterdetail = this.getList().up('nx-masterdetail-panel');

    if (model.get('enabled') && !model.get('active')) {
      masterdetail.showWarning(model.get('stateDescription'));
    }
    else {
      masterdetail.clearWarning();
    }
  },

  showSummary: function (model, capabilityModel) {
    var summary = this.getSummary(),
        info = {
          'Type': model.get('typeName'),
          'Description': model.get('description')
        };

    if (Ext.isDefined(model.get('tags'))) {
      Ext.each(model.get('tags'), function (tag) {
        info[tag.key] = tag.value;
      });
    }

    summary.showInfo(info);
    summary.down('form').loadRecord(capabilityModel);
  },

  showSettings: function (capabilityModel, capabilityTypeModel) {
    var settings = this.getSettings(),
        settingsFieldSet = settings.down('nx-capability-settings-fieldset');

    settings.loadRecord(capabilityModel);
    settingsFieldSet.importCapability(settings.getForm(), capabilityModel, capabilityTypeModel);
  },

  showStatus: function (model) {
    this.getStatus().showStatus(model.get('status'));
  },

  showAbout: function (model) {
    this.getAbout().showAbout(model.get('about'));
  },

  showAddWindow: function () {
    Ext.widget('nx-capability-add', {
      capabilityTypeStore: this.getCapabilityTypeStore()
    });
  },

  changeCapabilityType: function (combo) {
    var win = combo.up('window'),
        capabilityTypeModel;

    capabilityTypeModel = this.getCapabilityTypeStore().getById(combo.value);
    win.down('nx-capability-about').showAbout(capabilityTypeModel.get('about'));
    win.down('nx-capability-settings-fieldset').setCapabilityType(capabilityTypeModel);
  },

  createCapability: function (button) {
    var me = this,
        win = button.up('window'),
        form = button.up('form'),
        capabilityModel = me.getCapabilityModel().create(),
        values = form.getValues();

    capabilityModel.set(values);

    NX.direct.Capability.create(capabilityModel.data, function (response, status) {
      if (!NX.util.ExtDirect.showExceptionIfPresent('Capability could not be created', response, status)) {
        if (Ext.isDefined(response)) {
          if (response.success) {
            me.getCapabilityStatusStore().on('load', function (store) {
              me.getList().getSelectionModel().select(store.getById(response.data));
            }, me, {single: true});
            me.loadStores();
            win.close();
          }
          else {
            if (Ext.isDefined(response.errors)) {
              NX.util.Msg.showError('Capability could not be created', form.markInvalid(response.errors));
            }
            else {
              NX.util.Msg.showError('Capability could not be created', response.message);
            }
          }
        }
      }
    });
  },

  updateCapability: function (button) {
    var me = this,
        form = button.up('form'),
        capabilityModel = form.getRecord(),
        values = form.getValues();

    capabilityModel.set(values);

    NX.direct.Capability.update(capabilityModel.data, function (response, status) {
      if (!NX.util.ExtDirect.showExceptionIfPresent('Capability could not be saved', response, status)) {
        if (Ext.isDefined(response)) {
          if (response.success) {
            me.loadStores();
          }
          else {
            if (Ext.isDefined(response.errors)) {
              NX.util.Msg.showError('Capability could not be saved', form.markInvalid(response.errors));
            }
            else {
              NX.util.Msg.showError('Capability could not be saved', response.message);
            }
          }
        }
      }
    });
  },

  deleteCapability: function (button) {
    var me = this,
        selection = me.getList().getSelectionModel().getSelection();

    if (Ext.isDefined(selection) && selection.length > 0) {
      NX.util.Msg.askConfirmation('Confirm deletion?', me.getDescription(selection[0]), function () {
        NX.direct.Capability.delete(selection[0].getId(), function (response, status) {
          if (!NX.util.ExtDirect.showExceptionIfPresent('Capability could not be deleted', response, status)) {
            if (Ext.isDefined(response)) {
              if (response.success) {
                me.loadStores();
              }
              else {
                NX.util.Msg.showError(
                    'Capability could not be deleted',
                    response.message
                );
              }
            }
          }
        });
      }, {scope: me});
    }
  },

  onPermissionsChanged: function () {
    var me = this;

    me.enableNewButton();
    me.enableDeleteButton();
  },

  enableNewButton: function () {
    var me = this,
        button = me.getList().down('button[action=new]');

    if (NX.util.Permissions.check('nexus:capabilities', 'create')) {
      button.enable();
    }
    else {
      button.disable();
    }
  },

  enableDeleteButton: function () {
    var me = this,
        list = me.getList(),
        selectedModels = list.getSelectionModel().getSelection(),
        button = me.getList().down('button[action=delete]');

    if (selectedModels.length > 0 && NX.util.Permissions.check('nexus:capabilities', 'delete')) {
      button.enable();
    }
    else {
      button.disable();
    }
  }

});