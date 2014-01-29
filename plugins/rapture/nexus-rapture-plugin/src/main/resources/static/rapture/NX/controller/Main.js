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
Ext.define('NX.controller.Main', {
  extend: 'Ext.app.Controller',
  mixins: {
    logAware: 'NX.LogAware'
  },

  views: [
    'Main',
    'header.Panel',
    'header.Branding',
    'header.Logo',
    'header.Version',
    'header.Refresh',
    'header.Help',
    'header.Login',
    'header.User',
    'dev.Panel',
    'message.Panel',
    'info.Entry',
    'info.Panel'
  ],

  refs: [
    {
      ref: 'headerVersion',
      selector: 'nx-header-version'
    }
  ],

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.getApplication().getIconController().addIcons({
      'nexus': {
        file: 'nexus.png',
        variants: ['x16', 'x32']
      },
      'sonatype': {
        file: 'sonatype.png',
        variants: ['x16', 'x32']
      },
      'refresh': {
        file: 'arrow_refresh.png',
        variants: ['x16', 'x32']
      },
      'help-support': {
        file: 'support.png',
        variants: ['x16', 'x32']
      },
      'help-manual': {
        file: 'book_picture.png',
        variants: ['x16', 'x32']
      },
      'user-settings': {
        file: 'setting_tools.png',
        variants: ['x16', 'x32']
      },
      'user-logout': {
        file: 'door_out.png',
        variants: ['x16', 'x32']
      }
    });

    me.listen({
      controller: {
        '#Status': {
          info: me.updateHeaderVersion
        }
      },
      component: {
        'nx-header-refresh': {
          click: me.refresh
        }
      }
    });
  },

  /**
   * @private
   */
  updateHeaderVersion: function (info) {
    var me = this;

    // FIXME: This can probably be replaced by NX.app.* preloaded data

    // Update the header-version with details from status
    me.getHeaderVersion().setText(info.edition + ' ' + info.version);
  },

  refresh: function () {
    var me = this,
        refreshables = Ext.ComponentQuery.query('panel[refreshable=true]');

    if (refreshables) {
      Ext.each(refreshables, function (refreshable) {
        refreshable.fireEvent('refresh', refreshable);
      });
    }

    NX.Messages.add({ text: 'Refreshed', type: 'default'});
  }

});