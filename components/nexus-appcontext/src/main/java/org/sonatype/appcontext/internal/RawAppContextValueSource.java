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
package org.sonatype.appcontext.internal;

import org.codehaus.plexus.interpolation.AbstractValueSource;
import org.sonatype.appcontext.AppContext;
import org.sonatype.appcontext.AppContextEntry;

public class RawAppContextValueSource
    extends AbstractValueSource
{
    private final AppContext context;

    public RawAppContextValueSource( final AppContext context )
    {
        super( false );
        this.context = context;
    }

    public Object getValue( String expression )
    {
        final AppContextEntry entry = context.getAppContextEntry( expression );

        if ( entry != null )
        {
            return entry.getRawValue();
        }
        else
        {
            return null;
        }
    }
}