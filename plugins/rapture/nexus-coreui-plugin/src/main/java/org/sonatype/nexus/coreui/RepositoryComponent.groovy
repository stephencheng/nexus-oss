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
import org.sonatype.nexus.proxy.ResourceStoreRequest
import org.sonatype.nexus.proxy.item.RepositoryItemUid
import org.sonatype.nexus.proxy.registry.RepositoryRegistry
import org.sonatype.nexus.proxy.registry.RepositoryTypeRegistry
import org.sonatype.nexus.proxy.repository.*
import org.sonatype.nexus.rest.RepositoryURLBuilder
import org.sonatype.nexus.templates.TemplateManager
import org.sonatype.nexus.templates.repository.DefaultRepositoryTemplateProvider
import org.sonatype.nexus.templates.repository.RepositoryTemplate

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
  RepositoryTypeRegistry repositoryTypeRegistry

  @Inject
  RepositoryURLBuilder repositoryURLBuilder

  @Inject
  TemplateManager templateManager

  @Inject
  NexusConfiguration nexusConfiguration

  @Inject
  DefaultRepositoryTemplateProvider repositoryTemplateProvider;

  private def typesToClass = [
      'proxy': ProxyRepository.class,
      'hosted': HostedRepository.class,
      'shadow': ShadowRepository.class,
      'group': GroupRepository.class
  ]

  /**
   * Retrieve a list of available repositories.
   */
  @DirectMethod
  @RequiresPermissions('nexus:repositories:read')
  List<RepositoryXO> read() {
    def templates = templates()
    return repositoryRegistry.repositories.collect { asRepositoryXO(it, templates) }
  }

  @DirectMethod
  @RequiresAuthentication
  @RequiresPermissions('nexus:repositories:create')
  RepositoryXO createGroup(final RepositoryGroupXO repositoryXO) {

    def template = templateManager.templates.getTemplateById(repositoryXO.template) as RepositoryTemplate

    template.getConfigurableRepository().with {
      it.id = repositoryXO.id
      it.name = repositoryXO.name
      it.exposed = repositoryXO.exposed
      it.localStatus = LocalStatus.IN_SERVICE
      return it
    }

    Repository created = template.create().with {
      ((GroupRepository) it).memberRepositoryIds = repositoryXO.memberRepositoryIds
      return it
    }

    nexusConfiguration.saveConfiguration()

    return asRepositoryXO(created, templates())
  }

  @DirectMethod
  @RequiresAuthentication
  @RequiresPermissions('nexus:repositories:update')
  RepositoryXO updateGroup(final RepositoryGroupXO repositoryXO) {
    if (repositoryXO.id) {
      GroupRepository updated = repositoryRegistry.getRepositoryWithFacet(repositoryXO.id, GroupRepository.class).with {
        it.name = repositoryXO.name
        it.exposed = repositoryXO.exposed
        it.memberRepositoryIds = repositoryXO.memberRepositoryIds
        return it
      }
      nexusConfiguration.saveConfiguration()
      return asRepositoryXO(updated, templates())
    }
    throw new IllegalArgumentException('Missing id for repository to be updated')
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
  List<ReferenceXO> filterBy(final String type, final String format) {
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
    if (format) {
      repositories = repositories.findResults {
        it.repositoryContentClass.id == format ? it : null
      }
    }
    repositories.collect {
      new ReferenceXO(
          id: it.id,
          name: it.name
      )
    }
  }

  /**
   * Retrieve a list of available content classes.
   */
  @DirectMethod
  @RequiresPermissions('nexus:componentscontentclasses:read')
  List<RepositoryFormatXO> formats() {
    repositoryTypeRegistry.contentClasses.collect {
      new RepositoryFormatXO(
          id: it.value.id,
          name: it.value.name
      )
    }
  }

  /**
   * Retrieve a list of available repository templates.
   */
  @DirectMethod
  @RequiresPermissions('nexus:componentsrepotypes:read')
  List<RepositoryTemplateXO> templates() {
    def providers = []
    def asProvider = { template, type ->
      new RepositoryTemplateXO(
          id: template.id,
          type: type,
          provider: template.repositoryProviderHint,
          providerName: template.description,
          format: template.contentClass.id,
          formatName: template.contentClass.name
      )
    }
    def types = typesToClass
    templateManager.templates.getTemplates(RepositoryTemplate.class).templatesList.each {
      def template = it as RepositoryTemplate
      types.each {
        if (template.targetFits(it.value)) {
          providers.add(asProvider(template, it.key))
        }
      }
    }
    return providers
  }

  def applyCommon = { xo, repository, templates ->
    xo.id = repository.id
    xo.name = repository.name
    xo.exposed = repository.exposed
    xo.type = typeOf(repository)
    xo.provider = repository.providerHint
    xo.providerName = providerOf(templates, xo.type, xo.provider)?.providerName
    xo.format = repository.repositoryContentClass.id
    xo.formatName = repository.repositoryContentClass.name
    xo.localStatus = repository.localStatus
    xo.url = repositoryURLBuilder.getExposedRepositoryContentUrl(repository)
  }

  def asRepositoryXO = { repo, templates ->
    def xo
    if (repo.repositoryKind.isFacetAvailable(ProxyRepository.class)) {
      def pxo = new RepositoryProxyXO()
      repo.adaptToFacet(ProxyRepository.class).with { proxy ->
        pxo.proxyMode = proxy.proxyMode
        proxy.getRemoteStatus(new ResourceStoreRequest(RepositoryItemUid.PATH_ROOT), false)?.with { remoteStatus ->
          pxo.remoteStatus = remoteStatus
          pxo.remoteStatusReason = remoteStatus.reason
        }
      }
      xo = pxo
    }
    else if (repo.repositoryKind.isFacetAvailable(GroupRepository.class)) {
      def gxo = new RepositoryGroupXO()
      repo.adaptToFacet(GroupRepository.class)?.with { group ->
        gxo.memberRepositoryIds = group.memberRepositoryIds
      }
      xo = gxo
    }
    else {
      xo = new RepositoryXO()
    }
    applyCommon(xo, repo, templates)
    return xo
  }

  def typeOf = { repository ->
    def kind = repository.repositoryKind
    if (kind.isFacetAvailable(ProxyRepository.class)) {
      return 'proxy'
    }
    else if (kind.isFacetAvailable(HostedRepository.class)) {
      return 'hosted'
    }
    else if (kind.isFacetAvailable(ShadowRepository.class)) {
      return 'virtual'
    }
    else if (kind.isFacetAvailable(GroupRepository.class)) {
      return 'group'
    }
    return null
  }

  def providerOf = { templates, type, provider ->
    templates.find { template -> template.type == type && template.provider == provider }
  }


}
