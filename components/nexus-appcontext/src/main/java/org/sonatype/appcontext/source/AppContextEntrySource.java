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
package org.sonatype.appcontext.source;

import java.util.HashMap;
import java.util.Map;

import org.sonatype.appcontext.AppContext;
import org.sonatype.appcontext.AppContextException;
import org.sonatype.appcontext.AppContextRequest;
import org.sonatype.appcontext.internal.Preconditions;

/**
 * Entry source that sources from supplied AppContext. This is not the same as setting AppContext parent!
 * 
 * @author cstamas
 */
public class AppContextEntrySource
    implements EntrySource, EntrySourceMarker
{
    private final AppContext context;

    /**
     * Constructs the AppContextEntrySource with supplied AppContext.
     * 
     * @param context
     * @throws NullPointerException when supplied context is null,
     */
    public AppContextEntrySource( final AppContext context )
    {
        this.context = Preconditions.checkNotNull( context );
    }

    public String getDescription()
    {
        return "appcontext(" + context.getId() + ")";
    }

    public EntrySourceMarker getEntrySourceMarker()
    {
        return this;
    }

    public Map<String, Object> getEntries( AppContextRequest request )
        throws AppContextException
    {
        final Map<String, Object> result = new HashMap<String, Object>( context.size() );

        for ( Map.Entry<String, Object> entry : context.entrySet() )
        {
            result.put( entry.getKey(), entry.getValue() );
        }

        return result;
    }
}