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
package org.sonatype.nexus.plugins.p2.repository.its.meclipse0393;

import java.io.File;
import java.io.IOException;

import org.junit.Assert;
import org.junit.Test;
import org.sonatype.nexus.plugins.p2.repository.its.AbstractNexusProxyP2IT;
import org.sonatype.nexus.test.utils.TestProperties;

public class MECLIPSE0393P2ProxyCompositeWithMirrorIT
    extends AbstractNexusProxyP2IT
{
    public MECLIPSE0393P2ProxyCompositeWithMirrorIT()
    {
        super( "meclipse0393" );
    }

    @Override
    public void copyTestResources()
        throws IOException
    {
        super.copyTestResources();
        final String proxyRepoBaseUrl = TestProperties.getString( "proxy.repo.base.url" );

        replaceInFile( localStorageDir + "/meclipse0393/memberrepo1/artifacts.xml", "${proxy-repo-base-url}",
            proxyRepoBaseUrl );
        replaceInFile( localStorageDir + "/meclipse0393/memberrepo2/artifacts.xml", "${proxy-repo-base-url}",
            proxyRepoBaseUrl );

        replaceInFile( localStorageDir + "/meclipse0393/memberrepo1/mirrors.xml", "${proxy-repo-base-url}",
            proxyRepoBaseUrl );
        replaceInFile( localStorageDir + "/meclipse0393/memberrepo2/mirrors.xml", "${proxy-repo-base-url}",
            proxyRepoBaseUrl );
    }

    @Test
    public void test()
        throws Exception
    {
        final String nexusTestRepoUrl = getNexusTestRepoUrl();

        final File installDir = new File( "target/eclipse/meclipse0393" );

        installUsingP2( nexusTestRepoUrl, "com.sonatype.nexus.p2.its.feature.feature.group",
            installDir.getCanonicalPath() );

        final File feature = new File( installDir, "features/com.sonatype.nexus.p2.its.feature_1.0.0" );
        Assert.assertTrue( feature.exists() && feature.isDirectory() );

        final File bundle = new File( installDir, "plugins/com.sonatype.nexus.p2.its.bundle_1.0.0.jar" );
        Assert.assertTrue( bundle.canRead() );
    }
}
