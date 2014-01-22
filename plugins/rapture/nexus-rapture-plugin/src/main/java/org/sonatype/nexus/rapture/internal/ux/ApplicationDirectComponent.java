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

package org.sonatype.nexus.rapture.internal.ux;

import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;
import javax.servlet.http.HttpSession;

import org.sonatype.nexus.ApplicationStatusSource;
import org.sonatype.nexus.SystemStatus;
import org.sonatype.nexus.extdirect.DirectComponentSupport;
import org.sonatype.security.SecuritySystem;
import org.sonatype.security.authorization.Privilege;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.softwarementors.extjs.djn.config.annotations.DirectAction;
import com.softwarementors.extjs.djn.config.annotations.DirectMethod;
import com.softwarementors.extjs.djn.config.annotations.DirectPollMethod;
import com.softwarementors.extjs.djn.servlet.ssm.WebContextManager;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.authz.Permission;
import org.apache.shiro.authz.permission.WildcardPermission;
import org.apache.shiro.codec.Base64;
import org.apache.shiro.subject.Subject;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * Application Ext.Direct component.
 *
 * @since 2.8
 */
@Named
@Singleton
@DirectAction(action = "Application")
public class ApplicationDirectComponent
    extends DirectComponentSupport
{

  private static final int NONE = 0;

  private static final int READ = 1;

  private static final int UPDATE = 2;

  private static final int DELETE = 4;

  private static final int CREATE = 8;

  public static final String PRIVILEGES = "privileges";

  private final ApplicationStatusSource applicationStatusSource;

  private final SecuritySystem securitySystem;

  @Inject
  public ApplicationDirectComponent(final ApplicationStatusSource applicationStatusSource,
                                    final SecuritySystem securitySystem)
  {
    this.applicationStatusSource = checkNotNull(applicationStatusSource);
    this.securitySystem = checkNotNull(securitySystem);
  }

  @DirectPollMethod
  public StatusXO status(final Map<String, String> parameters) {
    StatusXO statusXO = new StatusXO();

    statusXO.setInfo(getInfo());
    statusXO.setUser(getUser());

    List<CommandXO> commands = Lists.newArrayList();
    statusXO.setCommands(commands);
    CommandXO fetchPermissionsCommand = checkPermissions();
    if (fetchPermissionsCommand != null) {
      commands.add(fetchPermissionsCommand);
    }

    return statusXO;
  }

  @DirectMethod
  public void login(final String base64Username, final String base64Password) throws Exception {
    securitySystem.login(new UsernamePasswordToken(
        Base64.decodeToString(base64Username), Base64.decodeToString(base64Password))
    );
  }

  @DirectMethod
  public void logout() {
    Subject subject = securitySystem.getSubject();

    if (subject != null) {
      subject.logout();
    }

    HttpSession session = WebContextManager.get().getRequest().getSession(false);
    if (session != null) {
      session.invalidate();
    }
  }

  @DirectMethod
  public List<PermissionXO> readPermissions() {
    Subject subject = securitySystem.getSubject();
    if (subject != null && subject.isAuthenticated()) {
      Map<String, Integer> privileges = calculatePrivileges(subject);
      HttpSession session = WebContextManager.get().getRequest().getSession(false);
      if (session != null) {
        session.setAttribute(PRIVILEGES, privileges);
      }
      return asPermissions(privileges);
    }
    return null;
  }

  private InfoXO getInfo() {
    InfoXO infoXO = new InfoXO();
    SystemStatus status = applicationStatusSource.getSystemStatus();

    infoXO.setName(status.getAppName());
    infoXO.setEdition(status.getEditionShort());
    infoXO.setVersion(status.getVersion());

    return infoXO;
  }

  private UserXO getUser() {
    UserXO userXO = null;

    // TODO: only send back user if user info changed (based on hash)

    Subject subject = securitySystem.getSubject();
    if (subject != null && subject.isAuthenticated()) {
      userXO = new UserXO();
      Object principal = subject.getPrincipal();
      if (principal != null) {
        userXO.setId(principal.toString());
      }
      userXO.setHash(userXO.getId());
    }
    return userXO;
  }

  private CommandXO checkPermissions() {
    HttpSession session = WebContextManager.get().getRequest().getSession(false);
    if (session != null) {
      Subject subject = securitySystem.getSubject();
      if (subject != null && subject.isAuthenticated()) {
        Map<String, Integer> currentPrivileges = calculatePrivileges(subject);
        // TODO make teh diff based on a has not store the whole privileges map in session
        Map<String, Integer> privileges = (Map<String, Integer>) session.getAttribute(PRIVILEGES);
        if (privileges == null) {
          privileges = Maps.newHashMap();
        }
        if (!Maps.difference(privileges, currentPrivileges).areEqual()) {
          CommandXO command = new CommandXO();
          command.setType("fetchpermissions");
          return command;
        }
      }
    }
    return null;
  }

  private Map<String, Integer> calculatePrivileges(final Subject subject) {
    Map<String, Integer> privilegeMap = Maps.newHashMap();

    for (Privilege priv : securitySystem.listPrivileges()) {
      if (priv.getType().equals("method")) {
        String permission = priv.getPrivilegeProperty("permission");
        privilegeMap.put(permission, NONE);
      }
    }

    List<Permission> permissionList = Lists.newArrayList();
    List<String> permissionNameList = Lists.newArrayList();

    for (String privilegeKey : privilegeMap.keySet()) {
      permissionList.add(new WildcardPermission(privilegeKey + ":read"));
      permissionList.add(new WildcardPermission(privilegeKey + ":create"));
      permissionList.add(new WildcardPermission(privilegeKey + ":update"));
      permissionList.add(new WildcardPermission(privilegeKey + ":delete"));
      permissionNameList.add(privilegeKey + ":read");
      permissionNameList.add(privilegeKey + ":create");
      permissionNameList.add(privilegeKey + ":update");
      permissionNameList.add(privilegeKey + ":delete");
    }

    // get the privileges for this subject
    boolean[] boolResults = subject.isPermitted(permissionList);

    // put then in a map so we can access them easily
    Map<String, Boolean> resultMap = Maps.newHashMap();
    for (int ii = 0; ii < permissionList.size(); ii++) {
      String permissionName = permissionNameList.get(ii);
      boolean b = boolResults[ii];
      resultMap.put(permissionName, b);
    }

    // now loop through the original set and figure out the correct value
    for (Entry<String, Integer> priv : privilegeMap.entrySet()) {

      boolean readPriv = resultMap.get(priv.getKey() + ":read");
      boolean createPriv = resultMap.get(priv.getKey() + ":create");
      boolean updaetPriv = resultMap.get(priv.getKey() + ":update");
      boolean deletePriv = resultMap.get(priv.getKey() + ":delete");

      int perm = NONE;

      if (readPriv) {
        perm |= READ;
      }
      if (createPriv) {
        perm |= CREATE;
      }
      if (updaetPriv) {
        perm |= UPDATE;
      }
      if (deletePriv) {
        perm |= DELETE;
      }
      // now set the value
      priv.setValue(perm);
    }

    return privilegeMap;
  }

  private List<PermissionXO> asPermissions(final Map<String, Integer> privilegeMap) {
    List<PermissionXO> perms = Lists.newArrayList();

    for (Entry<String, Integer> entry : privilegeMap.entrySet()) {
      if (entry.getValue() > NONE) {
        PermissionXO permissionXO = new PermissionXO();
        permissionXO.setId(entry.getKey());
        permissionXO.setValue(entry.getValue());

        perms.add(permissionXO);
      }
    }

    return perms;
  }

}
