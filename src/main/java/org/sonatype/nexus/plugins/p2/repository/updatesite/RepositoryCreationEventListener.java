/**
 * Copyright (c) 2008-2011 Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://www.sonatype.com/products/nexus/attributions.
 *
 * This program is free software: you can redistribute it and/or modify it only under the terms of the GNU Affero General
 * Public License Version 3 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License Version 3
 * for more details.
 *
 * You should have received a copy of the GNU Affero General Public License Version 3 along with this program.  If not, see
 * http://www.gnu.org/licenses.
 *
 * Sonatype Nexus (TM) Open Source Version is available from Sonatype, Inc. Sonatype and Sonatype Nexus are trademarks of
 * Sonatype, Inc. Apache Maven is a trademark of the Apache Foundation. M2Eclipse is a trademark of the Eclipse Foundation.
 * All other trademarks are the property of their respective owners.
 */
package org.sonatype.nexus.plugins.p2.repository.updatesite;

import org.codehaus.plexus.component.annotations.Component;
import org.sonatype.nexus.proxy.events.EventInspector;
import org.sonatype.nexus.proxy.events.NexusStartedEvent;
import org.sonatype.nexus.proxy.events.RepositoryRegistryEventAdd;
import org.sonatype.nexus.proxy.repository.Repository;
import org.sonatype.plexus.appevents.Event;

@Component( role = EventInspector.class, hint = UpdateSiteRepository.ROLE_HINT )
public class RepositoryCreationEventListener
    implements EventInspector
{

    private boolean active;

    @Override
    public boolean accepts( final Event<?> evt )
    {
        active |= evt instanceof NexusStartedEvent;

        return active && evt instanceof RepositoryRegistryEventAdd;
    }

    @Override
    public void inspect( final Event<?> evt )
    {
        final Repository repository = ( (RepositoryRegistryEventAdd) evt ).getRepository();

        if ( repository instanceof UpdateSiteRepository )
        {
            repository.setExposed( false );
            ( (UpdateSiteRepository) repository ).mirror( true );
        }
    }

}
