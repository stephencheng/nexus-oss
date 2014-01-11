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
Ext.define('NX.view.masterdetail.Tabs', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.nx-masterdetail-tabs',

  title: 'Empty Selection',

  layout: 'card',
  region: 'south',
  split: true,
  collapsible: true,
  flex: 0.5,
  activeItem: 0,

  warningTpl: new Ext.XTemplate(
      '<div class="nx-masterdetail-warning">',
      '  <div>{icon}{text}</div>',
      '</div>',
      {
        compiled: true
      }
  ),

  initComponent: function () {
    var text = this.emptyText,
        content = this.items;

    if (!text) {
      text = 'Please select a ' + this.modelName + ' or create a new ' + this.modelName;
    }

    if (Ext.isArray(this.items) && this.items.length > 1) {
      content = {
        xtype: 'tabpanel',
        activeTab: 0,
        layoutOnTabChange: true,
        items: this.items
      }
    }

    this.items = [
      {
        xtype: 'panel',
        html: '<span class="nx-masterdetail-emptyselection-text">' + text + '</span>'
      },
      content
    ];

    this.description = this.title;

    this.callParent(arguments);
  },

  setDescription: function (description) {
    this.description = description;
    this.showTitle();
  },

  showWarning: function (message) {
    this.warning = message;
    this.showTitle();
  },

  clearWarning: function () {
    this.warning = undefined;
    this.showTitle();
  },

  showTitle: function () {
    var title = this.description;
    if (Ext.isDefined(this.warning)) {
      // TODO icon
      title += this.warningTpl.apply({
        text: this.warning
      });
    }
    this.setTitle(title);
  }

});
