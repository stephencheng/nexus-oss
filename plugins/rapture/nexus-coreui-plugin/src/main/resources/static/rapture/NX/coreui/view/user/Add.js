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
Ext.define('NX.coreui.view.user.Add', {
  extend: 'Ext.window.Window',
  alias: 'widget.nx-coreui-user-add',

  title: 'Create new user',

  layout: 'fit',
  autoShow: true,
  modal: true,
  constrain: true,
  width: 640,
  defaultFocus: 'id',

  initComponent: function () {
    var me = this;

    Ext.apply(me, {
      items: {
        xtype: 'nx-coreui-user-settings',
        api: {
          submit: 'NX.direct.coreui_User.create'
        },
        buttons: [
          { text: 'Add', action: 'add', formBind: true, ui: 'primary' },
          { text: 'Cancel', handler: me.close, scope: me }
        ]
      }
    });

    me.callParent(arguments);

    me.down('#id').setReadOnly(false);

    me.down('form').insert(5, {
      xtype: 'textfield',
      name: 'password',
      fieldLabel: 'Password',
      emptyText: 'enter a password',
      inputType: 'password'
    });

    me.down('form').insert(6, {
      xtype: 'textfield',
      fieldLabel: 'Confirm Password',
      emptyText: 'confirm above password',
      inputType: 'password',
      submitValue: false
    });
  }

});
