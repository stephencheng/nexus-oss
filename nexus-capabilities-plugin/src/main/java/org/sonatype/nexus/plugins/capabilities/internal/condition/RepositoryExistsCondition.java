/**
 * Copyright (c) 2008-2011 Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions
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
package org.sonatype.nexus.plugins.capabilities.internal.condition;

import org.sonatype.nexus.eventbus.NexusEventBus;
import org.sonatype.nexus.plugins.capabilities.support.condition.RepositoryConditions;
import org.sonatype.nexus.proxy.events.RepositoryRegistryEventAdd;
import org.sonatype.nexus.proxy.events.RepositoryRegistryEventRemove;
import org.sonatype.nexus.proxy.registry.RepositoryRegistry;
import com.google.common.eventbus.Subscribe;

/**
 * A condition that is satisfied when a repository exists.
 *
 * @since 2.0
 */
public class RepositoryExistsCondition
    extends RepositoryConditionSupport
{

    public RepositoryExistsCondition( final NexusEventBus eventBus,
                                      final RepositoryRegistry repositoryRegistry,
                                      final RepositoryConditions.RepositoryId repositoryId )
    {
        super( eventBus, repositoryRegistry, repositoryId );
    }

    @Override
    @Subscribe
    public void handle( final RepositoryRegistryEventAdd event )
    {
        if ( sameRepositoryAs( event.getRepository().getId() ) )
        {
            setSatisfied( true );
        }
    }

    @Subscribe
    public void handle( final RepositoryRegistryEventRemove event )
    {
        if ( sameRepositoryAs( event.getRepository().getId() ) )
        {
            setSatisfied( false );
        }
    }

    @Override
    public String toString()
    {
        try
        {
            final String id = getRepositoryId();
            return String.format( "Repository '%s' exists", id );
        }
        catch ( Exception ignore )
        {
            return "Repository '(could not be evaluated)' exists";
        }
    }

    @Override
    public String explainSatisfied()
    {
        try
        {
            final String id = getRepositoryId();
            return String.format( "Repository '%s' exists", id );
        }
        catch ( Exception ignore )
        {
            return "Repository '(could not be evaluated)' exists";
        }
    }

    @Override
    public String explainUnsatisfied()
    {
        try
        {
            final String id = getRepositoryId();
            return String.format( "Repository '%s' does not exist", id );
        }
        catch ( Exception ignore )
        {
            return "Repository '(could not be evaluated)' does not exist";
        }
    }

}
