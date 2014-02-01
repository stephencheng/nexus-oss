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
Ext.define('NX.view.feature.TEST', {
  extend: 'Ext.Panel',
  alias: 'widget.nx-feature-test',

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
    // default form
    {
      xtype: 'form',
      items: [
        {
          xtype: 'label',
          html: '<p>The quick brown fox jumps over the lazy dog.</p>'
        },
        {
          xtype: 'textfield',
          fieldLabel: 'Base URL',
          width: 500,
          emptyText: NX.util.Url.baseUrl
        },
        {
          xtype: 'checkbox',
          fieldLabel: 'Force base URL'
        }
      ],

      buttonAlign: 'left',
      buttons: [
        { text: 'Save', ui: 'primary' },
        { text: 'Cancel' }
      ]
    },

    // another form
    {
      xtype: 'form',
      title: 'Base Encryption Key Hash',
      frame: true,

      bodyStyle: {
        padding: '10px'
      },

      items: [
        {
          xtype: 'label',
          html: '<p>Recompute base encryption key hash will require all users passwords to need manual resetting in person.</p>' +
              '<p>You probably do not want to do this... you have been warned!</p>'
        }
      ],

      buttonAlign: 'left',
      buttons: [
        { text: 'Recompute base encryption key hash', ui: 'danger' }
      ]
    }
  ]

});