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
Ext.define('NX.coreui.controller.Privileges', {
  extend: 'NX.controller.MasterDetail',

  list: 'nx-coreui-privilege-list',

  stores: [
    'Privilege'
  ],
  views: [
    'privilege.Feature',
    'privilege.List'
  ],
  refs: [
    {
      ref: 'list',
      selector: 'nx-coreui-privilege-list'
    },
    {
      ref: 'info',
      selector: 'nx-coreui-privilege-feature nx-info-panel'
    }
  ],
  icons: {
    'feature-security-privileges': {
      file: 'medal_gold_1.png',
      variants: ['x16', 'x32']
    },
    'privilege-default': {
      file: 'medal_gold_1.png',
      variants: ['x16', 'x32']
    }
  },
  features: {
    path: '/Security/Privileges',
    view: { xtype: 'nx-coreui-privilege-feature' },
    visible: function () {
      return NX.Permissions.check('security:privileges', 'read');
    }
  },
  permission: 'security:privileges',

  getDescription: function (model) {
    return model.get('name');
  },

  onSelection: function (list, model) {
    var me = this;

    if (Ext.isDefined(model)) {
      me.getInfo().showInfo({
        'Id': model.get('id'),
        'Name': model.get('name'),
        'Description': model.get('description')
      });
    }
  }

});