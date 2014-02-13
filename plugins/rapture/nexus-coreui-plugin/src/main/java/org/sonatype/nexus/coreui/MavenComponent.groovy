/**
 * Copyright (c) 2008-2013 Sonatype, Inc.
 *
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/pro/attributions
 * Sonatype and Sonatype Nexus are trademarks of Sonatype, Inc. Apache Maven is a trademark of the Apache Foundation.
 * M2Eclipse is a trademark of the Eclipse Foundation. All other trademarks are the property of their respective owners.
 */

package org.sonatype.nexus.coreui

import com.softwarementors.extjs.djn.config.annotations.DirectAction
import com.softwarementors.extjs.djn.config.annotations.DirectFormPostMethod
import org.apache.commons.fileupload.FileItem
import org.apache.shiro.authz.annotation.RequiresAuthentication
import org.apache.shiro.authz.annotation.RequiresPermissions
import org.sonatype.nexus.extdirect.DirectComponent
import org.sonatype.nexus.extdirect.DirectComponentSupport

import javax.inject.Named
import javax.inject.Singleton

/**
 * Maven {@link DirectComponent}.
 *
 * @since 2.8
 */
@Named
@Singleton
@DirectAction(action = 'maven_Maven')
class MavenComponent
extends DirectComponentSupport
{

  @DirectFormPostMethod
  @RequiresAuthentication
  @RequiresPermissions('nexus:artifact:create')
  void upload(final Map<String, String> params, final Map<String, FileItem> artifacts) {
    log.debug('Params: {}', params)
    log.debug('Files: {}', artifacts)
  }

}
