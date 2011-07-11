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
package org.sonatype.nexus.plugins.p2.repository.internal.tasks;

import javax.inject.Inject;
import javax.inject.Named;

import org.sonatype.nexus.plugins.p2.repository.P2MetadataGenerator;
import org.sonatype.nexus.scheduling.AbstractNexusRepositoriesPathAwareTask;
import org.sonatype.scheduling.SchedulerTask;

@Named( P2MetadataGeneratorTaskDescriptor.ID )
public class P2MetadataGeneratorTask
    extends AbstractNexusRepositoriesPathAwareTask<Object>
    implements SchedulerTask<Object>
{

    private final P2MetadataGenerator p2MetadataGenerator;

    @Inject
    P2MetadataGeneratorTask( final P2MetadataGenerator p2MetadataGenerator )
    {
        this.p2MetadataGenerator = p2MetadataGenerator;
    }

    @Override
    protected String getRepositoryFieldId()
    {
        return P2MetadataGeneratorTaskDescriptor.REPO_OR_GROUP_FIELD_ID;
    }

    @Override
    protected String getRepositoryPathFieldId()
    {
        return P2MetadataGeneratorTaskDescriptor.RESOURCE_STORE_PATH_FIELD_ID;
    }

    @Override
    protected String getAction()
    {
        return "REBUILD";
    }

    @Override
    protected String getMessage()
    {
        if ( getRepositoryId() != null )
        {
            return String.format( "Rebuild repository [%s] p2 metadata from path [%s] and bellow", getRepositoryId(),
                getResourceStorePath() );
        }
        else
        {
            return "Rebuild p2 metadata from all repositories (with a P2 Metadata Generator Capability enabled)";
        }
    }

    @Override
    protected Object doRun()
        throws Exception
    {
        final String repositoryId = getRepositoryId();
        if ( repositoryId != null )
        {
            p2MetadataGenerator.scanAndRebuild( repositoryId, getResourceStorePath() );
        }
        else
        {
            p2MetadataGenerator.scanAndRebuild( getResourceStorePath() );
        }

        return null;
    }

}
