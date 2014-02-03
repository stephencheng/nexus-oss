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
 * An **{@link Ext.form.Panel} with a Save/Discard buttons that auto loads & updates using api settings.
 *
 * @since 2.8
 */
Ext.define('NX.ext.form.Settings', {
  extend: 'Ext.form.Panel',
  alias: 'widget.nx-settings-form',

  /**
   * @cfg {String} Settings form description used in successful update message (e.g. "General system settings")
   */
  description: undefined,

  buttonAlign: 'left',
  buttons: [
    { text: 'Save', formBind: true, ui: 'primary',
      handler: function (button) {
        var form = button.up('form');
        if (form.api && form.api.update) {
          button.up('form').getForm().doAction('directupdate', {
            success: function () {
              if (form.description) {
                NX.Messages.add({ text: form.description + ' updated', type: 'success' });
              }
              form.load();
            }
          });
        }
      }
    },
    { text: 'Discard',
      handler: function (button) {
        var form = button.up('form');
        if (form.api && form.api.load) {
          form.load();
        }
      }
    }
  ],

  initComponent: function () {
    var me = this;

    me.callParent(arguments);

    me.on('beforerender', function (form) {
      if (form.api && form.api.load) {
        form.load();
      }
    }, me);
  }

});