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
    'NX.Dialogs'
  ],

  list: 'nx-capability-list',

  stores: [
    'CapabilityStatus',
    'Capability',
    'CapabilityType'
  ],
  models: [
    'Capability',
    'CapabilityStatus'
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
    'feature-system-capabilities': {
      file: 'brick.png',
      variants: ['x16', 'x32']
    },
    'capability-default': {
      file: 'brick.png',
      variants: ['x16', 'x32']
    }
  },
  features: {
    path: '/System/Capabilities',
    view: { xtype: 'nx-capability-feature' },
    visible: function () {
      return NX.Permissions.check('nexus:capabilities', 'read');
    }
  },
  permission: 'nexus:capabilities',

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
        '#CapabilityStatus': {
          beforeload: me.onCapabilityStatusBeforeLoad
        },
        '#Capability': {
          load: me.reselect
        },
        '#CapabilityType': {
          load: me.onCapabilityTypeLoad,
          datachanged: me.onCapabilityTypeLoad
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
    if (capabilityModel) {
      summary.down('form').loadRecord(capabilityModel);
    }
  },

  showSettings: function (capabilityModel, capabilityTypeModel) {
    var settings = this.getSettings(),
        settingsFieldSet = settings.down('nx-capability-settings-fieldset');

    if (capabilityModel) {
      settings.loadRecord(capabilityModel);
      settingsFieldSet.importCapability(settings.getForm(), capabilityModel, capabilityTypeModel);
    }
  },

  showStatus: function (model) {
    this.getStatus().showStatus(model.get('status'));
  },

  showAbout: function (capabilityTypeModel) {
    this.getAbout().showAbout(capabilityTypeModel?capabilityTypeModel.get('about'):undefined);
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

  /**
   * @override
   * Enable only when there are capabilities types.
   */
  shouldEnableNewButton: function () {
    var me = this;
    return me.getCapabilityTypeStore().getCount() > 0 && me.callParent()
  },

  onCapabilityStatusBeforeLoad: function () {
    var me = this;

    me.getCapabilityTypeStore().load();
    me.getCapabilityStore().load();
  },

  onCapabilityTypeLoad: function () {
    var me = this;

    me.reselect();
    me.enableNewButton();
  },

  createCapability: function (button) {
    var me = this,
        win = button.up('window'),
        form = button.up('form'),
        capabilityModel = me.getCapabilityModel().create(),
        values = form.getValues(),
        remainingErrors;

    capabilityModel.set(values);

    NX.direct.capability_Capability.create(capabilityModel.data, function (response) {
      if (Ext.isDefined(response)) {
        if (response.success) {
          win.close();
          NX.Messages.add({
            text: 'Capability created: ' + me.getDescription(me.getCapabilityStatusModel().create(response.data)),
            type: 'success'
          });
          me.loadStoreAndSelect(response.data.id);
        }
        else if (Ext.isDefined(response.errors)) {
          remainingErrors = form.markInvalid(response.errors);
          if (remainingErrors) {
            NX.Messages.add({ text:remainingErrors, type: 'warning' });
          }
        }
      }
    });
  },

  updateCapability: function (button) {
    var me = this,
        form = button.up('form'),
        capabilityModel = form.getRecord(),
        values = form.getValues(),
        remainingErrors;

    capabilityModel.set(values);

    NX.direct.capability_Capability.update(capabilityModel.data, function (response) {
      if (Ext.isDefined(response)) {
        if (response.success) {
          NX.Messages.add({
            text: 'Capability updated: ' + me.getDescription(me.getCapabilityStatusModel().create(response.data)),
            type: 'success'
          });
          me.loadStore();
        }
        else if (Ext.isDefined(response.errors)) {
          remainingErrors = form.markInvalid(response.errors);
          if (remainingErrors) {
            NX.Messages.add({ text:remainingErrors, type: 'warning' });
          }
        }
      }
    });
  },

  deleteCapability: function (button) {
    var me = this,
        selection = me.getList().getSelectionModel().getSelection(),
        description;

    if (Ext.isDefined(selection) && selection.length > 0) {
      description = me.getDescription(selection[0]);
      NX.Dialogs.askConfirmation('Confirm deletion?', description, function () {
        NX.direct.capability_Capability.delete(selection[0].getId(), function (response) {
          me.loadStore();
          if (Ext.isDefined(response) && response.success) {
            NX.Messages.add({
              text: 'Capability deleted: ' + description, type: 'success'
            });
          }
        });
      }, {scope: me});
    }
  }

});