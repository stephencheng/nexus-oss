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
package org.sonatype.nexus.plugins.p2.repository.its.meclipse1299;

import java.io.File;
import java.net.URL;

import org.codehaus.plexus.util.FileUtils;
import org.junit.Assert;
import org.junit.Test;
import org.sonatype.nexus.plugins.p2.repository.its.AbstractNexusProxyP2IT;

public class MECLIPSE1299P2CompositeRepoMergeRulesIT
    extends AbstractNexusProxyP2IT
{
    public MECLIPSE1299P2CompositeRepoMergeRulesIT()
    {
        super( "meclipse1299" );
    }

    @Test
    public void test()
        throws Exception
    {
        final File artifactsXmlFile = new File( "target/downloads/meclipse1299/artifacts.xml" );
        Assert.assertFalse( artifactsXmlFile.exists() );

        downloadFile( new URL( getRepositoryUrl( getTestRepositoryId() ) + "/artifacts.xml" ),
            artifactsXmlFile.getAbsolutePath() );
        Assert.assertTrue( artifactsXmlFile.exists() );

        final String artifactsXmlContent = FileUtils.fileRead( artifactsXmlFile );
        Assert.assertTrue( artifactsXmlContent.contains( "<mappings size=\"5\">" ) );
        Assert.assertTrue( artifactsXmlContent.contains( "<rule output=\"${repoUrl}/plugins/${id}_${version}.jar\" filter=\"(&amp; (classifier=osgi.bundle))\" />" ) );
        Assert.assertTrue( artifactsXmlContent.contains( "<rule output=\"${repoUrl}/binary/${id}_${version}\" filter=\"(&amp; (classifier=binary))\" />" ) );
        Assert.assertTrue( artifactsXmlContent.contains( "<rule output=\"${repoUrl}/features/${id}_${version}.jar\" filter=\"(&amp; (classifier=org.eclipse.update.feature))\" />" ) );
        Assert.assertTrue( artifactsXmlContent.contains( "<rule output=\"foo.bar\" filter=\"(&amp; (classifier=foo))\" />" ) );
        Assert.assertTrue( artifactsXmlContent.contains( "<rule output=\"bar.foo\" filter=\"(&amp; (classifier=bar))\" />" ) );
    }
}
