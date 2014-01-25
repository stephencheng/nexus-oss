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

  statics: {
    /**
     * Helper to get the iconCls for a named icon with optional variant.
     *
     * @public
     * @static
     */
    iconCls: function (name, variant) {
      var cls = 'nx-icon-' + name;
      if (variant) {
        cls += '-' + variant;
      }
      return cls;
    }
  },

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
      var img, style = me.buildIconStyle(record.data);
      me.logDebug('Adding style: ' + style);
      styles.push(style);

      // TODO: Background-load icons?  This may have issues due to web-resources being !cachable?
      //me.logDebug('Preloading: ' + record.data.url);
      //img = new Image();
      //img.src = record.data.url;
    });

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
    style += 'background: url(' + icon.url + ') no-repeat center center;';
    style += 'height: ' + icon.height + 'px;';
    style += 'width: ' + icon.width + 'px;';
    style += 'vertical-align: middle;';  // needed to get iconCls lined up in trees when height/width is set
    style += '}';

    // TODO: Consider adding *additional* plain style w/o height/width/etc on it?

    return style;
  },

  /**
   * Add new icons.
   *
   * @public
   * @param icons Array or object.
   */
  addIcons: function (icons) {
    var me = this;
    if (Ext.isArray(icons)) {
      Ext.Array.each(icons, function (icon) {
        me.addIcon(icon);
      });
    }
    else if (Ext.isObject(icons)) {
      Ext.Object.each(icons, function (key, value) {
        var copy = Ext.clone(value);
        copy.name = key;
        me.addIcon(copy);
      });
    }
    else {
      Ext.Error.raise('Expected arrary or object, found: ' + icons);
    }
  },

  /**
   * Add a new icon.
   *
   * @public
   */
  addIcon: function (icon) {
    var me = this;

    // If icon contains 'variants' field then create an icon for each variant
    if (Ext.isArray(icon.variants)) {
      var copy = Ext.clone(icon);
      delete copy.variants;
      Ext.each(icon.variants, function (variant) {
        copy.variant = variant;
        me.addIcon(copy);
      });
      return;
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

    icon.cls = NX.controller.Icon.iconCls(icon.name, icon.variant);
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
  }
});