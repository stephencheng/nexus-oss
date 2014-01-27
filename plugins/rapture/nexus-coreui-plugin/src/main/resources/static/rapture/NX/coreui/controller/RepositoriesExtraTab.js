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

// TODO remove this controller as is just an example on how to add an extra tab to a master detail
Ext.define('NX.coreui.controller.RepositoriesExtraTab', {
  extend: 'Ext.app.Controller',

  refs: [
    {
      ref: 'foo',
      selector: 'nx-repository-feature #foo'
    }
  ],

  init: function () {
    var me = this;

    me.listen({
      component: {
        'nx-repository-feature': {
          beforerender: me.addExtraTab
        },
        'nx-repository-list': {
          selection: me.onSelection
        }
      }
    });
  },

  addExtraTab: function (panel) {
    panel.addTab({
      xtype: 'panel',
      title: 'Extra Info',
      items: {
        xtype: 'label',
        itemId: 'foo',
        text: 'extra info'
      }
    });
  },

  onSelection: function (list, model) {
    if (model) {
      this.getFoo().setText('Extra info about ' + model.get('id'));
    }
  }

});