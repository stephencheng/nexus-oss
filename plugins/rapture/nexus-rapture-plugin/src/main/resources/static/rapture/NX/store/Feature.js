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
Ext.define('NX.store.Feature', {
  extend: 'Ext.data.TreeStore',
  model: 'NX.model.Feature',

  root: {
    expanded: true,
    text: 'Features',
    children: [
      {
        text: 'Dashboard',
        view: 'NX.view.dashboard.Feature',
        weight: 10,
        bookmark: 'dashboard',
        leaf: true
      },

      // HACK: Grouping example data
      {
        text: 'Settings',
        weight: 1000,
        bookmark: 'settings',
        leaf: false,
        children: [
          { text: 'SMTP', weight: 9, leaf: true },
          { text: 'HTTP Request', weight: 10, leaf: true },
          { text: 'Security', weight: 5, leaf: true },
          { text: 'Notifications', weight: 1, leaf: true },
        ]
      }
    ]
  },

  // FIXME: This is not ideal, causes removes to be missed etc.

  /**
   * @override
   */
  onNodeAdded: function(parent, node) {
    this.sort();
    this.callParent(arguments);
  },

  /**
   * @override
   */
  onBeforeSort: function() {
    console.log('here');
    this.sort({
      property: 'weight',
      direction: 'ASC'
    }, 'prepend', false);
    this.callParent();
  }
});
