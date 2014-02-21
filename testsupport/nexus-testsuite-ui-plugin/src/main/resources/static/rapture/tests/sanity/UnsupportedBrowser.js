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
 * Tests unsupported browser is shown and ignore button works.
 *
 * @since 2.8
 */
StartTest(function (t) {

  t.waitForStateReceived(function () {
    t.chain(
        { waitFor: 'CQVisible', args: 'nx-main' },
        t.do(t.setState, 'browserSupported', false),
        function (next) {
          t.waitForControllerToExist('UnsupportedBrowser', next);
        },
        function (next) {
          t.waitForControllerToNotExist('Main', next);
        },
        { waitFor: 'CQVisible', args: 'button[action=continue]' },
        { click: '>>button[action=continue]' },
        { waitFor: 'CQVisible', args: 'nx-main' },
        function (next) {
          t.waitForControllerToNotExist('UnsupportedBrowser', next);
        },
        function (next) {
          t.waitForControllerToExist('Main', next);
        }
    );
  });

});
