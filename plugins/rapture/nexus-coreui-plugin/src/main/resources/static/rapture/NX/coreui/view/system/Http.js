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
Ext.define('NX.coreui.view.system.Http', {
  extend: 'Ext.Panel',
  alias: 'widget.nx-coreui-system-Http',

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
    {
      xtype: 'form',
      items: [
        // request settings
        {
          xtype: 'label',
          html: '<p>HTTP request settings.</p>'
        },
        {
          xtype: 'textfield',
          fieldLabel: 'User-agent customization',
          width: 400
        },
        {
          xtype: 'textfield',
          fieldLabel: 'URL parameters',
          width: 400
        },
        {
          xtype: 'numberfield',
          fieldLabel: 'Timeout seconds'
        },
        {
          xtype: 'numberfield',
          fieldLabel: 'Retry attempts'
        },

        {
          xtype: 'fieldset',
          title: 'HTTP Proxy',
          checkboxToggle: true,
          collapsed: true,
          items: [
            {
              xtype: 'label',
              html: '<p>HTTP proxy settings.</p>'
            },
            {
              xtype: 'textfield',
              fieldLabel: 'Host'
            },
            {
              xtype: 'textfield',
              fieldLabel: 'Port'
            },
            {
              xtype: 'textfield',
              fieldLabel: 'Username'
            },
            {
              xtype: 'textfield',
              fieldLabel: 'Password',
              inputType: 'password'
            },
            {
              xtype: 'textfield',
              fieldLabel: 'Non-proxy hosts',
              width: 400
            }
          ]
        },

        {
          xtype: 'fieldset',
          title: 'HTTPS Proxy',
          checkboxToggle: true,
          collapsed: true,
          items: [
            {
              xtype: 'label',
              html: '<p>HTTPS proxy settings.</p>'
            },
            {
              xtype: 'textfield',
              fieldLabel: 'Host'
            },
            {
              xtype: 'textfield',
              fieldLabel: 'Port'
            },
            {
              xtype: 'textfield',
              fieldLabel: 'Username'
            },
            {
              xtype: 'textfield',
              fieldLabel: 'Password',
              inputType: 'password'
            },
            {
              xtype: 'textfield',
              fieldLabel: 'Non-proxy hosts',
              width: 400
            }
          ]
        }
      ],

      buttonAlign: 'left',
      buttons: [
        { text: 'Save', ui: 'primary' },
        { text: 'Discard' }
      ]
    }
  ]

});