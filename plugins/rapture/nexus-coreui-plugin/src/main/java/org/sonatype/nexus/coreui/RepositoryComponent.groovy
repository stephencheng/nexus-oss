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
import org.sonatype.nexus.extdirect.DirectComponent
import org.sonatype.nexus.extdirect.DirectComponentSupport
import org.sonatype.nexus.proxy.ResourceStoreRequest
import org.sonatype.nexus.proxy.item.RepositoryItemUid
import org.sonatype.nexus.proxy.maven.MavenGroupRepository
import org.sonatype.nexus.proxy.maven.MavenHostedRepository
import org.sonatype.nexus.proxy.maven.MavenProxyRepository
import org.sonatype.nexus.proxy.maven.MavenRepository
import org.sonatype.nexus.proxy.maven.MavenShadowRepository
import org.sonatype.nexus.proxy.registry.RepositoryRegistry
import org.sonatype.nexus.proxy.repository.*
import org.sonatype.nexus.rest.RepositoryURLBuilder

import javax.inject.Inject
import javax.inject.Named
import javax.inject.Singleton

/**
 * Repository {@link DirectComponent}.
 *
 * @since 2.8
 */
@Named
@Singleton
@DirectAction(action = 'coreui_Repository')
class RepositoryComponent
extends DirectComponentSupport
{
  @Inject
  RepositoryRegistry repositoryRegistry

  @Inject
  RepositoryURLBuilder repositoryURLBuilder

  private def typesToClass = [
      'proxy': ProxyRepository.class,
      'hosted': HostedRepository.class,
      'shadow': ShadowRepository.class,
      'group': GroupRepository.class,
      'maven': MavenRepository.class,
      'proxy+maven': MavenProxyRepository.class,
      'hosted+maven': MavenHostedRepository.class,
      'shadow+maven': MavenShadowRepository.class,
      'group+maven': MavenGroupRepository.class
  ]

  /**
   * Retrieve a list of available repositories.
   */
  @DirectMethod
  @RequiresPermissions('nexus:repositories:read')
  List<RepositoryXO> read() {
    return repositoryRegistry.repositories.collect { input ->
      def result = new RepositoryXO(
          id: input.id,
          name: input.name,
          type: typeOf(input),
          format: input.providerHint,
          localStatus: input.localStatus,
          url: repositoryURLBuilder.getExposedRepositoryContentUrl(input)
      )

      // add additional details if repo is a proxy
      input.adaptToFacet(ProxyRepository.class)?.with { proxy ->
        result.proxyMode = proxy.proxyMode

        def remoteStatus = proxy.getRemoteStatus(new ResourceStoreRequest(RepositoryItemUid.PATH_ROOT), false)
        result.remoteStatus = remoteStatus
        result.remoteStatusReason = remoteStatus.reason
      }

      return result
    }
  }

  @DirectMethod
  @RequiresAuthentication
  @RequiresPermissions('nexus:repositories:delete')
  void delete(final String id) {
    repositoryRegistry.removeRepository(id)
  }

  /**
   * Retrieve a list of available repositories by specified type.
   */
  @DirectMethod
  @RequiresPermissions('nexus:repositories:read')
  List<ReferenceXO> getByType(final String type) {
    def List<Repository> repositories
    if (type) {
      def clazz = typesToClass[type]
      if (!clazz) {
        throw new IllegalArgumentException('Repository type not supported: ' + type)
      }
      repositories = repositoryRegistry.getRepositoriesWithFacet(clazz)
    }
    else {
      repositories = repositoryRegistry.repositories;
    }
    return repositories.collect { input ->
      new ReferenceXO(
          id: input.id,
          name: input.name
      )
    }
  }

  private static String typeOf(final Repository repository) {
    def kind = repository.repositoryKind
    if (kind.isFacetAvailable(ProxyRepository.class)) {
      return 'Proxy'
    }
    else if (kind.isFacetAvailable(HostedRepository.class)) {
      return 'Hosted'
    }
    else if (kind.isFacetAvailable(ShadowRepository.class)) {
      return 'Virtual'
    }
    else if (kind.isFacetAvailable(GroupRepository.class)) {
      return 'Group'
    }
    return null
  }

}
