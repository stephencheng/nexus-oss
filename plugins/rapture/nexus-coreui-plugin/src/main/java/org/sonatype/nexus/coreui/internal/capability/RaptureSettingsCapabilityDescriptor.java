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

package org.sonatype.nexus.coreui.internal.capability;

import java.util.List;
import java.util.Set;

import javax.inject.Named;
import javax.inject.Singleton;

import org.sonatype.nexus.capability.support.CapabilityDescriptorSupport;
import org.sonatype.nexus.formfields.CheckboxFormField;
import org.sonatype.nexus.formfields.FormField;
import org.sonatype.nexus.formfields.NumberTextFormField;
import org.sonatype.nexus.plugins.capabilities.CapabilityType;
import org.sonatype.nexus.plugins.capabilities.Tag;
import org.sonatype.nexus.plugins.capabilities.Taggable;
import org.sonatype.nexus.plugins.capabilities.Validator;
import org.sonatype.nexus.rapture.RaptureSettings;
import org.sonatype.sisu.goodies.i18n.I18N;
import org.sonatype.sisu.goodies.i18n.MessageBundle;

import com.google.common.collect.Lists;
import org.jetbrains.annotations.NonNls;

import static org.sonatype.nexus.plugins.capabilities.CapabilityType.capabilityType;
import static org.sonatype.nexus.plugins.capabilities.Tag.categoryTag;
import static org.sonatype.nexus.plugins.capabilities.Tag.tags;

/**
 * {@link RaptureSettingsCapability} descriptor.
 *
 * @since 2.8
 */
@Named(RaptureSettingsCapabilityDescriptor.TYPE_ID)
@Singleton
public class RaptureSettingsCapabilityDescriptor
    extends CapabilityDescriptorSupport
    implements Taggable
{
  @NonNls
  public static final String TYPE_ID = "rapture.settings";

  public static final CapabilityType TYPE = capabilityType(TYPE_ID);

  private static interface Messages
      extends MessageBundle
  {
    @DefaultMessage("Rapture Settings")
    String name();

    @DefaultMessage("Debug enabled")
    String debugEnabledLabel();

    @DefaultMessage("Enable developer debugging")
    String debugEnabledHelp();

    @DefaultMessage("Session timeout")
    String sessionTimeoutLabel();

    @DefaultMessage(
        "Period of inactivity before session is timing out (minutes). A value of 0 will mean that session never expires"
    )
    String sessionTimeoutHelp();
  }

  private static final Messages messages = I18N.create(Messages.class);

  private final List<FormField> formFields;

  public RaptureSettingsCapabilityDescriptor() {
    formFields = Lists.<FormField>newArrayList(
        new CheckboxFormField(
            RaptureSettingsCapabilityConfiguration.DEBUG_ENABLED,
            messages.debugEnabledLabel(),
            messages.debugEnabledHelp(),
            FormField.MANDATORY
        ).withInitialValue(RaptureSettings.DEFAULT_DEBUG_ENABLED),
        new NumberTextFormField(
            RaptureSettingsCapabilityConfiguration.SESSION_TIMEOUT,
            messages.sessionTimeoutLabel(),
            messages.sessionTimeoutHelp(),
            FormField.MANDATORY
        ).withInitialValue(RaptureSettings.DEFAULT_SESSION_TIMEOUT)
    );
  }

  @Override
  public CapabilityType type() {
    return TYPE;
  }

  @Override
  public String name() {
    return messages.name();
  }

  @Override
  public List<FormField> formFields() {
    return formFields;
  }

  @Override
  public Validator validator() {
    // Allow only one capability of this type
    return validators().capability().uniquePer(RaptureSettingsCapabilityDescriptor.TYPE);
  }

  @Override
  protected String renderAbout() throws Exception {
    return render(TYPE_ID + "-about.vm");
  }

  @Override
  public Set<Tag> getTags() {
    return tags(categoryTag("Security"));
  }

}
