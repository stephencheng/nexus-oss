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
Ext.define('NX.coreui.view.security.Anonymous', {
  extend: 'Ext.Panel',
  alias: 'widget.nx-coreui-security-anonymous',

  layout: {
    type: 'vbox',
    align: 'stretch',
    pack: 'start'
  },

  maxWidth: 1024,

  style: {
    margin: '20px'
  },

  defaults: {
    style: {
      margin: '0px 0px 20px 0px'
    }
  },

  items: [
    // basic settings
    {
      xtype: 'form',
      items: [
        {
          xtype: 'label',
          html: '<p>Anonymous user access settings.</p>'
        },
        {
          xtype: 'checkbox',
          boxLabel: 'Allow anonymous users to access the server'
        },
        {
          xtype: 'fieldset',
          title: 'Use custom anonymous user',
          checkboxToggle: true,
          collapsed: true,
          items: [
            {
              xtype: 'label',
              html: '<p>Override the default anonymous user.</p>'
            },
            {
              xtype: 'textfield',
              fieldLabel: 'Username'
            },
            {
              xtype: 'textfield',
              fieldLabel: 'Password',
              inputType: 'password'
            }
          ]
        },
      ],

      buttonAlign: 'left',
      buttons: [
        { text: 'Save', ui: 'primary' },
        { text: 'Discard' }
      ]
    }
  ]

});