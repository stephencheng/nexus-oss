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
 * A bookmark.
 *
 * @since 2.8
 */
Ext.define('NX.Bookmark', {

  statics: {
    /**
     * @public
     * Creates a new bookmark.
     * @param [{String}] token bookmark token
     * @returns {NX.Bookmark} created bookmark
     */
    fromToken: function (token) {
      return Ext.create('NX.Bookmark', { token: token });
    },
    /**
     * @public
     * Creates a new bookmark from provided segments.
     * @param {String[]} segments bookmark segments
     * @returns {NX.Bookmark} created bookmark
     */
    fromSegments: function (segments) {
      if (!Ext.isDefined(segments)) {
        throw Ext.Error.raise('Bookmarks segments cannot be undefined');
      }
      if (!Ext.isArray(segments)) {
        segments = [segments];
      }
      return Ext.create('NX.Bookmark', { token: segments.join(':') });
    },
    /**
     * Encodes the value suitable to be used as a bookmark token.
     * (eliminate spaces and lower case)
     * @param value to be encoded
     * @returns {String} encoded value
     */
    encode: function (value) {
      if (!Ext.isString(value)) {
        throw Ext.Error.raise('Value to be encoded must be a String');
      }
      return value.toLowerCase().replace(' ', '');
    }
  },

  config: {
    token: undefined
  },

  /**
   * @private
   */
  segments: undefined,

  constructor: function (config) {
    var me = this;
    me.initConfig(config);
  },

  /**
   * @private
   * Validates token to be a String and calculates segments.
   * @param token to apply
   * @returns {String} token
   */
  applyToken: function (token) {
    var me = this;
    if (token && !Ext.isString(token)) {
      throw Ext.Error.raise('Invalid token');
    }
    if (!token) {
      token = '';
    }
    me.segments = token.split(':');
    return token;
  },

  /**
   * @public
   * @param {int} index of segment
   * @returns {String} segment at index if defined
   */
  getSegment: function (index) {
    var me = this;

    return me.segments[index];
  },

  /**
   * Appends a segment to current segment.
   * @param {String/String[]} segments to append
   * @returns {NX.Bookmark} itself
   */
  appendSegments: function (segments) {
    var me = this;

    if (!segments) {
      throw Ext.Error.raise('Invalid segment: ' + segment);
    }
    if (!Ext.isArray(segments)) {
      segments = [segments];
    }
    Ext.each(segments, function (segment) {
      if (!segment || !Ext.isString(segment)) {
        throw Ext.Error.raise('Invalid segment: ' + segment);
      }
      me.segments.push(segment);
    });

    me.setToken(me.segments.join(':'));

    return me;
  }

});
