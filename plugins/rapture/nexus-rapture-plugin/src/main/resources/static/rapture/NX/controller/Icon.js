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
Ext.define('NX.controller.Icon', {
  extend: 'Ext.app.Controller',
  requires: [
    'Ext.Error',
    'Ext.util.CSS',
    'NX.util.Url'
  ],
  mixins: {
    logAware: 'NX.LogAware'
  },

  models: [
    'Icon'
  ],

  stores: [
    'Icon'
  ],

  /**
   * @private
   */
  stylesheet: undefined,

  /**
   * Generate and install stylesheet for icons when the applications is launching.
   *
   * @override
   */
  onLaunch: function () {
    var me = this,
        styles = [];

    me.logDebug('Building stylesheet');

    // build styles for each icon in store
    me.getIconStore().each(function (record) {
      var style = me.buildIconStyle(record.data);
      me.logDebug('Adding style: ' + style);
      styles.push(style);
    });

    // TODO: Background-load icons?

    // create the style sheet
    me.stylesheet = Ext.util.CSS.createStyleSheet(styles.join(' '));

    // NOTE: This has issues on IE 11, forced compat via X-UA-Compatible meta tag
    // NOTE: ... but may be better off rendering this server side?
  },

  /**
   * Build style for given icon.
   *
   * @private
   */
  buildIconStyle: function (icon) {
    var me = this,
        style;

    style = '.' + icon.cls + ' {';
    style += 'background-image: url(' + icon.url + ');';
    style += 'background-position: center center;';
    style += 'height: ' + icon.height + 'px;';
    style += 'width: ' + icon.width + 'px;';
    style += '}';

    return style;
  },

  /**
   * Add a new icon.
   *
   * @public
   */
  addIcon: function (icon) {
    var me = this;

    if (icon.ref) {
      me.resolveReference(icon);
    }
    me.configureIcon(icon);

    // complain if height/width are missing as this could cause the image not to display
    if (!icon.height) {
      me.logWarn('Icon missing height: ' + icon.css)
    }
    if (!icon.width) {
      me.logWarn('Icon missing width: ' + icon.css)
    }

    // TODO: complain if we are overwriting an icon

    me.getIconStore().add(icon);
  },

  /**
   * Find an icon by name with optional variant.
   *
   * @public
   */
  findIcon: function (name, variant) {
    var me = this,
        store = me.getIconStore(),
        recordId;

    recordId = store.findBy(function (record, id) {
      // find matching icon name
      if (name === record.get('name')) {
        // if icon has a variant match that too
        if (variant) {
          if (variant === record.get('variant')) {
            return true; // match
          }
        }
      }
      return false; // no match
    });

    if (recordId === -1) {
      return null;
    }
    return store.getAt(recordId);
  },

  /**
   * Resolve icon references.
   *
   * @private
   */
  resolveReference: function (icon) {
    var me = this,
        ref;

    // resolve icon references
    me.logDebug('Resolving reference: ' + icon.ref);
    ref = me.findIcon(icon.ref, icon.variant);
    if (ref === null) {
      Ext.Error.raise('Missing icon reference: ' + icon.ref);
    }

    // apply missing fields to this configuration
    Ext.applyIf(icon, ref.data);
  },

  /**
   * Apply basic icon configuration.
   *
   * @private
   */
  configureIcon: function (icon) {
    var me = this,
        cls,
        url;

    // automatically set size for known variants
    switch (icon.variant) {
      case 'x16':
        icon.height = icon.width = 16;
        break;
      case 'x32':
        icon.height = icon.width = 32;
        break;
    }

    // calculate image URL
    url = NX.util.Url.baseUrl + 'static/rapture/resources/icons/';
    if (icon.variant) {
      url += icon.variant + '/';
    }
    url += icon.file;
    icon.url = url;

    // calculate image css class name
    cls = 'nx-icon-' + icon.name.replace('_', '-');
    if (icon.variant) {
      cls += '-' + icon.variant;
    }
    icon.cls = cls;
  }
});