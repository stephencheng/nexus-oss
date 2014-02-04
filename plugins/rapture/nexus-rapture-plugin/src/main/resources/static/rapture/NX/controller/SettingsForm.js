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
 * Controls forms marked with settingsForm = true by adding save/discard/refresh functionality using form configured
 * api.
 *
 * @since 2.8
 */
Ext.define('NX.controller.SettingsForm', {
  extend: 'Ext.app.Controller',

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.listen({
      controller: {
        '#Refresh': {
          refresh: me.onRefresh
        }
      },
      component: {
        'form[settingsForm=true]': {
          beforerender: me.onBeforeRender,
          directload: me.onDirectLoad,
          directupdate: me.onDirectUpdate
        },
        'form[settingsForm=true] button[action=savesettings]': {
          click: me.onDirectUpdateButtonClick
        },
        'form[settingsForm=true] button[action=discardsettings]': {
          click: me.onDirectDiscardButtonClick
        }
      }
    });
  },

  /**
   * @private
   */
  onRefresh: function () {
    var forms = Ext.ComponentQuery.query('form[settingsForm=true]');
    if (forms) {
      Ext.each(forms, function (form) {
        form.fireEvent('directload', form);
      });
    }
  },

  /**
   * @private
   */
  onBeforeRender: function (form) {
    form.fireEvent('directload', form);
  },

  /**
   * @private
   */
  onDirectLoad: function (form) {
    if (form.api && form.api.load) {
      form.load();
    }
  },

  /**
   * @private
   */
  onDirectUpdate: function (form) {
    if (form.api && form.api.update) {
      form.getForm().doAction('directupdate', {
        success: function () {
          if (form.settingsFormTitle) {
            NX.Messages.add({ text: form.settingsFormTitle + ' updated', type: 'success' });
          }
          form.fireEvent('directload', form);
        }
      });
    }
  },

  /**
   * @private
   */
  onDirectUpdateButtonClick: function (button) {
    var form = button.up('^form[settingsForm=true]')
    form.fireEvent('directupdate', form);
  },

  /**
   * @private
   */
  onDirectDiscardButtonClick: function (button) {
    var form = button.up('^form[settingsForm=true]')
    form.fireEvent('directload', form);
  }

});