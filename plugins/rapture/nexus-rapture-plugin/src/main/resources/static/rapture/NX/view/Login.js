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
Ext.define('NX.view.Login', {
  extend: 'Ext.window.Window',
  alias: 'widget.nx-login',

  title: 'Login',

  layout: 'fit',
  autoShow: true,
  modal: true,
  constrain: true,
  width: 320,

  initComponent: function () {
    var me = this;

    Ext.apply(this, {
      items: {
        xtype: 'form',
        items: [
          {
            xtype: 'textfield',
            name: 'username',
            htmlDecode: true,
            fieldLabel: 'Username',
            itemCls: 'required-field',
            allowBlank: false,
            anchor: '96%'
          },
          {
            xtype: 'textfield',
            name: 'password',
            htmlDecode: true,
            fieldLabel: 'Password',
            itemCls: 'required-field',
            allowBlank: false,
            anchor: '96%',
            inputType: 'password'
          }
        ],

        buttons: [
          { text: 'Login', action: 'login', formBind: true, ui: 'blue' },
          { text: 'Cancel', handler: me.close, scope: me }
        ]
      }
    });

    me.callParent(arguments);
  }

});
