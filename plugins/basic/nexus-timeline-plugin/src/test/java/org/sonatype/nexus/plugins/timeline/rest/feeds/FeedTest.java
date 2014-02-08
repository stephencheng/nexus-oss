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

package org.sonatype.nexus.plugins.timeline.rest.feeds;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;

import org.sonatype.nexus.NexusAppTestSupport;
import org.sonatype.nexus.plugins.timeline.internal.guice.TimelineModule;
import org.sonatype.nexus.plugins.timeline.rest.feeds.sources.FeedSource;
import org.sonatype.plexus.rest.resource.PlexusResource;

import com.google.inject.Module;
import com.sun.syndication.feed.synd.SyndFeed;
import org.junit.Test;
import org.restlet.Context;
import org.restlet.data.Request;

import static org.hamcrest.MatcherAssert.*;
import static org.hamcrest.Matchers.*;

public class FeedTest
    extends NexusAppTestSupport
{
  @Override
  protected void customizeModules(final List<Module> modules) {
    modules.add(new TimelineModule());
  }

  /**
   * Unsure what this test actually tests, see inline comment?
   */
  @Test
  public void testFeedSources()
      throws Exception
  {
    // TODO: no other method to lookup a Map than going to deprecated container
    final Map<String, FeedSource> map = getContainer().lookupMap(FeedSource.class);

    final FeedPlexusResource feedResource = (FeedPlexusResource) lookup(PlexusResource.class,
        FeedPlexusResource.class.getName());

    // need to test the protected method, its a little hacky, but the problem i am trying to test has to do with
    // Plexus loading this class so subclassing to expose this method, sort of get around what i am trying to test.

    final Field feedField = AbstractFeedPlexusResource.class.getDeclaredField("feeds");
    feedField.setAccessible(true);
    final Map<String, FeedSource> feeds = (Map<String, FeedSource>) feedField.get(feedResource);

    assertThat(feeds, is(notNullValue()));

    final Method getFeedMethod =
        feedResource.getClass().getDeclaredMethod("getFeed", Context.class, Request.class, String.class,
            Integer.class, Integer.class, Map.class);

    final SyndFeed feed = (SyndFeed) getFeedMethod
        .invoke(feedResource, null, null, "brokenArtifacts", null, null, null);
    assertThat(feed, is(notNullValue()));
  }

}
