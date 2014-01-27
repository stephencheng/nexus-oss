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
Ext.define('NX.security.controller.Users', {
  extend: 'NX.controller.MasterDetail',

  name: 'user',

  stores: [
    'User'
  ],
  views: [
    'user.Feature',
    'user.List'
  ],
  refs: [
    {
      ref: 'list',
      selector: 'nx-user-list'
    },
    {
      ref: 'info',
      selector: 'nx-user-feature nx-info-panel'
    }
  ],
  icons: {
    'feature-users': {
      file: 'group.png',
      variants: ['x16', 'x32']
    }
  },
  features: {
    path: '/Security/Users',
    view: 'NX.security.view.user.Feature',
    bookmark: 'users',
    weight: 30,
    iconName: 'feature-users',
    visible: function () {
      return NX.util.Permissions.check('security:users', 'read');
    }
  },

  getDescription: function (model) {
    return model.get('firstName') + ' ' + model.get('lastName');
  },

  onSelection: function (list, model) {
    var me = this;

    if (Ext.isDefined(model)) {
      me.getInfo().showInfo({
        'Id': model.get('id'),
        'Realm': model.get('realm'),
        'First Name': model.get('firstName'),
        'Last Name': model.get('lastName'),
        'Email': model.get('email'),
        'Status': model.get('status')
      });
    }
  }

});