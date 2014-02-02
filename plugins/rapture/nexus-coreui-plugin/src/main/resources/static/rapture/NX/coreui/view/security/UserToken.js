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
Ext.define('NX.coreui.view.security.UserToken', {
  extend: 'Ext.Panel',
  alias: 'widget.nx-coreui-security-usertoken',

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
          html: '<p>User token settings.</p>'
        },

        // HACK: Using boxLabel to render label to right of checkbox as example
        {
          xtype: 'checkbox',
          boxLabel: 'Enable user tokens'
          //fieldLabel: 'Enable user tokens'
        },
        {
          xtype: 'checkbox',
          boxLabel: 'Require user tokens for content access'
          //fieldLabel: 'Require user tokens for content access'
        },
      ],

      buttonAlign: 'left',
      buttons: [
        { text: 'Save', ui: 'primary' },
        { text: 'Discard' }
      ]
    },

    // dangerous actions
    {
      xtype: 'form',
      title: 'Reset User Tokens',
      frame: true,

      bodyStyle: {
        padding: '10px'
      },

      items: [
        {
          xtype: 'label',
          html: '<p>Reset will invalidate <b>ALL</b> existing user tokens and force new tokens to be created the next time accessed.</p>'
        }
      ],

      buttonAlign: 'left',
      buttons: [
        { text: 'Reset all user tokens', ui: 'danger', glyph: 'xf023@FontAwesome' /* fa-lock */ }
      ]
    }
  ]

});