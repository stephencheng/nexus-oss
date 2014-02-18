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

package org.sonatype.nexus.webapp;

import java.io.File;
import java.util.Map;
import java.util.ServiceLoader;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.sonatype.nexus.NxApplication;
import org.sonatype.nexus.bootstrap.ConfigurationBuilder;
import org.sonatype.nexus.bootstrap.ConfigurationHolder;
import org.sonatype.nexus.bootstrap.EnvironmentVariables;
import org.sonatype.nexus.guice.NexusModules.CoreModule;
import org.sonatype.nexus.log.LogManager;
import org.sonatype.nexus.util.LockFile;
import org.sonatype.nexus.util.file.DirSupport;

import com.google.common.base.Throwables;
import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.servlet.GuiceServletContextListener;
import org.codehaus.plexus.PlexusConstants;
import org.codehaus.plexus.PlexusContainer;
import org.codehaus.plexus.context.Context;
import org.eclipse.sisu.plexus.PlexusSpaceModule;
import org.eclipse.sisu.space.BeanScanning;
import org.eclipse.sisu.space.ClassSpace;
import org.eclipse.sisu.space.URLClassSpace;
import org.eclipse.sisu.wire.WireModule;
import org.osgi.framework.Constants;
import org.osgi.framework.launch.Framework;
import org.osgi.framework.launch.FrameworkFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static com.google.common.base.Preconditions.checkState;

/**
 * Web application bootstrap {@link ServletContextListener}.
 *
 * @since 2.8
 */
