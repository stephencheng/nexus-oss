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
 * Tests bookmarking (navigate to divers parts and navigating back).
 *
 * @since 2.8
 */
StartTest(function (t) {

  var history = t.getExt().History;

  t.waitForStateReceived(function () {
    t.login();
    t.waitForUserToBeLoggedIn(function () {
      t.chain(
          { click: '>>nx-header-dashboard-mode' },
          { waitFor: 'CQVisible', args: 'nx-dashboard-feature' },
          { click: '>>nx-header-search-mode' },
          { waitFor: 'CQVisible', args: 'nx-search' },
          { click: '>>nx-header-admin-mode' },
          function (next) {
            t.navigateTo('admin/repository/repositories');
            next();
          },
          { waitFor: 'rowsVisible', args: 'nx-coreui-repository-list' },
          function (next) {
            var grid = t.cq1('nx-coreui-repository-list');

            grid.getSelectionModel().select(1);
            grid.getSelectionModel().select(2);

            next();
          },
          function (next) {
            t.navigateTo('admin/repository/targets');
            next();
          },
          { waitFor: 'rowsVisible', args: 'nx-coreui-repositorytarget-list' },
          t.do(history.back),
          { waitFor: 'rowsVisible', args: 'nx-coreui-repository-list' },
          function (next) {
            var grid = t.cq1('nx-coreui-repository-list'),
                selected;

            selected = grid.getSelectionModel().getSelection();
            t.is(grid.getStore().indexOf(selected) + 1, 3, 'Record 3 is selected');

            history.back();

            selected = grid.getSelectionModel().getSelection();
            t.is(grid.getStore().indexOf(selected) + 1, 1, 'Record 3 is selected');

            next();
          },
          t.do(history.back),
          t.do(history.back),
          { waitFor: 'CQVisible', args: 'nx-search' },
          t.do(history.back),
          { waitFor: 'CQVisible', args: 'nx-dashboard-feature' }
      );
    });
  });

});
