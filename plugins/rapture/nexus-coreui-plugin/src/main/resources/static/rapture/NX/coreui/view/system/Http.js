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
  alias: 'widget.nx-coreui-system-http',

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
      settingsForm: true,
      settingsFormTitle: 'HTTP system settings',
      api: {
        load: 'NX.direct.coreui_SystemHttp.read',
        update: 'NX.direct.coreui_SystemHttp.update'
      },
      items: [
        // request settings
        {
          xtype: 'label',
          html: '<p>HTTP request settings.</p>'
        },
        {
          xtype: 'textfield',
          name: 'userAgentCustomisation',
          fieldLabel: 'User-agent customization',
          width: 400
        },
        {
          xtype: 'textfield',
          name: 'urlParameters',
          fieldLabel: 'URL parameters',
          width: 400
        },
        {
          xtype: 'numberfield',
          name: 'timeout',
          fieldLabel: 'Timeout seconds'
        },
        {
          xtype: 'numberfield',
          name: 'retries',
          fieldLabel: 'Retry attempts'
        },

        {
          xtype: 'nx-optionalfieldset',
          title: 'HTTP Proxy',
          checkboxToggle: true,
          checkboxName: 'httpEnabled',
          items: [
            {
              xtype: 'label',
              html: '<p>HTTP proxy settings.</p>'
            },
            {
              xtype: 'textfield',
              name: 'httpHost',
              fieldLabel: 'Host',
              allowBlank: false
            },
            {
              xtype: 'numberfield',
              name: 'httpPort',
              fieldLabel: 'Port',
              minValue: 1,
              maxValue: 65535,
              allowDecimals: false
            },
            {
              xtype: 'nx-optionalfieldset',
              title: 'Authentication',
              checkboxToggle: true,
              checkboxName: 'httpAuthEnabled',
              collapsed: true,
              items: [
                {
                  xtype: 'textfield',
                  name: 'httpAuthUsername',
                  fieldLabel: 'Username',
                  allowBlank: false
                },
                {
                  xtype: 'textfield',
                  name: 'httpAuthPassword',
                  fieldLabel: 'Password',
                  inputType: 'password'
                },
                {
                  xtype: 'textfield',
                  name: 'httpAuthNtlmHost',
                  fieldLabel: 'NT LAN Host'
                },
                {
                  xtype: 'textfield',
                  name: 'httpAuthNtlmDomain',
                  fieldLabel: 'NT LAN Manager Domain'
                }
              ]
            },
            {
              xtype: 'nx-valueset',
              name: 'nonProxyHosts',
              fieldLabel: 'Non Proxy Hosts',
              emptyText: 'enter a hostname',
              width: 400,
              sorted: true
            }
          ]
        },

        {
          xtype: 'nx-optionalfieldset',
          title: 'HTTPS Proxy',
          checkboxToggle: true,
          checkboxName: 'httpsEnabled',
          collapsed: true,
          items: [
            {
              xtype: 'label',
              html: '<p>HTTPS proxy settings.</p>'
            },
            {
              xtype: 'textfield',
              name: 'httpsHost',
              fieldLabel: 'Host'
            },
            {
              xtype: 'numberfield',
              name: 'httpsPort',
              fieldLabel: 'Port',
              minValue: 1,
              maxValue: 65535,
              allowDecimals: false
            },
            {
              xtype: 'nx-optionalfieldset',
              title: 'Authentication',
              checkboxToggle: true,
              checkboxName: 'httpsAuthEnabled',
              collapsed: true,
              items: [
                {
                  xtype: 'textfield',
                  name: 'httpsAuthUsername',
                  fieldLabel: 'Username',
                  allowBlank: false
                },
                {
                  xtype: 'textfield',
                  name: 'httpsAuthPassword',
                  fieldLabel: 'Password',
                  inputType: 'password'
                },
                {
                  xtype: 'textfield',
                  name: 'httpsAuthNtlmHost',
                  fieldLabel: 'NT LAN Host'
                },
                {
                  xtype: 'textfield',
                  name: 'httpsAuthNtlmDomain',
                  fieldLabel: 'NT LAN Manager Domain'
                }
              ]
            }
          ]
        }
      ],

      buttonAlign: 'left',
      buttons: [
        { text: 'Save', action: 'savesettings', ui: 'primary', formBind: true },
        { text: 'Discard', action: 'discardsettings' }
      ]
    }
  ]

});