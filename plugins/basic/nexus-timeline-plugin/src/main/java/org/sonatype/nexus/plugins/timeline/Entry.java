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

package org.sonatype.nexus.plugins.timeline;

import java.util.Collections;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.Maps;

/**
 * Timeline entry.
 */
public final class Entry
{
  private final long timestamp;

  private final String type;

  private final String subType;

  private final Map<String, String> data;

  @JsonCreator
  public Entry(@JsonProperty("timestamp") final long timestamp,
               @JsonProperty("type") final String type,
               @JsonProperty("subType") final String subType,
               @JsonProperty("data") final Map<String, String> data)
  {
    if (type == null || type.trim().length() == 0 || subType == null || subType.trim().length() == 0) {
      throw new IllegalArgumentException("Entry type or subType must not be blank/null");
    }
    this.timestamp = timestamp;
    this.type = type;
    this.subType = subType;
    final Map<String, String> tmp = Maps.newHashMap();
    if (data != null) {
      tmp.putAll(data);
    }
    this.data = Collections.unmodifiableMap(tmp);
  }

  public long getTimestamp() {
    return timestamp;
  }

  public String getType() {
    return type;
  }

  public String getSubType() {
    return subType;
  }

  public Map<String, String> getData() {
    return data;
  }

  @Override
  public String toString() {
    return "Entry{" +
        "timestamp=" + timestamp +
        ", type='" + type + '\'' +
        ", subType='" + subType + '\'' +
        ", data=" + data +
        '}';
  }
}
