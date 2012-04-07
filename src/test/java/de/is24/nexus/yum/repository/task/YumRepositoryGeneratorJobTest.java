package de.is24.nexus.yum.repository.task;

import static de.is24.nexus.yum.repository.utils.RepositoryTestUtils.PACKAGE_CACHE_DIR;
import static de.is24.nexus.yum.repository.utils.RepositoryTestUtils.REPODATA_DIR;
import static de.is24.nexus.yum.repository.utils.RepositoryTestUtils.RPM_BASE_FILE;
import static de.is24.nexus.yum.repository.utils.RepositoryTestUtils.TARGET_DIR;
import static de.is24.nexus.yum.repository.utils.RepositoryTestUtils.assertRepository;
import static org.apache.commons.io.FileUtils.deleteDirectory;

import java.io.File;
import java.util.concurrent.ExecutionException;

import org.codehaus.plexus.component.annotations.Requirement;
import org.junit.Assert;
import org.junit.Test;

import de.is24.nexus.yum.config.YumConfiguration;
import de.is24.nexus.yum.repository.AbstractSchedulerTest;


public class YumRepositoryGeneratorJobTest extends AbstractSchedulerTest {
  private static final File PATH_NOT_EXISTS = new File("/data/path/not/exists");
  private static final String SNAPSHOTS = "snapshots";
  private static final String VERSION = "2.2-2";
  private static final String BASE_URL = "http://localhost:8080/nexus/content/snapshots";
  private static final String BASE_VERSIONED_URL = "http://localhost:8080/nexus/service/local/yum/snapshots/" + VERSION;

  @Requirement
  private YumConfiguration yumConfig;

  @Override
  public void setUp() throws Exception {
    super.setUp();
    deleteDirectory(PACKAGE_CACHE_DIR);
    deleteDirectory(REPODATA_DIR);
    deleteDirectory(yumConfig.getBaseTempDir());
    yumConfig.setActive(true);
  }

  @Test
  public void shouldCreateRepo() throws Exception {
    executeJob(createTask(RPM_BASE_FILE, BASE_URL, TARGET_DIR, SNAPSHOTS));
    assertRepository(REPODATA_DIR, "default");

  }

  @Test
  public void shouldNotExecuteCreateRepoIfDeactivated() throws Exception {
    yumConfig.setActive(false);
    executeJob(createTask(RPM_BASE_FILE, BASE_URL, TARGET_DIR, SNAPSHOTS));
    Assert.assertFalse(REPODATA_DIR.exists());
  }

  @Test
  public void shouldFilterForSpecificVersion() throws Exception {
    executeJob(createTask(RPM_BASE_FILE, BASE_URL, TARGET_DIR,
        BASE_VERSIONED_URL, SNAPSHOTS,
        VERSION,
 null, true));
    assertRepository(REPODATA_DIR, "filtering");
  }

  @Test(expected = ExecutionException.class)
  public void shouldNotCreateRepoIfPathNotExists() throws Exception {
    executeJob(createTask(PATH_NOT_EXISTS, BASE_URL, TARGET_DIR, SNAPSHOTS));
  }

}
