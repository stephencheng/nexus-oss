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
package org.sonatype.nexus.extdirect.internal;

import java.io.File;
import java.lang.annotation.Annotation;
import java.lang.reflect.InvocationTargetException;
import java.util.List;

import javax.annotation.Nullable;
import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;
import javax.servlet.ServletConfig;

import org.sonatype.configuration.validation.InvalidConfigurationException;
import org.sonatype.nexus.configuration.application.ApplicationConfiguration;
import org.sonatype.nexus.extdirect.DirectComponent;
import org.sonatype.nexus.extdirect.model.Response;

import com.google.common.base.Function;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.inject.Key;
import com.softwarementors.extjs.djn.api.RegisteredMethod;
import com.softwarementors.extjs.djn.config.ApiConfiguration;
import com.softwarementors.extjs.djn.router.dispatcher.Dispatcher;
import com.softwarementors.extjs.djn.servlet.DirectJNgineServlet;
import com.softwarementors.extjs.djn.servlet.ssm.SsmDispatcher;
import org.eclipse.sisu.BeanEntry;
import org.eclipse.sisu.inject.BeanLocator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static com.google.common.base.Preconditions.checkNotNull;
import static org.sonatype.nexus.extdirect.model.Responses.error;
import static org.sonatype.nexus.extdirect.model.Responses.invalid;
import static org.sonatype.nexus.extdirect.model.Responses.success;

/**
 * Ext.Direct Servlet.
 *
 * @since 2.8
 */
@Named
@Singleton
public class ExtDirectServlet
    extends DirectJNgineServlet
{

  private static final Logger log = LoggerFactory.getLogger(ExtDirectServlet.class);

  private final ApplicationConfiguration applicationConfiguration;

  private final BeanLocator beanLocator;

  @Inject
  public ExtDirectServlet(final ApplicationConfiguration applicationConfiguration,
                          final BeanLocator beanLocator)
  {
    this.applicationConfiguration = checkNotNull(applicationConfiguration);
    this.beanLocator = checkNotNull(beanLocator);
  }

  @Override
  protected List<ApiConfiguration> createApiConfigurationsFromServletConfigurationApi(
      final ServletConfig configuration)
  {
    Iterable<? extends BeanEntry<Annotation, DirectComponent>> entries = beanLocator
        .locate(Key.get(DirectComponent.class));
    List<Class<?>> apiClasses = Lists.newArrayList(
        Iterables.transform(entries, new Function<BeanEntry<Annotation, DirectComponent>, Class<?>>()
        {
          @Nullable
          @Override
          public Class<?> apply(final BeanEntry<Annotation, DirectComponent> input) {
            Class<DirectComponent> implementationClass = input.getImplementationClass();
            log.debug("Registering Ext.Direct component '{}'", implementationClass);
            return implementationClass;
          }
        })
    );
    File apiFile = new File(applicationConfiguration.getTemporaryDirectory(), "extdirect/api.js");
    return Lists.newArrayList(
        new ApiConfiguration(
            "nexus",
            apiFile.getName(),
            apiFile.getAbsolutePath(),
            "NX.direct.api",
            "NX.direct",
            apiClasses
        )
    );
  }

  @Override
  protected Dispatcher createDispatcher(final Class<? extends Dispatcher> cls) {
    return new SsmDispatcher()
    {
      @Override
      protected Object createInvokeInstanceForMethodWithDefaultConstructor(final RegisteredMethod method)
          throws Exception
      {
        log.debug(
            "Creating instance of action class '{}' mapped to '{}",
            method.getActionClass().getName(), method.getActionName()
        );
        Iterable<BeanEntry<Annotation, Object>> actionInstance = beanLocator.locate(
            Key.get((Class) method.getActionClass())
        );
        return actionInstance.iterator().next().getValue();
      }

      @Override
      protected Object invokeMethod(final RegisteredMethod method, final Object actionInstance,
                                    final Object[] parameters) throws Exception
      {
        try {
          return asResponse(super.invokeMethod(method, actionInstance, parameters));
        }
        catch (InvocationTargetException e) {
          return handleException(method, e.getTargetException());
        }
        catch (Throwable e) {
          return handleException(method, e);
        }
      }

      private Object handleException(final RegisteredMethod method, final Throwable e) {
        log.error("Failed to invoke action method {}", method.getFullJavaMethodName(), e);
        if (e instanceof InvalidConfigurationException) {
          return asResponse(invalid((InvalidConfigurationException) e));
        }
        return asResponse(error(e));
      }

      private Response asResponse(final Object result) {
        Response response;
        if (result == null) {
          response = success();
        }
        else {
          if (result instanceof Response) {
            response = (Response) result;
          }
          else {
            response = success(result);
          }
        }
        return response;
      }
    };
  }

}
