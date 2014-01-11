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
Ext.define('NX.controller.MasterDetail', {
  extend: 'Ext.app.Controller',

  views: [
    'masterdetail.Panel',
    'masterdetail.Tabs'
  ],

  init: function () {
    this.control({
      'nx-masterdetail-panel': {
        selectionchange: this.showDetails
      }
    });
  },

  showDetails: function (masterDetail, selectedModels) {
    var detail = masterDetail.down('nx-masterdetail-tabs');
    if (Ext.isDefined(selectedModels) && selectedModels.length > 0) {
      detail.getLayout().setActiveItem(1);
    }
    else {
      detail.setTitle('Empty selection');
      detail.getLayout().setActiveItem(0);
    }
  }

});