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
/**
 * Header QuickSearch controller.
 * Reacts to QuickSearch events and triggers filtering on all active filterable grids
 * (grids that have a "gridfiltering" plugin).
 */
Ext.define('NX.controller.HeaderQuickSearch', {
  extend: 'Ext.app.Controller',
  mixins: {
    logAware: 'NX.LogAware'
  },

  /**
   * @override
   */
  init: function () {
    var me = this;

    me.listen({
      component: {
        'nx-header-panel nx-quicksearch': {
          search: me.filter,
          searchcleared: me.clearFilter
        }
      }
    });
  },

  /**
   * @private
   * Triggers filter on all active filterable grids.
   * @param quicksearch header QuickSearch
   * @param value filter value
   */
  filter: function (quicksearch, value) {
    var me = this,
        filterables = this.getFilterables();

    me.logDebug('Filter on "' + value + '"');

    if (filterables) {
      Ext.each(filterables, function (filterable) {
        filterable.filter(value);
      });
    }
  },

  /**
   * @private
   * Triggers clearFilter on all active filterable grids.
   */
  clearFilter: function () {
    var me = this,
        filterables = this.getFilterables();

    me.logDebug('Filter cleared');

    if (filterables) {
      Ext.each(filterables, function (filterable) {
        filterable.clearFilter(filterable);
      });
    }
  },

  /**
   * Finds all active filterable grids.
   * @returns {Ext.Component[]} active filterable grids
   */
  getFilterables: function () {
    return Ext.ComponentQuery.query('grid[filterable=true]');
  }

});