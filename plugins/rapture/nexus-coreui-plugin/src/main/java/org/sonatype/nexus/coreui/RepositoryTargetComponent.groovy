/**
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

package org.sonatype.nexus.coreui

import com.softwarementors.extjs.djn.config.annotations.DirectAction
import com.softwarementors.extjs.djn.config.annotations.DirectMethod
import org.apache.shiro.authz.annotation.RequiresAuthentication
import org.apache.shiro.authz.annotation.RequiresPermissions
import org.sonatype.nexus.configuration.application.NexusConfiguration
import org.sonatype.nexus.extdirect.DirectComponent
import org.sonatype.nexus.extdirect.DirectComponentSupport
import org.sonatype.nexus.proxy.registry.RepositoryTypeRegistry
import org.sonatype.nexus.proxy.targets.TargetRegistry

import javax.inject.Inject
import javax.inject.Named
import javax.inject.Singleton

/**
 * Repository Target {@link DirectComponent}.
 *
 * @since 2.8
 */
@Named
@Singleton
@DirectAction(action = 'RepositoryTarget')
class RepositoryTargetComponent
extends DirectComponentSupport
{
  @Inject
  TargetRegistry targetRegistry

  @Inject
  RepositoryTypeRegistry repositoryTypeRegistry

  @Inject
  NexusConfiguration nexusConfiguration

  /**
   * Retrieve a list of available repository targets.
   */
  @DirectMethod
  @RequiresPermissions('nexus:targets:read')
  List<RepositoryTargetXO> read() {
    return targetRegistry.repositoryTargets.collect { input ->
      def result = new RepositoryTargetXO(
          id: input.id,
          name: input.name,
          repositoryTypeId: input.contentClass.id,
          patterns: input.patternTexts
      )
      return result
    }
  }

  @DirectMethod
  @RequiresAuthentication
  @RequiresPermissions('nexus:targets:delete')
  void delete(final String id) {
    targetRegistry.removeRepositoryTarget(id)
    nexusConfiguration.saveConfiguration();
  }

}
