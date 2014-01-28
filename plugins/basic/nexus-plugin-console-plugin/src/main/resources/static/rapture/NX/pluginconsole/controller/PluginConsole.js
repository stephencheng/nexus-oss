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
Ext.define('NX.pluginconsole.controller.PluginConsole', {
  extend: 'NX.controller.MasterDetail',
  requires: [
    'NX.util.Url',
    'NX.util.Permissions'
  ],

  list: 'nx-pluginconsole-list',

  stores: [
    'PluginInfo'
  ],
  views: [
    'Feature',
    'List'
  ],
  refs: [
    {
      ref: 'list',
      selector: 'nx-pluginconsole-list'
    },
    {
      ref: 'info',
      selector: 'nx-pluginconsole-feature nx-info-panel'
    }
  ],
  icons: {
    'feature-pluginconsole': {
      file: 'plugin.png',
      variants: ['x16', 'x32']
    }
  },
  features: {
    path: '/System/Plugins',
    view: { xtype: 'nx-pluginconsole-feature' },
    iconName: 'feature-pluginconsole',
    visible: function () {
      return NX.util.Permissions.check('nexus:pluginconsoleplugininfos', 'read');
    }
  },

  getDescription: function (model) {
    return model.get('name');
  },

  onSelection: function (list, model) {
    var me = this,
        info;

    if (Ext.isDefined(model)) {
      info = {
        'Name': model.get('name'),
        'Version': model.get('version'),
        'Status': model.get('status'),
        'Description': model.get('description'),
        'SCM Version': model.get('scmVersion'),
        'SCM Timestamp': model.get('scmTimestamp'),
        'Site': NX.util.Url.asLink(model.get('site'))
      };
      if (Ext.isDefined(model.get('documentation'))) {
        Ext.each(model.get('documentation'), function (doc) {
          if (!Ext.isEmpty(doc.url)) {
            info['Documentation'] = NX.util.Url.asLink(doc.url, doc.label);
          }
        });
      }
      me.getInfo().showInfo(info);
    }
  }

});