public class WebappBootstrap
    extends GuiceServletContextListener
{
  private static final Logger log = LoggerFactory.getLogger(WebappBootstrap.class);

  private LockFile lockFile;

  private Framework framework;

  private PlexusContainer container;

  private Injector injector;

  private NxApplication application;

  private LogManager logManager;

  @Override
  public void contextInitialized(final ServletContextEvent event) {
    log.info("Initializing");

    ServletContext context = event.getServletContext();

    try {
      // Use bootstrap configuration if it exists, else load it
      Map<String, String> properties = ConfigurationHolder.get();
      if (properties != null) {
        log.info("Using bootstrap launcher configuration");
      }
      else {
        log.info("Loading configuration for WAR deployment environment");

        // FIXME: This is what was done before, it seems completely wrong in WAR deployment since there is no bundle
        String baseDir = System.getProperty("bundleBasedir", context.getRealPath("/WEB-INF"));

        properties = new ConfigurationBuilder()
            .defaults()
            .set("bundleBasedir", new File(baseDir).getCanonicalPath())
            .properties("/nexus.properties", true)
            .properties("/nexus-test.properties", false)
            .custom(new EnvironmentVariables())
            .build();

        System.getProperties().putAll(properties);
        ConfigurationHolder.set(properties);
      }

      // Ensure required properties exist
      requireProperty(properties, "bundleBasedir");
      requireProperty(properties, "nexus-work");
      requireProperty(properties, "nexus-app");
      requireProperty(properties, "application-conf");
      requireProperty(properties, "security-xml-file");

      // lock the work directory
      File workDir = new File(properties.get("nexus-work")).getCanonicalFile();
      DirSupport.mkdir(workDir);
      lockFile = new LockFile(new File(workDir, "nexus.lock"));
      checkState(lockFile.lock(), "Nexus work directory already in use: %s", workDir);

      properties.put(Constants.FRAMEWORK_STORAGE, workDir + "/felix-cache");
      properties.put(Constants.FRAMEWORK_STORAGE_CLEAN, Constants.FRAMEWORK_STORAGE_CLEAN_ONFIRSTINIT);
      properties.put(Constants.FRAMEWORK_SYSTEMPACKAGES_EXTRA,
            "com.fasterxml.jackson.annotation,"
          + "com.fasterxml.jackson.core,"
          + "com.fasterxml.jackson.core.util,"
          + "com.fasterxml.jackson.databind,"
          + "com.fasterxml.jackson.databind.cfg,"
          + "com.fasterxml.jackson.databind.deser.std,"
          + "com.fasterxml.jackson.databind.introspect,"
          + "com.fasterxml.jackson.databind.jsonFormatVisitors,"
          + "com.fasterxml.jackson.databind.jsontype,"
          + "com.fasterxml.jackson.databind.jsontype.impl,"
          + "com.fasterxml.jackson.databind.module,"
          + "com.fasterxml.jackson.databind.node,"
          + "com.fasterxml.jackson.databind.ser.std,"
          + "com.fasterxml.jackson.databind.type,"
          + "com.fasterxml.jackson.databind.util,"
          + "com.google.common.base,"
          + "com.google.common.collect,"
          + "com.google.common.eventbus,"
          + "com.google.common.io,"
          + "com.google.common.primitives,"
          + "com.google.inject,"
          + "com.google.inject.assistedinject,"
          + "com.google.inject.binder,"
          + "com.google.inject.name,"
          + "com.google.inject.servlet,"
          + "com.google.inject.spi,"
          + "com.thoughtworks.xstream,"
          + "com.thoughtworks.xstream.annotations,"
          + "com.thoughtworks.xstream.converters,"
          + "com.thoughtworks.xstream.converters.basic,"
          + "com.thoughtworks.xstream.converters.collections,"
          + "com.thoughtworks.xstream.converters.reflection,"
          + "com.thoughtworks.xstream.core.util,"
          + "com.thoughtworks.xstream.io,"
          + "com.thoughtworks.xstream.io.xml,"
          + "com.thoughtworks.xstream.mapper,"
          + "com.yammer.metrics.annotation,"
          + "com.yammer.metrics.core,"
          + "com.yammer.metrics.reporting,"
//          + "groovy.io,"
//          + "groovy.json,"
//          + "groovy.lang,"
//          + "groovy.transform,"
          + "javax.annotation.security,"
          + "javax.enterprise.context,"
          + "javax.enterprise.context.spi,"
          + "javax.enterprise.event,"
          + "javax.enterprise.inject,"
          + "javax.enterprise.inject.spi,"
          + "javax.enterprise.util,"
          + "javax.inject,"
          + "javax.mail,"
          + "javax.mail.internet,"
          + "javax.mail.util,"
          + "javax.servlet,"
          + "javax.servlet.annotation,"
          + "javax.servlet.http,"
//          + "javax.ws.rs,"
//          + "javax.ws.rs.core,"
          + "org.apache.commons.collections,"
          + "org.apache.commons.io,"
          + "org.apache.commons.io.output,"
          + "org.apache.commons.lang,"
          + "org.apache.commons.lang.exception,"
          + "org.apache.commons.lang.time,"
          + "org.apache.http,"
          + "org.apache.http.auth,"
          + "org.apache.http.client,"
          + "org.apache.http.client.methods,"
          + "org.apache.http.conn,"
          + "org.apache.http.conn.scheme,"
          + "org.apache.http.conn.ssl,"
          + "org.apache.http.entity,"
          + "org.apache.http.impl.auth,"
          + "org.apache.http.impl.client,"
          + "org.apache.http.impl.conn,"
          + "org.apache.http.impl.cookie,"
          + "org.apache.http.message,"
          + "org.apache.http.params,"
          + "org.apache.http.protocol,"
//          + "org.apache.lucene.analysis,"
//          + "org.apache.lucene.analysis.standard,"
//          + "org.apache.lucene.document,"
//          + "org.apache.lucene.index,"
//          + "org.apache.lucene.queryParser,"
//          + "org.apache.lucene.search,"
//          + "org.apache.lucene.store,"
//          + "org.apache.lucene.util,"
//          + "org.apache.maven.archetype.catalog,"
          + "org.apache.maven.artifact.repository.metadata,"
          + "org.apache.maven.artifact.repository.metadata.io.xpp3,"
//          + "org.apache.maven.index,"
//          + "org.apache.maven.index.context,"
//          + "org.apache.maven.index.expr,"
          + "org.apache.maven.model,"
          + "org.apache.maven.model.io.xpp3,"
//          + "org.apache.maven.wagon,"
//          + "org.apache.maven.wagon.authentication,"
//          + "org.apache.maven.wagon.authorization,"
//          + "org.apache.maven.wagon.events,"
//          + "org.apache.maven.wagon.proxy,"
//          + "org.apache.maven.wagon.repository,"
//          + "org.apache.maven.wagon.shared.http,"
          + "org.apache.shiro,"
          + "org.apache.shiro.authc,"
          + "org.apache.shiro.authc.credential,"
          + "org.apache.shiro.authz,"
          + "org.apache.shiro.authz.annotation,"
          + "org.apache.shiro.authz.permission,"
          + "org.apache.shiro.codec,"
          + "org.apache.shiro.mgt,"
          + "org.apache.shiro.realm,"
          + "org.apache.shiro.realm.ldap,"
          + "org.apache.shiro.subject,"
          + "org.apache.shiro.util,"
          + "org.apache.shiro.web.filter.mgt,"
          + "org.apache.velocity,"
          + "org.apache.velocity.app,"
          + "org.apache.velocity.context,"
          + "org.apache.velocity.exception,"
          + "org.apache.velocity.runtime,"
          + "org.apache.velocity.runtime.resource,"
          + "org.apache.velocity.runtime.resource.loader,"
//          + "org.bouncycastle.jce.provider,"
//          + "org.bouncycastle.util.encoders,"
//          + "org.codehaus.enunciate.contract.jaxrs,"
//          + "org.codehaus.groovy.reflection,"
//          + "org.codehaus.groovy.runtime,"
//          + "org.codehaus.groovy.runtime.callsite,"
//          + "org.codehaus.groovy.runtime.powerassert,"
//          + "org.codehaus.groovy.runtime.typehandling,"
//          + "org.codehaus.groovy.runtime.wrappers,"
          + "org.codehaus.plexus,"
          + "org.codehaus.plexus.classworlds.realm,"
          + "org.codehaus.plexus.component.annotations,"
          + "org.codehaus.plexus.component.configurator,"
          + "org.codehaus.plexus.component.configurator.converters.composite,"
          + "org.codehaus.plexus.component.configurator.converters.lookup,"
          + "org.codehaus.plexus.component.configurator.expression,"
          + "org.codehaus.plexus.component.repository.exception,"
          + "org.codehaus.plexus.configuration,"
          + "org.codehaus.plexus.configuration.xml,"
          + "org.codehaus.plexus.context,"
          + "org.codehaus.plexus.interpolation,"
          + "org.codehaus.plexus.interpolation.util,"
          + "org.codehaus.plexus.logging,"
          + "org.codehaus.plexus.util,"
          + "org.codehaus.plexus.util.dag,"
          + "org.codehaus.plexus.util.io,"
          + "org.codehaus.plexus.util.xml,"
          + "org.codehaus.plexus.util.xml.pull,"
          + "org.eclipse.sisu,"
          + "org.eclipse.sisu.inject,"
          + "org.jsoup,"
          + "org.jsoup.nodes,"
          + "org.jsoup.select,"
//          + "org.restlet,"
//          + "org.restlet.data,"
//          + "org.restlet.resource,"
          + "org.slf4j,"
          + "org.sonatype.aether,"
          + "org.sonatype.aether.artifact,"
          + "org.sonatype.aether.collection,"
          + "org.sonatype.aether.deployment,"
          + "org.sonatype.aether.graph,"
          + "org.sonatype.aether.impl,"
          + "org.sonatype.aether.impl.internal,"
          + "org.sonatype.aether.installation,"
          + "org.sonatype.aether.metadata,"
          + "org.sonatype.aether.repository,"
          + "org.sonatype.aether.resolution,"
          + "org.sonatype.aether.spi.connector,"
          + "org.sonatype.aether.spi.io,"
          + "org.sonatype.aether.spi.locator,"
          + "org.sonatype.aether.spi.log,"
          + "org.sonatype.aether.transfer,"
          + "org.sonatype.aether.util,"
          + "org.sonatype.aether.util.artifact,"
          + "org.sonatype.aether.util.concurrency,"
          + "org.sonatype.aether.util.graph.manager,"
          + "org.sonatype.aether.util.graph.selector,"
          + "org.sonatype.aether.util.graph.transformer,"
          + "org.sonatype.aether.util.graph.traverser,"
          + "org.sonatype.aether.util.layout,"
          + "org.sonatype.aether.util.listener,"
          + "org.sonatype.aether.util.metadata,"
          + "org.sonatype.aether.util.repository,"
          + "org.sonatype.aether.util.version,"
          + "org.sonatype.aether.version,"
          + "org.sonatype.configuration,"
          + "org.sonatype.configuration.validation,"
          + "org.sonatype.micromailer,"
          + "org.sonatype.nexus,"
          + "org.sonatype.nexus.apachehttpclient,"
          + "org.sonatype.nexus.auth,"
          + "org.sonatype.nexus.configuration,"
          + "org.sonatype.nexus.configuration.application,"
          + "org.sonatype.nexus.configuration.model,"
          + "org.sonatype.nexus.configuration.model.io.xpp3,"
          + "org.sonatype.nexus.configuration.source,"
          + "org.sonatype.nexus.configuration.validator,"
          + "org.sonatype.nexus.email,"
          + "org.sonatype.nexus.events,"
          + "org.sonatype.nexus.formfields,"
          + "org.sonatype.nexus.guice,"
          + "org.sonatype.nexus.internal,"
          + "org.sonatype.nexus.log,"
          + "org.sonatype.nexus.maven.tasks,"
          + "org.sonatype.nexus.mime,"
          + "org.sonatype.nexus.notification,"
          + "org.sonatype.nexus.plugin,"
          + "org.sonatype.nexus.plugin.support,"
          + "org.sonatype.nexus.plugins,"
          + "org.sonatype.nexus.plugins.events,"
          + "org.sonatype.nexus.plugins.repository,"
          + "org.sonatype.nexus.proxy,"
          + "org.sonatype.nexus.proxy.access,"
          + "org.sonatype.nexus.proxy.attributes,"
          + "org.sonatype.nexus.proxy.attributes.inspectors,"
          + "org.sonatype.nexus.proxy.attributes.internal,"
          + "org.sonatype.nexus.proxy.cache,"
          + "org.sonatype.nexus.proxy.events,"
          + "org.sonatype.nexus.proxy.item,"
          + "org.sonatype.nexus.proxy.item.uid,"
          + "org.sonatype.nexus.proxy.mapping,"
          + "org.sonatype.nexus.proxy.maven,"
          + "org.sonatype.nexus.proxy.maven.gav,"
          + "org.sonatype.nexus.proxy.maven.maven2,"
          + "org.sonatype.nexus.proxy.maven.packaging,"
          + "org.sonatype.nexus.proxy.maven.routing,"
          + "org.sonatype.nexus.proxy.maven.uid,"
          + "org.sonatype.nexus.proxy.mirror,"
          + "org.sonatype.nexus.proxy.registry,"
          + "org.sonatype.nexus.proxy.repository,"
          + "org.sonatype.nexus.proxy.router,"
          + "org.sonatype.nexus.proxy.storage,"
          + "org.sonatype.nexus.proxy.storage.local,"
          + "org.sonatype.nexus.proxy.storage.local.fs,"
          + "org.sonatype.nexus.proxy.storage.remote,"
          + "org.sonatype.nexus.proxy.storage.remote.http,"
          + "org.sonatype.nexus.proxy.targets,"
          + "org.sonatype.nexus.proxy.utils,"
          + "org.sonatype.nexus.proxy.wastebasket,"
          + "org.sonatype.nexus.repositories.metadata,"
          + "org.sonatype.nexus.repository.metadata,"
          + "org.sonatype.nexus.repository.metadata.model,"
          + "org.sonatype.nexus.scheduling,"
          + "org.sonatype.nexus.scheduling.events,"
          + "org.sonatype.nexus.security.filter,"
          + "org.sonatype.nexus.security.filter.authc,"
          + "org.sonatype.nexus.security.filter.authz,"
          + "org.sonatype.nexus.tasks,"
          + "org.sonatype.nexus.tasks.descriptors,"
          + "org.sonatype.nexus.templates,"
          + "org.sonatype.nexus.templates.repository,"
          + "org.sonatype.nexus.templates.repository.maven,"
          + "org.sonatype.nexus.user,"
          + "org.sonatype.nexus.util,"
          + "org.sonatype.nexus.util.file,"
          + "org.sonatype.nexus.util.io,"
          + "org.sonatype.nexus.web,"
          + "org.sonatype.nexus.web.internal,"
          + "org.sonatype.plexus.components.cipher,"
//          + "org.sonatype.plexus.rest,"
//          + "org.sonatype.plexus.rest.resource,"
//          + "org.sonatype.plexus.rest.resource.error,"
//          + "org.sonatype.plexus.rest.xstream.json,"
          + "org.sonatype.plugin.metadata,"
          + "org.sonatype.plugins.model,"
          + "org.sonatype.scheduling,"
          + "org.sonatype.scheduling.iterators,"
          + "org.sonatype.scheduling.schedules,"
          + "org.sonatype.security,"
          + "org.sonatype.security.authentication,"
          + "org.sonatype.security.authorization,"
          + "org.sonatype.security.configuration.model,"
          + "org.sonatype.security.configuration.model.io.xpp3,"
          + "org.sonatype.security.configuration.source,"
          + "org.sonatype.security.model.io.xpp3,"
          + "org.sonatype.security.model.source,"
          + "org.sonatype.security.realms.privileges,"
          + "org.sonatype.security.realms.tools,"
          + "org.sonatype.security.usermanagement,"
          + "org.sonatype.security.web,"
          + "org.sonatype.sisu.goodies.common,"
          + "org.sonatype.sisu.goodies.common.io,"
//          + "org.sonatype.sisu.goodies.crypto,"
          + "org.sonatype.sisu.goodies.eventbus,"
          + "org.sonatype.sisu.goodies.i18n,"
          + "org.sonatype.sisu.goodies.inject.converter,"
          + "org.sonatype.sisu.goodies.template,"
//          + "org.sonatype.sisu.siesta.common,"
//          + "org.sonatype.sisu.siesta.common.error,"
//          + "org.sonatype.sisu.siesta.server,"
          + "org.xmlpull.mxp1,"
          + "org.xmlpull.v1"
      );

      // start the OSGi framework
//      framework = ServiceLoader.load(FrameworkFactory.class, Thread.currentThread().getContextClassLoader()).iterator().next().newFramework(properties);
//      log.debug("Framework: {}", framework);
//
//      framework.start();

      // create the injector
      ClassSpace space = new URLClassSpace(Thread.currentThread().getContextClassLoader());
      injector = Guice.createInjector(new WireModule(
          new CoreModule(context, properties),
          new PlexusSpaceModule(space, BeanScanning.INDEX)
      ));
      log.debug("Injector: {}", injector);
      
      container = injector.getInstance(PlexusContainer.class);
      context.setAttribute(PlexusConstants.PLEXUS_KEY, container);
      injector.getInstance(Context.class).put(PlexusConstants.PLEXUS_KEY, container);
      log.debug("Container: {}", container);

      // configure guice servlet (add injector to servlet context)
      super.contextInitialized(event);

      // configure logging
      logManager = container.lookup(LogManager.class);
      log.debug("Log manager: {}", logManager);
      logManager.configure();

      // start the application
      application = container.lookup(NxApplication.class);
      log.debug("Application: {}", application);
      application.start();
    }
    catch (Exception e) {
      log.error("Failed to initialize", e);
      throw Throwables.propagate(e);
    }

    log.info("Initialized");
  }

  private static void requireProperty(final Map<String, String> properties, final String name) {
    if (!properties.containsKey(name)) {
      throw new IllegalStateException("Missing required property: " + name);
    }
  }

  @Override
  public void contextDestroyed(final ServletContextEvent event) {
    log.info("Destroying");

    ServletContext context = event.getServletContext();

    // stop application
    if (application != null) {
      try {
        application.stop();
      }
      catch (Exception e) {
        log.error("Failed to stop application", e);
      }
      application = null;
    }

    // shutdown logging
    if (logManager != null) {
      logManager.shutdown();
      logManager = null;
    }

    // unset injector from context
    super.contextDestroyed(event);
    injector = null;

    // cleanup the container
    if (container != null) {
      container.dispose();
      context.removeAttribute(PlexusConstants.PLEXUS_KEY);
      container = null;
    }

    // stop the OSGi framework
//    if (framework != null) {
//      try {
//        framework.stop();
//      } catch (Exception e) {
//        log.error("Failed to stop framework", e);
//      }
//      framework = null;
//    }

    // release lock
    if (lockFile != null) {
      lockFile.release();
      lockFile = null;
    }

    log.info("Destroyed");
  }

  @Override
  protected Injector getInjector() {
    checkState(injector != null, "Missing injector reference");
    return injector;
  }
}
