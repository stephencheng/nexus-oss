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
Ext.define('NX.ext.grid.IconColumn', {
  extend: 'Ext.grid.column.Column',
  alias: 'widget.iconcolumn',

  /**
   * @cfg {String} iconVariant
   */
  /**
   * @cfg {Number} iconHeight
   */
  /**
   * @cfg {Number} iconWidth
   */
  /**
   * @cfg {String} iconNamePrefix
   */

  /**
   * @override
   */
  defaultRenderer: function(value, meta, record) {
    var me = this,
        cls,
        height = me.iconHeight,
        width = me.iconWidth;

    cls = me.iconCls(value, meta, record);

    if (me.iconVariant) {
      switch (me.iconVariant) {
        case 'x16':
          height = width = 16;
          break;
        case 'x32':
          height = width = 32;
          break;
      }
    }

    var spec = {
      tag: 'img',
      src: Ext.BLANK_IMAGE_URL,
      cls: cls
    };
    if (height) {
      spec.height = height;
    }
    if (width) {
      spec.width = width;
    }

    return Ext.DomHelper.markup(spec);
  },

  /**
   * @protected
   */
  iconName: function(value, meta, record) {
    return value;
  },

  /**
   * @protected
   */
  iconCls: function(value, meta, record) {
    var me = this,
        cls = me.iconName(value, meta, record);

    if (me.iconNamePrefix) {
      cls = me.iconNamePrefix + cls;
    }
    if (me.iconVariant) {
      cls += '-' + me.iconVariant;
    }

    return 'nx-icon-' + cls;
  }
});