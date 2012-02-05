package de.is24.nexus.yum.service.impl;

import java.util.LinkedHashSet;
import java.util.Set;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementWrapper;
import javax.xml.bind.annotation.XmlRootElement;


/**
 * Created by IntelliJ IDEA. User: MKrautz Date: 7/8/11 Time: 3:36 PM To change
 * this template use File | Settings | File Templates.
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "configuration")
public class XmlYumConfiguration {
  protected static final int DEFAULT_TIMEOUT_IN_SEC = 120;
  protected static final boolean DEFAULT_REPOSITORY_OF_REPOSITORY_VERSIONS = true;

  private int repositoryCreationTimeout = DEFAULT_TIMEOUT_IN_SEC;

  private boolean repositoryOfRepositoryVersionsActive = DEFAULT_REPOSITORY_OF_REPOSITORY_VERSIONS;

  @XmlElement(name = "aliasMapping")
  @XmlElementWrapper
  private Set<AliasMapping> aliasMappings = new LinkedHashSet<AliasMapping>();

  private boolean deleteProcessing;

  private long delayAfterDeletion;

  public XmlYumConfiguration() {
    super();
  }

  public XmlYumConfiguration(final XmlYumConfiguration other) {
    repositoryCreationTimeout = other.getRepositoryCreationTimeout();
    aliasMappings = other.getAliasMappings();
  }

  public int getRepositoryCreationTimeout() {
    return repositoryCreationTimeout;
  }

  public void setRepositoryCreationTimeout(int repositoryCreationTimeout) {
    this.repositoryCreationTimeout = repositoryCreationTimeout;
  }

  public Set<AliasMapping> getAliasMappings() {
    return aliasMappings;
  }

  public void setAliasMappings(Set<AliasMapping> aliasMappings) {
    this.aliasMappings = aliasMappings;
  }

  @Override
  public int hashCode() {
    final int prime = 31;
    int result = 1;
    result = (prime * result) +
      ((aliasMappings == null) ? 0 : aliasMappings.hashCode());
    result = (prime * result) + repositoryCreationTimeout;
    return result;
  }

  @Override
  public boolean equals(Object obj) {
    if (this == obj) {
      return true;
    }
    if (obj == null) {
      return false;
    }
    if (getClass() != obj.getClass()) {
      return false;
    }

    XmlYumConfiguration other = (XmlYumConfiguration) obj;
    if (aliasMappings == null) {
      if (other.aliasMappings != null) {
        return false;
      }
    } else if (!aliasMappings.equals(other.aliasMappings)) {
      return false;
    }
    if (repositoryCreationTimeout != other.repositoryCreationTimeout) {
      return false;
    }
    if (repositoryOfRepositoryVersionsActive != other.repositoryOfRepositoryVersionsActive) {
      return false;
    }
    return true;
  }

  @Override
  public String toString() {
    return "XmlYumConfiguration [repositoryCreationTimeout=" +
      repositoryCreationTimeout + ", aliasMappings=" +
      aliasMappings + "]";
  }

  public boolean isRepositoryOfRepositoryVersionsActive() {
    return repositoryOfRepositoryVersionsActive;
  }

  public void setRepositoryOfRepositoryVersionsActive(boolean repositoryOfRepositoryVersionsActive) {
    this.repositoryOfRepositoryVersionsActive = repositoryOfRepositoryVersionsActive;
  }

  public boolean isDeleteProcessing() {
    return deleteProcessing;
  }

  public void setDeleteProcessing(boolean deleteProcessing) {
    this.deleteProcessing = deleteProcessing;
  }

  public long getDelayAfterDeletion() {
    return delayAfterDeletion;
  }

  public void setDelayAfterDeletion(long delayAfterDeletion) {
    this.delayAfterDeletion = delayAfterDeletion;
  }

}
