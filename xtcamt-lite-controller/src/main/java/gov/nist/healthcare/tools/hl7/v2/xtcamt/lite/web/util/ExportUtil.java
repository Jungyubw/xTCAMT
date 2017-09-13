package gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.web.util;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.security.SecureRandom;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import org.apache.commons.io.IOUtils;
import org.json.JSONArray;
import org.json.JSONObject;

import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Code;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Component;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Datatype;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.DocumentMetaData;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Group;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.IGDocument;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Message;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Messages;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Segment;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.SegmentRef;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.SegmentRefOrGroup;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Table;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.ValueSetOrSingleCodeBinding;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.xml.serialization.XMLExportTool;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.TestCase;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.TestCaseGroup;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.TestCaseOrGroup;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.TestPlan;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.TestStep;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.TestStoryConfiguration;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.TestStroyEntry;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.Profile;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.ProfileService;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.TestStoryConfigurationService;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.impl.IGAMTDBConn;

public class ExportUtil {

  public static String str(String value) {
    return value != null ? value : "";
  }

  public InputStream exportTestPackageAsHtml(TestPlan tp,
      TestStoryConfigurationService testStoryConfigurationService) throws Exception {
    return IOUtils.toInputStream(this.genPackagePages(tp, testStoryConfigurationService), "UTF-8");
  }

  public InputStream exportCoverAsHtml(TestPlan tp) throws Exception {
    return IOUtils.toInputStream(this.genCoverPage(tp), "UTF-8");
  }

  private String genPackagePagesInsideGroup(TestPlan tp, TestCaseGroup group,
      String packageBodyHTML, String index,
      TestStoryConfigurationService testStoryConfigurationService) throws Exception {
    packageBodyHTML = packageBodyHTML + "<A NAME=\"" + index + "\">" + "<h2>" + index + ". "
        + group.getName() + "</h2>" + System.getProperty("line.separator");
    packageBodyHTML = packageBodyHTML + "<span>" + group.getDescription() + "</span>"
        + System.getProperty("line.separator");
    packageBodyHTML =
        packageBodyHTML + "<h3>" + "Test Story" + "</h3>" + System.getProperty("line.separator");
    String testStoryConfigId = null;
    if (group.getTestStoryConfigId() != null) {
      testStoryConfigId = group.getTestStoryConfigId();
    } else {
      testStoryConfigId = tp.getGlobalTestGroupConfigId();
    }

    TestStoryConfiguration testStoryConfiguration = null;
    if (testStoryConfigId != null) {
      testStoryConfiguration = testStoryConfigurationService.findById(testStoryConfigId);
    }

    if (testStoryConfiguration == null) {
      testStoryConfiguration = testStoryConfigurationService.findByAccountId((long) 0).get(0);
    }

    packageBodyHTML = packageBodyHTML + this.retrieveBodyContent(
        this.generateTestStory(group.getTestStoryContent(), testStoryConfiguration, "plain", tp));
    packageBodyHTML = packageBodyHTML + "<p style=\"page-break-after:always;\"></p>";

    for (int i = 0; i < group.getChildren().size(); i++) {
      TestCaseOrGroup child = group.getChildren().get(i);
      if (child instanceof TestCaseGroup) {
        packageBodyHTML = genPackagePagesInsideGroup(tp, (TestCaseGroup) child, packageBodyHTML,
            index + "." + (i + 1), testStoryConfigurationService);
      } else if (child instanceof TestCase) {
        packageBodyHTML = genPackagePagesForTestCase(tp, (TestCase) child, packageBodyHTML,
            index + "." + (i + 1), testStoryConfigurationService);

      }
    }

    return packageBodyHTML;
  }

  private String genPackagePagesForTestCase(TestPlan tp, TestCase tc, String packageBodyHTML,
      String index, TestStoryConfigurationService testStoryConfigurationService) throws Exception {
    packageBodyHTML = packageBodyHTML + "<A NAME=\"" + index + "\">" + "<h2>" + index + ". "
        + tc.getName() + "</h2>" + System.getProperty("line.separator");
    packageBodyHTML = packageBodyHTML + "<span>" + tc.getDescription() + "</span>"
        + System.getProperty("line.separator");
    packageBodyHTML =
        packageBodyHTML + "<h3>" + "Test Story" + "</h3>" + System.getProperty("line.separator");
    String testStoryConfigId = null;
    if (tc.getTestStoryConfigId() != null) {
      testStoryConfigId = tc.getTestStoryConfigId();
    } else {
      testStoryConfigId = tp.getGlobalTestCaseConfigId();
    }

    TestStoryConfiguration testStoryConfiguration = null;
    if (testStoryConfigId != null) {
      testStoryConfiguration = testStoryConfigurationService.findById(testStoryConfigId);
    }

    if (testStoryConfiguration == null) {
      testStoryConfiguration = testStoryConfigurationService.findByAccountId((long) 0).get(0);
    }

    packageBodyHTML = packageBodyHTML + this.retrieveBodyContent(
        this.generateTestStory(tc.getTestStoryContent(), testStoryConfiguration, "plain", tp));
    packageBodyHTML = packageBodyHTML + "<p style=\"page-break-after:always;\"></p>";

    for (int i = 0; i < tc.getTeststeps().size(); i++) {
      TestStep child = tc.getTeststeps().get(i);
      packageBodyHTML = genPackagePagesForTestStep(tp, child, packageBodyHTML,
          index + "." + (i + 1), testStoryConfigurationService);
    }

    return packageBodyHTML;
  }

  private String genPackagePagesForTestStep(TestPlan tp, TestStep ts, String packageBodyHTML,
      String index, TestStoryConfigurationService testStoryConfigurationService) throws Exception {
    ClassLoader classLoader = getClass().getClassLoader();
    packageBodyHTML = packageBodyHTML + "<A NAME=\"" + index + "\">" + "<h2>" + index + ". "
        + ts.getName() + "</h2>" + System.getProperty("line.separator");
    if (tp.getType() != null && tp.getType().equals("Isolated")) {
      packageBodyHTML = packageBodyHTML + "<span>Test Step Type: " + ts.getType() + "</span><br/>"
          + System.getProperty("line.separator");
    }
    packageBodyHTML = packageBodyHTML + "<span>" + ts.getDescription() + "</span>"
        + System.getProperty("line.separator");
    packageBodyHTML =
        packageBodyHTML + "<h3>" + "Test Story" + "</h3>" + System.getProperty("line.separator");

    String testStoryConfigId = null;
    if (ts.getTestStoryConfigId() != null) {
      testStoryConfigId = ts.getTestStoryConfigId();
    } else {
      if (ts.isManualTS()) {
        testStoryConfigId = tp.getGlobalManualTestStepConfigId();
      } else {
        testStoryConfigId = tp.getGlobalAutoTestStepConfigId();
      }
    }
    TestStoryConfiguration testStoryConfiguration = null;
    if (testStoryConfigId != null) {
      testStoryConfiguration = testStoryConfigurationService.findById(testStoryConfigId);
    }

    if (testStoryConfiguration == null) {
      testStoryConfiguration = testStoryConfigurationService.findByAccountId((long) 0).get(0);
    }
    packageBodyHTML = packageBodyHTML + this.retrieveBodyContent(
        this.generateTestStory(ts.getTestStoryContent(), testStoryConfiguration, "plain", tp));

    if (ts != null && ts.getEr7Message() != null && ts.getIntegrationProfileId() != null) {
      if (ts.getMessageContentsXMLCode() != null && !ts.getMessageContentsXMLCode().equals("")) {
        String mcXSL = IOUtils
            .toString(
                classLoader.getResourceAsStream("xsl" + File.separator + "MessageContents.xsl"))
            .replaceAll("<xsl:param name=\"output\" select=\"'ng-tab-html'\"/>",
                "<xsl:param name=\"output\" select=\"'plain-html'\"/>");
        InputStream xsltInputStream = new ByteArrayInputStream(mcXSL.getBytes());
        InputStream sourceInputStream =
            new ByteArrayInputStream(ts.getMessageContentsXMLCode().getBytes());
        Reader xsltReader = new InputStreamReader(xsltInputStream, "UTF-8");
        Reader sourceReader = new InputStreamReader(sourceInputStream, "UTF-8");
        String xsltStr = IOUtils.toString(xsltReader);
        String sourceStr = IOUtils.toString(sourceReader);

        String messageContentHTMLStr = XMLManager.parseXmlByXSLT(sourceStr, xsltStr);
        packageBodyHTML = packageBodyHTML + "<h3>" + "Message Contents" + "</h3>"
            + System.getProperty("line.separator");
        packageBodyHTML = packageBodyHTML + this.retrieveBodyContent(messageContentHTMLStr);
      }

      if (ts.getNistXMLCode() != null && !ts.getNistXMLCode().equals("")) {
        if (ts.getTdsXSL() != null && !ts.getTdsXSL().equals("")) {
          String tdXSL = IOUtils
              .toString(
                  classLoader.getResourceAsStream("xsl" + File.separator + ts.getTdsXSL() + ".xsl"))
              .replaceAll("<xsl:param name=\"output\" select=\"'ng-tab-html'\"/>",
                  "<xsl:param name=\"output\" select=\"'plain-html'\"/>");
          InputStream xsltInputStream = new ByteArrayInputStream(tdXSL.getBytes());
          InputStream sourceInputStream = new ByteArrayInputStream(ts.getNistXMLCode().getBytes());
          Reader xsltReader = new InputStreamReader(xsltInputStream, "UTF-8");
          Reader sourceReader = new InputStreamReader(sourceInputStream, "UTF-8");
          String xsltStr = IOUtils.toString(xsltReader);
          String sourceStr = IOUtils.toString(sourceReader);

          String testDataSpecificationHTMLStr = XMLManager.parseXmlByXSLT(sourceStr, xsltStr);
          packageBodyHTML = packageBodyHTML + "<h3>" + "Test Data Specification" + "</h3>"
              + System.getProperty("line.separator");
          packageBodyHTML =
              packageBodyHTML + this.retrieveBodyContent(testDataSpecificationHTMLStr);
        }

        if (ts.getJdXSL() != null && !ts.getJdXSL().equals("")) {
          String jdXSL = IOUtils.toString(
              classLoader.getResourceAsStream("xsl" + File.separator + ts.getJdXSL() + ".xsl"));
          InputStream xsltInputStream = new ByteArrayInputStream(jdXSL.getBytes());
          InputStream sourceInputStream = new ByteArrayInputStream(ts.getNistXMLCode().getBytes());
          Reader xsltReader = new InputStreamReader(xsltInputStream, "UTF-8");
          Reader sourceReader = new InputStreamReader(sourceInputStream, "UTF-8");
          String xsltStr = IOUtils.toString(xsltReader);
          String sourceStr = IOUtils.toString(sourceReader);

          String jurorDocumentHTMLStr = XMLManager.parseXmlByXSLT(sourceStr, xsltStr);
          packageBodyHTML = packageBodyHTML + "<h3>" + "Juror Document" + "</h3>"
              + System.getProperty("line.separator");
          packageBodyHTML = packageBodyHTML + this.retrieveBodyContent(jurorDocumentHTMLStr);
        }
      }

    }

    packageBodyHTML = packageBodyHTML + "<p style=\"page-break-after:always;\"></p>";
    return packageBodyHTML;
  }

  private String genPackagePages(TestPlan tp,
      TestStoryConfigurationService testStoryConfigurationService) throws Exception {
    ClassLoader classLoader = getClass().getClassLoader();

    String packageBodyHTML = "";
    packageBodyHTML =
        packageBodyHTML + "<h1>" + tp.getName() + "</h1>" + System.getProperty("line.separator");
    packageBodyHTML = packageBodyHTML + tp.getDescription() + System.getProperty("line.separator");
    packageBodyHTML =
        packageBodyHTML + "<h3>" + "Test Story" + "</h3>" + System.getProperty("line.separator");
    String testStoryConfigId = null;
    if (tp.getTestStoryConfigId() != null) {
      testStoryConfigId = tp.getTestStoryConfigId();
    }

    TestStoryConfiguration testStoryConfiguration = null;
    if (testStoryConfigId != null) {
      testStoryConfiguration = testStoryConfigurationService.findById(testStoryConfigId);
    }

    if (testStoryConfiguration == null) {
      testStoryConfiguration = testStoryConfigurationService.findByAccountId((long) 0).get(0);
    }

    packageBodyHTML = packageBodyHTML + this.retrieveBodyContent(
        this.generateTestStory(tp.getTestStoryContent(), testStoryConfiguration, "plain", tp));
    packageBodyHTML = packageBodyHTML + "<p style=\"page-break-after:always;\"></p>";

    for (int i = 0; i < tp.getChildren().size(); i++) {
      TestCaseOrGroup child = tp.getChildren().get(i);
      if (child instanceof TestCaseGroup) {
        packageBodyHTML = genPackagePagesInsideGroup(tp, (TestCaseGroup) child, packageBodyHTML,
            "" + (i + 1), testStoryConfigurationService);
      } else if (child instanceof TestCase) {
        packageBodyHTML = genPackagePagesForTestCase(tp, (TestCase) child, packageBodyHTML,
            "" + (i + 1), testStoryConfigurationService);
      }
    }

    String testPackageStr = IOUtils
        .toString(classLoader.getResourceAsStream("rb" + File.separator + "TestPackage.html"));
    testPackageStr = testPackageStr.replace("?bodyContent?", packageBodyHTML);
    return testPackageStr;
  }

  private String retrieveBodyContent(String generateTestStory) {

    int beginIndex = generateTestStory.indexOf("<body>");
    int endIndex = generateTestStory.indexOf("</body>");

    return "" + generateTestStory.subSequence(beginIndex + "<body>".length(), endIndex);
  }

  private String generateTestStory(HashMap<String, String> testStoryContent,
      TestStoryConfiguration testStoryConfiguration, String option, TestPlan tp) throws Exception {
    ClassLoader classLoader = getClass().getClassLoader();

    if (option.equals("ng-tab-html")) {
      String testStoryStr = IOUtils.toString(
          classLoader.getResourceAsStream("rb" + File.separator + "ng-tab-html-TestStory.html"));

      HashMap<Integer, TestStroyEntry> testStroyEntryMap = new HashMap<Integer, TestStroyEntry>();
      for (TestStroyEntry tse : testStoryConfiguration.getTestStoryConfig()) {
        testStroyEntryMap.put(tse.getPosition(), tse);
      }
      String fullStory = "";
      String tabStory = "";

      for (int i = 0; i < testStroyEntryMap.size(); i++) {
        TestStroyEntry tse = testStroyEntryMap.get(i + 1);

        if (tse.isPresent()) {
          String title = tse.getTitle();
          String content = testStoryContent.get(tse.getId());

          if (tp.isEmptyStoryContentIgnored()) {
            if (content != null && !"".equals(content)) {
              fullStory = fullStory + "<div class=\"panel-body\"><table><tr><th>" + title
                  + "</th></tr><tr><td>" + content + "</td></tr></table></div><br/>";
              tabStory = tabStory + "<tab heading=\"" + title + "\" vertical=\"false\">"
                  + "<div class=\"panel-body\"><table><tr><th>" + title + "</th></tr><tr><td>"
                  + content + "</td></tr></table></div></tab>";
            }
          } else {
            fullStory = fullStory + "<div class=\"panel-body\"><table><tr><th>" + title
                + "</th></tr><tr><td>" + content + "</td></tr></table></div><br/>";
            tabStory = tabStory + "<tab heading=\"" + title + "\" vertical=\"false\">"
                + "<div class=\"panel-body\"><table><tr><th>" + title + "</th></tr><tr><td>"
                + content + "</td></tr></table></div></tab>";
          }

        }
      }

      return testStoryStr.replace("?FullStory?", fullStory).replace("?TABStory?", tabStory);

    } else {
      String testStoryStr = IOUtils
          .toString(classLoader.getResourceAsStream("rb" + File.separator + "PlainTestStory.html"));

      HashMap<Integer, TestStroyEntry> testStroyEntryMap = new HashMap<Integer, TestStroyEntry>();
      for (TestStroyEntry tse : testStoryConfiguration.getTestStoryConfig()) {
        testStroyEntryMap.put(tse.getPosition(), tse);
      }
      String storyContent = "";

      for (int i = 0; i < testStroyEntryMap.size(); i++) {
        TestStroyEntry tse = testStroyEntryMap.get(i + 1);

        if (tse.isPresent()) {
          String title = tse.getTitle();
          String content = testStoryContent.get(tse.getId());

          if (tp.isEmptyStoryContentIgnored()) {
            if (content != null && !"".equals(content))
              storyContent = storyContent + "<table><tr><th>" + title + "</th></tr><tr><td>"
                  + content + "</td></tr></table><br/>";
          } else {
            storyContent = storyContent + "<table><tr><th>" + title + "</th></tr><tr><td>" + content
                + "</td></tr></table><br/>";
          }

        }
      }

      return testStoryStr.replace("?TestStoryContents?", storyContent);

    }
  }

  private String genCoverPage(TestPlan tp) throws IOException {
    ClassLoader classLoader = getClass().getClassLoader();

    String coverpageStr =
        IOUtils.toString(classLoader.getResourceAsStream("rb" + File.separator + "CoverPage.html"));

    if (tp.getCoverPageTitle() == null || tp.getCoverPageTitle().equals("")) {
      coverpageStr = coverpageStr.replace("?title?", "No Title");
    } else {
      coverpageStr = coverpageStr.replace("?title?", tp.getCoverPageTitle());
    }

    if (tp.getCoverPageSubTitle() == null || tp.getCoverPageSubTitle().equals("")) {
      coverpageStr = coverpageStr.replace("?subtitle?", "No SubTitle");
    } else {
      coverpageStr = coverpageStr.replace("?subtitle?", tp.getCoverPageSubTitle());
    }

    if (tp.getCoverPageVersion() == null || tp.getCoverPageVersion().equals("")) {
      coverpageStr = coverpageStr.replace("?version?", "No Version");
    } else {
      coverpageStr = coverpageStr.replace("?version?", tp.getCoverPageVersion());
    }

    if (tp.getCoverPageDate() == null || tp.getCoverPageDate().equals("")) {
      coverpageStr = coverpageStr.replace("?date?", "No Date");
    } else {
      coverpageStr = coverpageStr.replace("?date?", tp.getCoverPageDate());
    }

    return coverpageStr;
  }

  public InputStream exportResourceBundleAsZip(TestPlan tp,
      TestStoryConfigurationService testStoryConfigurationService, Long rand) throws Exception {
    ByteArrayOutputStream outputStream = null;
    byte[] bytes;
    outputStream = new ByteArrayOutputStream();
    ZipOutputStream out = new ZipOutputStream(outputStream);
    this.genCoverAsHtml(out, tp);
    this.genPackagePages(out, tp, testStoryConfigurationService);
    this.generateTestPlanSummary(out, tp, testStoryConfigurationService);
    this.generateTestPlanRB(out, tp, testStoryConfigurationService, rand);

    out.close();
    bytes = outputStream.toByteArray();
    return new ByteArrayInputStream(bytes);
  }

  private void genCoverAsHtml(ZipOutputStream out, TestPlan tp) throws Exception {
    byte[] buf = new byte[1024];
    out.putNextEntry(new ZipEntry(tp.getId() + File.separator + "CoverPage.html"));
    InputStream inCoverPager = this.exportCoverAsHtml(tp);
    int lenTestPlanSummary;
    while ((lenTestPlanSummary = inCoverPager.read(buf)) > 0) {
      out.write(buf, 0, lenTestPlanSummary);
    }
    out.closeEntry();
    inCoverPager.close();
  }

  private void genPackagePages(ZipOutputStream out, TestPlan tp,
      TestStoryConfigurationService testStoryConfigurationService) throws Exception {

    byte[] buf = new byte[1024];
    out.putNextEntry(new ZipEntry(tp.getId() + File.separator + "TestPackage.html"));
    InputStream inTestPackage = this.exportTestPackageAsHtml(tp, testStoryConfigurationService);
    int lenTestPlanSummary;
    while ((lenTestPlanSummary = inTestPackage.read(buf)) > 0) {
      out.write(buf, 0, lenTestPlanSummary);
    }
    out.closeEntry();
    inTestPackage.close();
  }

  private void generateTestPlanRBTestGroup(ZipOutputStream out, TestCaseGroup group, String path,
      TestPlan tp, TestStoryConfigurationService testStoryConfigurationService, int index,
      Long rand) throws Exception {
    String groupPath = "";
    if (path == null) {
      groupPath = tp.getId() + File.separator + "TestGroup_" + index;
    } else {
      groupPath = path + File.separator + "TestGroup_" + index;
    }
    this.generateTestGroupJsonRB(out, group, groupPath, index);

    String testStoryConfigId = null;
    if (group.getTestStoryConfigId() != null) {
      testStoryConfigId = group.getTestStoryConfigId();
    } else {
      testStoryConfigId = tp.getGlobalTestGroupConfigId();
    }

    TestStoryConfiguration testStoryConfiguration = null;
    if (testStoryConfigId != null) {
      testStoryConfiguration = testStoryConfigurationService.findById(testStoryConfigId);
    }

    if (testStoryConfiguration == null) {
      testStoryConfiguration = testStoryConfigurationService.findByAccountId((long) 0).get(0);
    }

    this.generateTestStoryRB(out, group.getTestStoryContent(), testStoryConfiguration, groupPath,
        tp, "ng-tab-html");
    this.generateTestStoryRB(out, group.getTestStoryContent(), testStoryConfiguration, groupPath,
        tp, "plain");

    for (int i = 0; i < group.getChildren().size(); i++) {
      TestCaseOrGroup child = group.getChildren().get(i);
      if (child instanceof TestCaseGroup) {
        generateTestPlanRBTestGroup(out, (TestCaseGroup) child, groupPath, tp,
            testStoryConfigurationService, i + 1, rand);
      } else if (child instanceof TestCase) {
        generateTestPlanRBTestCase(out, (TestCase) child, groupPath, tp,
            testStoryConfigurationService, i + 1, rand);
      }
    }
  }

  private void generateTestPlanRBTestCase(ZipOutputStream out, TestCase tc, String path,
      TestPlan tp, TestStoryConfigurationService testStoryConfigurationService, int index,
      Long rand) throws Exception {
    String tcPath = "";
    if (path == null) {
      tcPath = tp.getId() + File.separator + "TestCase_" + index;
    } else {
      tcPath = path + File.separator + "TestCase_" + index;
    }
    this.generateTestCaseJsonRB(out, tc, tcPath, index);

    String testStoryConfigId = null;
    if (tc.getTestStoryConfigId() != null) {
      testStoryConfigId = tc.getTestStoryConfigId();
    } else {
      testStoryConfigId = tp.getGlobalTestCaseConfigId();
    }

    TestStoryConfiguration testStoryConfiguration = null;
    if (testStoryConfigId != null) {
      testStoryConfiguration = testStoryConfigurationService.findById(testStoryConfigId);
    }

    if (testStoryConfiguration == null) {
      testStoryConfiguration = testStoryConfigurationService.findByAccountId((long) 0).get(0);
    }

    this.generateTestStoryRB(out, tc.getTestStoryContent(), testStoryConfiguration, tcPath, tp,
        "ng-tab-html");
    this.generateTestStoryRB(out, tc.getTestStoryContent(), testStoryConfiguration, tcPath, tp,
        "plain");

    for (int i = 0; i < tc.getTeststeps().size(); i++) {
      TestStep child = tc.getTeststeps().get(i);
      generateTestPlanRBTestStep(out, child, tcPath, tp, testStoryConfigurationService, i + 1,
          rand);
    }
  }

  private void generateTestPlanRBTestStep(ZipOutputStream out, TestStep ts, String path,
      TestPlan tp, TestStoryConfigurationService testStoryConfigurationService, int index,
      Long rand) throws Exception {
    String stepPath = path + File.separator + "TestStep_" + index;

    String testStoryConfigId = null;
    if (ts.getTestStoryConfigId() != null) {
      testStoryConfigId = ts.getTestStoryConfigId();
    } else {
      if (ts.isManualTS()) {
        testStoryConfigId = tp.getGlobalManualTestStepConfigId();
      } else {
        testStoryConfigId = tp.getGlobalAutoTestStepConfigId();
      }
    }
    TestStoryConfiguration testStoryConfiguration = null;
    if (testStoryConfigId != null) {
      testStoryConfiguration = testStoryConfigurationService.findById(testStoryConfigId);
    }

    if (testStoryConfiguration == null) {
      testStoryConfiguration = testStoryConfigurationService.findByAccountId((long) 0).get(0);
    }

    this.generateTestStoryRB(out, ts.getTestStoryContent(), testStoryConfiguration, stepPath, tp,
        "ng-tab-html");
    this.generateTestStoryRB(out, ts.getTestStoryContent(), testStoryConfiguration, stepPath, tp,
        "plain");

    this.generateTestStepJsonRB(out, ts, tp, stepPath, index, rand);

    if (ts.getConformanceProfileId() != null && !ts.getConformanceProfileId().equals("")) {
      this.generateEr7Message(out, ts.getEr7Message(), stepPath);
      this.generateMessageContent(out, ts.getMessageContentsXMLCode(), stepPath, "ng-tab-html");
      this.generateMessageContent(out, ts.getMessageContentsXMLCode(), stepPath, "plain");
      String constraintsXML = ts.getConstraintsXML();
      constraintsXML = constraintsXML.replaceAll(ts.getConformanceProfileId(),
          ts.getConformanceProfileId() + rand);
      System.out.println("[TESTSTEP Constraints]");
      System.out.println(constraintsXML);
      this.generateConstraintsXML(out, constraintsXML, stepPath);

      if (ts.getNistXMLCode() != null && !ts.getNistXMLCode().equals("")) {
        if (ts.getTdsXSL() != null && !ts.getTdsXSL().equals("")) {
          this.generateTestDataSpecification(out, ts, stepPath, "ng-tab-html");
          this.generateTestDataSpecification(out, ts, stepPath, "plain");
        }

        if (ts.getJdXSL() != null && !ts.getJdXSL().equals("")) {
          this.generateJurorDocument(out, ts, stepPath, "ng-tab-html");
          this.generateJurorDocument(out, ts, stepPath, "plain");
        }
      }
    }

  }

  private void generateTestPlanRB(ZipOutputStream out, TestPlan tp,
      TestStoryConfigurationService testStoryConfigurationService, Long rand) throws Exception {
    this.generateTestPlanJsonRB(out, tp, 1);
    String testStoryConfigId = null;
    if (tp.getTestStoryConfigId() != null) {
      testStoryConfigId = tp.getTestStoryConfigId();
    }

    TestStoryConfiguration testStoryConfiguration = null;
    if (testStoryConfigId != null) {
      testStoryConfiguration = testStoryConfigurationService.findById(testStoryConfigId);
    }

    if (testStoryConfiguration == null) {
      testStoryConfiguration = testStoryConfigurationService.findByAccountId((long) 0).get(0);
    }
    this.generateTestStoryRB(out, tp.getTestStoryContent(), testStoryConfiguration, null, tp,
        "ng-tab-html");
    this.generateTestStoryRB(out, tp.getTestStoryContent(), testStoryConfiguration, null, tp,
        "plain");

    for (int i = 0; i < tp.getChildren().size(); i++) {
      Object child = tp.getChildren().get(i);
      if (child instanceof TestCaseGroup) {
        generateTestPlanRBTestGroup(out, (TestCaseGroup) child, null, tp,
            testStoryConfigurationService, i + 1, rand);
      } else if (child instanceof TestCase) {
        generateTestPlanRBTestCase(out, (TestCase) child, null, tp, testStoryConfigurationService,
            i + 1, rand);
      }
    }
  }

  private void generateJurorDocument(ZipOutputStream out, TestStep ts, String teststepPath,
      String option) throws IOException {
    ClassLoader classLoader = getClass().getClassLoader();
    InputStream is =
        classLoader.getResourceAsStream("xsl" + File.separator + ts.getJdXSL() + ".xsl");
    String mcXSL = null;
    if (is != null) {
      byte[] buf = new byte[1024];

      if (option.equals("ng-tab-html")) {
        out.putNextEntry(new ZipEntry(teststepPath + File.separator + "JurorDocument.html"));
        mcXSL = IOUtils.toString(is);
      } else {
        out.putNextEntry(new ZipEntry(teststepPath + File.separator + "JurorDocumentPDF.html"));
        mcXSL =
            IOUtils.toString(is).replaceAll("<xsl:param name=\"output\" select=\"'ng-tab-html'\"/>",
                "<xsl:param name=\"output\" select=\"'plain-html'\"/>");
      }

      InputStream xsltInputStream = new ByteArrayInputStream(mcXSL.getBytes());
      InputStream sourceInputStream = new ByteArrayInputStream(ts.getNistXMLCode().getBytes());
      Reader xsltReader = new InputStreamReader(xsltInputStream, "UTF-8");
      Reader sourceReader = new InputStreamReader(sourceInputStream, "UTF-8");
      String xsltStr = IOUtils.toString(xsltReader);
      String sourceStr = IOUtils.toString(sourceReader);
      String jurorDocumentHTML = XMLManager.parseXmlByXSLT(sourceStr, xsltStr);
      InputStream inTP = null;
      inTP = IOUtils.toInputStream(jurorDocumentHTML);
      int lenTP;
      while ((lenTP = inTP.read(buf)) > 0) {
        out.write(buf, 0, lenTP);
      }
      out.closeEntry();
      inTP.close();
    }
  }

  private void generateTestDataSpecification(ZipOutputStream out, TestStep ts, String teststepPath,
      String option) throws IOException {
    ClassLoader classLoader = getClass().getClassLoader();
    InputStream is =
        classLoader.getResourceAsStream("xsl" + File.separator + ts.getTdsXSL() + ".xsl");
    String mcXSL = null;
    if (is != null) {
      byte[] buf = new byte[1024];

      if (option.equals("ng-tab-html")) {
        out.putNextEntry(
            new ZipEntry(teststepPath + File.separator + "TestDataSpecification.html"));
        mcXSL = IOUtils.toString(is);
      } else {
        out.putNextEntry(
            new ZipEntry(teststepPath + File.separator + "TestDataSpecificationPDF.html"));
        mcXSL =
            IOUtils.toString(is).replaceAll("<xsl:param name=\"output\" select=\"'ng-tab-html'\"/>",
                "<xsl:param name=\"output\" select=\"'plain-html'\"/>");
      }

      InputStream xsltInputStream = new ByteArrayInputStream(mcXSL.getBytes());
      InputStream sourceInputStream = new ByteArrayInputStream(ts.getNistXMLCode().getBytes());
      Reader xsltReader = new InputStreamReader(xsltInputStream, "UTF-8");
      Reader sourceReader = new InputStreamReader(sourceInputStream, "UTF-8");
      String xsltStr = IOUtils.toString(xsltReader);
      String sourceStr = IOUtils.toString(sourceReader);
      String messageContentHTML = XMLManager.parseXmlByXSLT(sourceStr, xsltStr);
      InputStream inTP = null;
      inTP = IOUtils.toInputStream(messageContentHTML);
      int lenTP;
      while ((lenTP = inTP.read(buf)) > 0) {
        out.write(buf, 0, lenTP);
      }
      out.closeEntry();
      inTP.close();
    }
  }

  private void generateConstraintsXML(ZipOutputStream out, String constraintsXMLCode,
      String teststepPath) throws IOException {
    byte[] buf = new byte[1024];
    out.putNextEntry(new ZipEntry(teststepPath + File.separator + "Constraints.xml"));
    InputStream inTP = null;
    inTP = IOUtils.toInputStream(constraintsXMLCode);
    int lenTP;
    while ((lenTP = inTP.read(buf)) > 0) {
      out.write(buf, 0, lenTP);
    }
    out.closeEntry();
    inTP.close();
  }

  private void generateMessageContent(ZipOutputStream out, String messageContentsXMLCode,
      String teststepPath, String option) throws IOException {
    ClassLoader classLoader = getClass().getClassLoader();
    byte[] buf = new byte[1024];
    String mcXSL = null;
    if (option.equals("ng-tab-html")) {
      out.putNextEntry(new ZipEntry(teststepPath + File.separator + "MessageContent.html"));
      mcXSL = IOUtils.toString(
          classLoader.getResourceAsStream("xsl" + File.separator + "MessageContents.xsl"));
    } else {
      out.putNextEntry(new ZipEntry(teststepPath + File.separator + "MessageContentPDF.html"));
      mcXSL = IOUtils
          .toString(classLoader.getResourceAsStream("xsl" + File.separator + "MessageContents.xsl"))
          .replaceAll("<xsl:param name=\"output\" select=\"'ng-tab-html'\"/>",
              "<xsl:param name=\"output\" select=\"'plain-html'\"/>");
    }

    InputStream xsltInputStream = new ByteArrayInputStream(mcXSL.getBytes());
    InputStream sourceInputStream = new ByteArrayInputStream(messageContentsXMLCode.getBytes());
    Reader xsltReader = new InputStreamReader(xsltInputStream, "UTF-8");
    Reader sourceReader = new InputStreamReader(sourceInputStream, "UTF-8");
    String xsltStr = IOUtils.toString(xsltReader);
    String sourceStr = IOUtils.toString(sourceReader);
    String messageContentHTML = XMLManager.parseXmlByXSLT(sourceStr, xsltStr);
    InputStream inTP = null;
    inTP = IOUtils.toInputStream(messageContentHTML);
    int lenTP;
    while ((lenTP = inTP.read(buf)) > 0) {
      out.write(buf, 0, lenTP);
    }
    out.closeEntry();
    inTP.close();

  }

  private void generateEr7Message(ZipOutputStream out, String er7Message, String teststepPath)
      throws IOException {
    byte[] buf = new byte[1024];
    out.putNextEntry(new ZipEntry(teststepPath + File.separator + "Message.txt"));

    InputStream inTP = null;
    inTP = IOUtils.toInputStream(er7Message);
    int lenTP;
    while ((lenTP = inTP.read(buf)) > 0) {
      out.write(buf, 0, lenTP);
    }
    out.closeEntry();
    inTP.close();

  }

  private void generateTestStepJsonRB(ZipOutputStream out, TestStep ts, TestPlan tp,
      String teststepPath, int index, Long rand) throws IOException {
    byte[] buf = new byte[1024];
    out.putNextEntry(new ZipEntry(teststepPath + File.separator + "TestStep.json"));

    InputStream inTP = null;

    JSONObject obj = new JSONObject();
    obj.put("id", ts.getLongId());
    obj.put("name", ts.getName());
    obj.put("description", ts.getDescription());
    if (ts.getType() == null) {
      if (tp.getType() != null && tp.getType().equals("Isolated")) {
        obj.put("type", "SUT_INITIATOR");
      } else {
        obj.put("type", "DATAINSTANCE");
      }
    } else {
      if (ts.getType().equals("teststep")) {
        if (tp.getType() != null && tp.getType().equals("Isolated")) {
          obj.put("type", "SUT_INITIATOR");
        } else {
          obj.put("type", "DATAINSTANCE");
        }
      } else {
        obj.put("type", ts.getType());
      }

    }

    obj.put("position", index);

    if (ts.getIntegrationProfileId() != null) {

      JSONArray plist = new JSONArray();
      plist.put("soap");
      obj.put("protocols", plist);


    }

    JSONObject hl7v2Obj = new JSONObject();
    hl7v2Obj.put("messageId", ts.getConformanceProfileId() + rand);


    System.out.println("NEED CHEKC::::" + ts.getConformanceProfileId() + rand);
    hl7v2Obj.put("constraintId", ts.getIntegrationProfileId() + rand);
    hl7v2Obj.put("valueSetLibraryId", ts.getIntegrationProfileId() + rand);
    obj.put("hl7v2", hl7v2Obj);

    inTP = IOUtils.toInputStream(obj.toString());
    int lenTP;
    while ((lenTP = inTP.read(buf)) > 0) {
      out.write(buf, 0, lenTP);
    }
    out.closeEntry();
    inTP.close();

  }

  private void generateTestStoryRB(ZipOutputStream out, HashMap<String, String> testStoryContent,
      TestStoryConfiguration testStoryConfiguration, String path, TestPlan tp, String option)
      throws Exception {
    byte[] buf = new byte[1024];
    if (path == null) {
      if (option.equals("ng-tab-html")) {
        out.putNextEntry(new ZipEntry(tp.getId() + File.separator + "TestStory.html"));
      } else {
        out.putNextEntry(new ZipEntry(tp.getId() + File.separator + "TestStoryPDF.html"));
      }
    } else {
      if (option.equals("ng-tab-html")) {
        out.putNextEntry(new ZipEntry(path + File.separator + "TestStory.html"));
      } else {
        out.putNextEntry(new ZipEntry(path + File.separator + "TestStoryPDF.html"));
      }
    }

    String testStoryStr =
        this.generateTestStory(testStoryContent, testStoryConfiguration, option, tp);
    InputStream inTestStory = IOUtils.toInputStream(testStoryStr, "UTF-8");
    int lenTestStory;
    while ((lenTestStory = inTestStory.read(buf)) > 0) {
      out.write(buf, 0, lenTestStory);
    }
    inTestStory.close();
    out.closeEntry();
  }

  private void generateTestCaseJsonRB(ZipOutputStream out, TestCase tc, String testcasePath,
      int index) throws IOException {
    byte[] buf = new byte[1024];
    out.putNextEntry(new ZipEntry(testcasePath + File.separator + "TestCase.json"));

    JSONObject obj = new JSONObject();
    obj.put("id", tc.getLongId());
    obj.put("name", tc.getName());
    obj.put("description", tc.getDescription());
    obj.put("position", index);
    obj.put("protocol", tc.getProtocol());

    InputStream inTP = IOUtils.toInputStream(obj.toString());
    int lenTP;
    while ((lenTP = inTP.read(buf)) > 0) {
      out.write(buf, 0, lenTP);
    }
    out.closeEntry();
    inTP.close();
  }

  private void generateTestGroupJsonRB(ZipOutputStream out, TestCaseGroup tg, String groupPath,
      int index) throws IOException {
    byte[] buf = new byte[1024];
    out.putNextEntry(new ZipEntry(groupPath + File.separator + "TestCaseGroup.json"));

    JSONObject obj = new JSONObject();
    obj.put("id", tg.getLongId());
    obj.put("name", tg.getName());
    obj.put("description", tg.getDescription());
    obj.put("position", index);

    InputStream inTP = IOUtils.toInputStream(obj.toString());
    int lenTP;
    while ((lenTP = inTP.read(buf)) > 0) {
      out.write(buf, 0, lenTP);
    }
    out.closeEntry();
    inTP.close();
  }

  private void generateTestPlanJsonRB(ZipOutputStream out, TestPlan tp, int index)
      throws IOException {
    JSONObject obj = new JSONObject();
    obj.put("id", tp.getLongId());
    obj.put("name", tp.getName());
    obj.put("description", tp.getDescription());
    obj.put("position", index);
    obj.put("type", tp.getType());
    obj.put("transport", tp.isTransport());
    if (tp.getDomain() == null) {
      obj.put("domain", "NoDomain");
    } else {
      obj.put("domain", tp.getDomain());
    }
    obj.put("skip", false);

    byte[] buf = new byte[1024];
    out.putNextEntry(new ZipEntry(tp.getId() + File.separator + "TestPlan.json"));
    InputStream inTP = IOUtils.toInputStream(obj.toString());
    int lenTP;
    while ((lenTP = inTP.read(buf)) > 0) {
      out.write(buf, 0, lenTP);
    }
    out.closeEntry();
    inTP.close();
  }

  private String generateTestPlanSummaryForTestGroup(String contentsHTML, TestCaseGroup group,
      TestPlan tp, TestStoryConfigurationService testStoryConfigurationService) {
    contentsHTML = contentsHTML + "<h2>Test Case Group: " + group.getName() + "</h2>"
        + System.getProperty("line.separator");

    String testStoryConfigId = null;
    if (group.getTestStoryConfigId() != null) {
      testStoryConfigId = group.getTestStoryConfigId();
    } else {
      testStoryConfigId = tp.getGlobalTestGroupConfigId();
    }
    TestStoryConfiguration testStoryConfiguration = null;
    if (testStoryConfigId != null) {
      testStoryConfiguration = testStoryConfigurationService.findById(testStoryConfigId);
    }

    if (testStoryConfiguration == null) {
      testStoryConfiguration = testStoryConfigurationService.findByAccountId((long) 0).get(0);
    }
    HashMap<Integer, TestStroyEntry> testStroyEntryMap = new HashMap<Integer, TestStroyEntry>();
    for (TestStroyEntry tse : testStoryConfiguration.getTestStoryConfig()) {
      testStroyEntryMap.put(tse.getPosition(), tse);
    }

    String summaryContent = "";

    for (int i = 0; i < testStroyEntryMap.size(); i++) {
      TestStroyEntry tse = testStroyEntryMap.get(i + 1);

      if (tse.isSummaryEntry()) {
        String title = tse.getTitle();
        String content = group.getTestStoryContent().get(tse.getId());

        if (tp.isEmptyStoryContentIgnored()) {
          if (content != null && !"".equals(content))
            summaryContent = summaryContent + "<h3>" + title + "</h3>" + content + "<br/>";
        } else {
          summaryContent = summaryContent + "<h3>" + title + "</h3>" + content + "<br/>";
        }
      }
    }

    if (!summaryContent.equals("")) {
      contentsHTML = contentsHTML + summaryContent + System.getProperty("line.separator");
    }

    contentsHTML = contentsHTML + group.getDescription() + System.getProperty("line.separator");
    contentsHTML = contentsHTML + "<br/>" + System.getProperty("line.separator");

    for (int i = 0; i < group.getChildren().size(); i++) {
      Object child = group.getChildren().get(i);

      if (child instanceof TestCaseGroup) {
        contentsHTML = generateTestPlanSummaryForTestGroup(contentsHTML, (TestCaseGroup) child, tp,
            testStoryConfigurationService);
      } else if (child instanceof TestCase) {
        contentsHTML = generateTestPlanSummaryForTestCase(contentsHTML, (TestCase) child, tp,
            testStoryConfigurationService);
      }
    }

    return contentsHTML;
  }

  private String generateTestPlanSummaryForTestCase(String contentsHTML, TestCase tc, TestPlan tp,
      TestStoryConfigurationService testStoryConfigurationService) {
    contentsHTML = contentsHTML + "<table>" + System.getProperty("line.separator");

    contentsHTML = contentsHTML + "<tr>" + System.getProperty("line.separator");
    contentsHTML = contentsHTML + "<th>Test Case</th>" + System.getProperty("line.separator");
    contentsHTML =
        contentsHTML + "<th>" + tc.getName() + "</th>" + System.getProperty("line.separator");
    contentsHTML = contentsHTML + "</tr>" + System.getProperty("line.separator");

    contentsHTML = contentsHTML + "<tr>" + System.getProperty("line.separator");

    String testStoryConfigId = null;
    if (tc.getTestStoryConfigId() != null) {
      testStoryConfigId = tc.getTestStoryConfigId();
    } else {
      testStoryConfigId = tp.getGlobalTestCaseConfigId();
    }

    TestStoryConfiguration testStoryConfiguration = null;
    if (testStoryConfigId != null) {
      testStoryConfiguration = testStoryConfigurationService.findById(testStoryConfigId);
    }

    if (testStoryConfiguration == null) {
      testStoryConfiguration = testStoryConfigurationService.findByAccountId((long) 0).get(0);
    }

    HashMap<Integer, TestStroyEntry> testStroyEntryMap = new HashMap<Integer, TestStroyEntry>();
    for (TestStroyEntry tse : testStoryConfiguration.getTestStoryConfig()) {
      testStroyEntryMap.put(tse.getPosition(), tse);
    }

    String summaryContent = "";

    for (int i = 0; i < testStroyEntryMap.size(); i++) {
      TestStroyEntry tse = testStroyEntryMap.get(i + 1);

      if (tse.isSummaryEntry()) {
        String title = tse.getTitle();
        String content = tc.getTestStoryContent().get(tse.getId());

        if (tp.isEmptyStoryContentIgnored()) {
          if (content != null && !"".equals(content))
            summaryContent = summaryContent + "<h3>" + title + "</h3>" + content + "<br/>";
        } else {
          summaryContent = summaryContent + "<h3>" + title + "</h3>" + content + "<br/>";
        }
      }
    }

    if (!summaryContent.equals("")) {
      contentsHTML = contentsHTML + "<td colspan='2'>" + summaryContent + "</td>"
          + System.getProperty("line.separator");
    }
    contentsHTML = contentsHTML + "</tr>" + System.getProperty("line.separator");

    contentsHTML = contentsHTML + "<tr>" + System.getProperty("line.separator");
    contentsHTML =
        contentsHTML + "<th colspan='2'>Test Steps</th>" + System.getProperty("line.separator");
    contentsHTML = contentsHTML + "</tr>" + System.getProperty("line.separator");

    for (int i = 0; i < tc.getTeststeps().size(); i++) {
      TestStep ts = tc.getTeststeps().get(i);
      contentsHTML =
          generateTestPlanSummaryForTestStep(contentsHTML, ts, tp, testStoryConfigurationService);

    }

    contentsHTML = contentsHTML + "</table>" + System.getProperty("line.separator");
    contentsHTML = contentsHTML + "<br/>" + System.getProperty("line.separator");

    return contentsHTML;
  }

  private String generateTestPlanSummaryForTestStep(String contentsHTML, TestStep ts, TestPlan tp,
      TestStoryConfigurationService testStoryConfigurationService) {
    contentsHTML = contentsHTML + "<tr>" + System.getProperty("line.separator");
    contentsHTML =
        contentsHTML + "<th>" + ts.getName() + "</th>" + System.getProperty("line.separator");

    String testStoryConfigId = null;
    if (ts.getTestStoryConfigId() != null) {
      testStoryConfigId = ts.getTestStoryConfigId();
    } else {
      if (ts.isManualTS()) {
        testStoryConfigId = tp.getGlobalManualTestStepConfigId();
      } else {
        testStoryConfigId = tp.getGlobalAutoTestStepConfigId();
      }
    }
    TestStoryConfiguration testStoryConfiguration = null;
    if (testStoryConfigId != null) {
      testStoryConfiguration = testStoryConfigurationService.findById(testStoryConfigId);
    }

    if (testStoryConfiguration == null) {
      testStoryConfiguration = testStoryConfigurationService.findByAccountId((long) 0).get(0);
    }
    HashMap<Integer, TestStroyEntry> testStroyEntryMap = new HashMap<Integer, TestStroyEntry>();
    for (TestStroyEntry tse : testStoryConfiguration.getTestStoryConfig()) {
      testStroyEntryMap.put(tse.getPosition(), tse);
    }

    String summaryContent = "";

    for (int i = 0; i < testStroyEntryMap.size(); i++) {
      TestStroyEntry tse = testStroyEntryMap.get(i + 1);

      if (tse.isSummaryEntry()) {
        String title = tse.getTitle();
        String content = ts.getTestStoryContent().get(tse.getId());

        if (tp.isEmptyStoryContentIgnored()) {
          if (content != null && !"".equals(content))
            summaryContent = summaryContent + "<h3>" + title + "</h3>" + content + "<br/>";
        } else {
          summaryContent = summaryContent + "<h3>" + title + "</h3>" + content + "<br/>";
        }
      }
    }

    if (!summaryContent.equals("")) {
      contentsHTML =
          contentsHTML + "<td>" + summaryContent + "</td>" + System.getProperty("line.separator");
    }

    contentsHTML = contentsHTML + "</tr>" + System.getProperty("line.separator");

    return contentsHTML;
  }

  private void generateTestPlanSummary(ZipOutputStream out, TestPlan tp,
      TestStoryConfigurationService testStoryConfigurationService) throws IOException {
    ClassLoader classLoader = getClass().getClassLoader();
    String testPlanSummaryStr = IOUtils
        .toString(classLoader.getResourceAsStream("rb" + File.separator + "TestPlanSummary.html"));
    testPlanSummaryStr = testPlanSummaryStr.replace("?TestPlanName?", tp.getName());

    String contentsHTML = "";

    String testStoryConfigId = null;
    if (tp.getTestStoryConfigId() != null) {
      testStoryConfigId = tp.getTestStoryConfigId();
    }
    TestStoryConfiguration testStoryConfiguration = null;
    if (testStoryConfigId != null) {
      testStoryConfiguration = testStoryConfigurationService.findById(testStoryConfigId);
    }

    if (testStoryConfiguration == null) {
      testStoryConfiguration = testStoryConfigurationService.findByAccountId((long) 0).get(0);
    }
    HashMap<Integer, TestStroyEntry> testStroyEntryMap = new HashMap<Integer, TestStroyEntry>();
    for (TestStroyEntry tse : testStoryConfiguration.getTestStoryConfig()) {
      testStroyEntryMap.put(tse.getPosition(), tse);
    }

    String summaryContent = "";

    for (int i = 0; i < testStroyEntryMap.size(); i++) {
      TestStroyEntry tse = testStroyEntryMap.get(i + 1);

      if (tse.isSummaryEntry()) {
        String title = tse.getTitle();
        String content = tp.getTestStoryContent().get(tse.getId());
        if (tp.isEmptyStoryContentIgnored()) {
          if (content != null && !"".equals(content))
            summaryContent = summaryContent + "<h3>" + title + "</h3>" + content + "<br/>";
        } else {
          summaryContent = summaryContent + "<h3>" + title + "</h3>" + content + "<br/>";
        }
      }
    }

    if (!summaryContent.equals("")) {
      contentsHTML = contentsHTML + summaryContent + System.getProperty("line.separator");
    }

    for (int i = 0; i < tp.getChildren().size(); i++) {
      Object child = tp.getChildren().get(i);
      if (child instanceof TestCaseGroup) {
        TestCaseGroup group = (TestCaseGroup) child;
        contentsHTML = generateTestPlanSummaryForTestGroup(contentsHTML, group, tp,
            testStoryConfigurationService);
      } else if (child instanceof TestCase) {
        TestCase tc = (TestCase) child;
        contentsHTML =
            generateTestPlanSummaryForTestCase(contentsHTML, tc, tp, testStoryConfigurationService);
      }
    }
    testPlanSummaryStr = testPlanSummaryStr.replace("?contentsHTML?", contentsHTML);

    byte[] buf = new byte[1024];
    out.putNextEntry(new ZipEntry(tp.getId() + File.separator + "TestPlanSummary.html"));
    InputStream inTestPlanSummary = IOUtils.toInputStream(testPlanSummaryStr);
    int lenTestPlanSummary;
    while ((lenTestPlanSummary = inTestPlanSummary.read(buf)) > 0) {
      out.write(buf, 0, lenTestPlanSummary);
    }
    out.closeEntry();
    inTestPlanSummary.close();
  }

  public InputStream exportProfileXMLZip(Set<String> keySet, ProfileService profileService,
      Long rand) throws IOException {

    ByteArrayOutputStream outputStream = null;
    byte[] bytes;
    outputStream = new ByteArrayOutputStream();
    ZipOutputStream out = new ZipOutputStream(outputStream);

    for (String id : keySet) {
      if (id != null && !id.isEmpty()) {
        this.generateProfileXML(out, id, profileService, rand);
      }
    }
    out.close();
    bytes = outputStream.toByteArray();
    return new ByteArrayInputStream(bytes);
  }

  public InputStream[] exportProfileXMLArrayZip(String id, ProfileService profileService, Long rand)
      throws IOException {
    ByteArrayOutputStream outputStream0 = null;
    ByteArrayOutputStream outputStream1 = null;
    ByteArrayOutputStream outputStream2 = null;

    byte[] bytes0;
    byte[] bytes1;
    byte[] bytes2;

    outputStream0 = new ByteArrayOutputStream();
    outputStream1 = new ByteArrayOutputStream();
    outputStream2 = new ByteArrayOutputStream();

    ZipOutputStream out0 = new ZipOutputStream(outputStream0);
    ZipOutputStream out1 = new ZipOutputStream(outputStream1);
    ZipOutputStream out2 = new ZipOutputStream(outputStream2);

    this.generateProfileXML(out0, out1, out2, id, profileService, rand);

    out0.close();
    out1.close();
    out2.close();

    bytes0 = outputStream0.toByteArray();
    bytes1 = outputStream1.toByteArray();
    bytes2 = outputStream2.toByteArray();

    InputStream[] results = new InputStream[3];
    results[0] = new ByteArrayInputStream(bytes0);
    results[1] = new ByteArrayInputStream(bytes1);
    results[2] = new ByteArrayInputStream(bytes2);

    return results;
  }

  private void visit(SegmentRefOrGroup seog, Map<String, Segment> segmentsMap,
      Map<String, Datatype> datatypesMap, Map<String, Table> tablesMap,
      gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Profile profile, IGAMTDBConn igamtDB) {
    if (seog instanceof SegmentRef) {
      SegmentRef sr = (SegmentRef) seog;
      Segment s = segmentsMap.get(sr.getRef().getId());

      if (s.getName().equals("OBX") || s.getName().equals("MFA") || s.getName().equals("MFE")) {
        String reference = null;
        String referenceTableId = null;

        if (s.getName().equals("OBX")) {
          reference = "2";
        }

        if (s.getName().equals("MFA")) {
          reference = "6";
        }

        if (s.getName().equals("MFE")) {
          reference = "5";
        }

        referenceTableId = this.findValueSetID(s.getValueSetBindings(), reference);

        if (referenceTableId != null) {
          Table table = tablesMap.get(referenceTableId);
          if (table != null) {
            if(table.getHl7Version() == null) table.setHl7Version(s.getHl7Version());
            for (Code c : table.getCodes()) {
              if (c.getValue() != null && table.getHl7Version() != null) {
                Datatype d = this.findDatatypeByNameAndVesionAndScope(c.getValue(),
                    table.getHl7Version(), "HL7STANDARD", datatypesMap);
                if (d == null) {
                  d = igamtDB.findByNameAndVesionAndScope(c.getValue(), table.getHl7Version(),
                      "HL7STANDARD");
                  if (d != null) {
                    this.addDatatypeForDM(d, datatypesMap, igamtDB);
                  }
                }
              }
            }
          }
        }
      }

    } else {
      Group g = (Group) seog;
      for (SegmentRefOrGroup child : g.getChildren()) {
        this.visit(child, segmentsMap, datatypesMap, tablesMap, profile, igamtDB);
      }
    }
  }

  private void addDatatypeForDM(Datatype d, Map<String, Datatype> datatypesMap,
      IGAMTDBConn igamtDB) {
    if (d != null) {
      int randumNum = new SecureRandom().nextInt(100000);
      d.setExt("ForDM" + randumNum);
      datatypesMap.put(d.getId(), d);
      for (Component c : d.getComponents()) {
        this.addDatatypeForDM(igamtDB.findDatatypeById(c.getDatatype().getId()), datatypesMap,
            igamtDB);
      }
    }
  }

  private Datatype findDatatypeByNameAndVesionAndScope(String name, String hl7Version, String scope,
      Map<String, Datatype> datatypesMap) {
    for (String key : datatypesMap.keySet()) {
      Datatype d = datatypesMap.get(key);
      if (d != null) {
        if (d.getName().equals(name) && d.getHl7Version().equals(hl7Version)
            && d.getScope().toString().equals(scope))
          return d;
      }
    }
    return null;
  }

  private String findValueSetID(List<ValueSetOrSingleCodeBinding> valueSetBindings,
      String referenceLocation) {
    for (ValueSetOrSingleCodeBinding vsb : valueSetBindings) {
      if (vsb.getLocation().equals(referenceLocation))
        return vsb.getTableId();
    }
    return null;
  }

  public String[] generateProfileXML(String id, ProfileService profileService) {
    Profile tcamtProfile = profileService.findOne(id);

    if (tcamtProfile != null) {
      IGAMTDBConn igamtDB = new IGAMTDBConn();
      
      if(tcamtProfile.getSourceType().equals("igamt")){
        IGDocument igd = new IGAMTDBConn().findIGDocument(tcamtProfile.getId());
        tcamtProfile = igamtDB.convertIGAMT2TCAMT(igd.getProfile(), igd.getMetaData().getTitle(), igd.getId(), igd.getDateUpdated());
        tcamtProfile.getMetaData().setName(igd.getMetaData().getTitle());
        tcamtProfile.getMetaData().setDescription(igd.getMetaData().getDescription());
        tcamtProfile.getMetaData().setDate(igd.getMetaData().getDate());
        tcamtProfile.setSourceType("igamt");
        tcamtProfile.setAccountId(igd.getAccountId());
      }
      
      
      gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Profile profile =
          new gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Profile();
      profile.setAccountId(tcamtProfile.getAccountId());
      profile.setMetaData(tcamtProfile.getMetaData());
      profile.setMessages(new Messages());
      DocumentMetaData metadata = new DocumentMetaData();
      Map<String, Segment> segmentsMap = new HashMap<String, Segment>();
      Map<String, Datatype> datatypesMap = new HashMap<String, Datatype>();
      Map<String, Table> tablesMap = new HashMap<String, Table>();

      for (Segment s : tcamtProfile.getSegments().getChildren()) {
        if (s != null) {
          segmentsMap.put(s.getId(), s);
        }
      }

      for (Datatype d : tcamtProfile.getDatatypes().getChildren()) {
        if (d != null) {
          datatypesMap.put(d.getId(), d);
        }

      }

      for (Table t : tcamtProfile.getTables().getChildren()) {
        if (t != null) {
          tablesMap.put(t.getId(), t);
        }

      }

      for (Message m : tcamtProfile.getMessages().getChildren()) {
        profile.getMessages().addMessage(m);

        for (SegmentRefOrGroup seog : m.getChildren()) {
          this.visit(seog, segmentsMap, datatypesMap, tablesMap, profile, igamtDB);
        }
      }

      String[] result = new String[3];
      result[0] = new XMLExportTool().serializeProfileToDoc(profile, metadata, segmentsMap, datatypesMap, tablesMap).toXML();
      result[1] = new XMLExportTool().serializeTableXML(profile, metadata, tablesMap).toXML();
      result[2] = new XMLExportTool().serializeConstraintsXML(profile, metadata, segmentsMap, datatypesMap, tablesMap).toXML();

      return result;
    }

    return null;
  }

  private void generateProfileXML(ZipOutputStream out0, ZipOutputStream out1, ZipOutputStream out2,
      String id, ProfileService profileService, Long rand) throws IOException {
    Profile tcamtProfile = profileService.findOne(id);

    if (tcamtProfile != null) {

      IGAMTDBConn igamtDB = new IGAMTDBConn();
      
      if(tcamtProfile.getSourceType().equals("igamt")){
        IGDocument igd = new IGAMTDBConn().findIGDocument(tcamtProfile.getId());
        tcamtProfile = igamtDB.convertIGAMT2TCAMT(igd.getProfile(), igd.getMetaData().getTitle(), igd.getId(), igd.getDateUpdated());
        tcamtProfile.getMetaData().setName(igd.getMetaData().getTitle());
        tcamtProfile.getMetaData().setDescription(igd.getMetaData().getDescription());
        tcamtProfile.getMetaData().setDate(igd.getMetaData().getDate());
        tcamtProfile.setSourceType("igamt");
        tcamtProfile.setAccountId(igd.getAccountId());
      }
      
      
      gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Profile profile =
          new gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Profile();
      profile.setId(tcamtProfile.getId() + rand);
      profile.setAccountId(tcamtProfile.getAccountId());
      profile.setMetaData(tcamtProfile.getMetaData());
      profile.setMessages(new Messages());
      DocumentMetaData metadata = new DocumentMetaData();
      Map<String, Segment> segmentsMap = new HashMap<String, Segment>();
      Map<String, Datatype> datatypesMap = new HashMap<String, Datatype>();
      Map<String, Table> tablesMap = new HashMap<String, Table>();

      for (Segment s : tcamtProfile.getSegments().getChildren()) {
        if (s != null)
          segmentsMap.put(s.getId(), s);
      }

      for (Datatype d : tcamtProfile.getDatatypes().getChildren()) {
        if (d != null)
          datatypesMap.put(d.getId(), d);
      }

      for (Table t : tcamtProfile.getTables().getChildren()) {
        if (t != null) {
          tablesMap.put(t.getId(), t);
        }
      }

      for (Message m : tcamtProfile.getMessages().getChildren()) {
        m.setId(m.getId() + rand);
        profile.getMessages().addMessage(m);

        for (SegmentRefOrGroup seog : m.getChildren()) {
          this.visit(seog, segmentsMap, datatypesMap, tablesMap, profile, igamtDB);
        }
      }

      byte[] buf = new byte[1024];
      out0.putNextEntry(new ZipEntry("Profile.xml"));
      InputStream inTP = null;
      String profileStr = new XMLExportTool()
          .serializeProfileToDoc(profile, metadata, segmentsMap, datatypesMap, tablesMap).toXML();
      System.out.println(profileStr);
      inTP = IOUtils.toInputStream(profileStr);
      int lenTP;
      while ((lenTP = inTP.read(buf)) > 0) {
        out0.write(buf, 0, lenTP);
      }
      out0.closeEntry();
      inTP.close();

      out1.putNextEntry(new ZipEntry("ValueSet.xml"));
      inTP = null;
      String tableStr = new XMLExportTool().serializeTableXML(profile, metadata, tablesMap).toXML();
      System.out.println(tableStr);
      inTP = IOUtils.toInputStream(tableStr);
      lenTP = 0;
      while ((lenTP = inTP.read(buf)) > 0) {
        out1.write(buf, 0, lenTP);
      }
      out1.closeEntry();
      inTP.close();

      out2.putNextEntry(new ZipEntry("Constraints.xml"));
      inTP = null;
      String constraintStr = new XMLExportTool().serializeConstraintsXML(profile, metadata, segmentsMap, datatypesMap, tablesMap).toXML();
      System.out.println(constraintStr);
      inTP = IOUtils.toInputStream(constraintStr);
      lenTP = 0;
      while ((lenTP = inTP.read(buf)) > 0) {
        out2.write(buf, 0, lenTP);
      }
      out2.closeEntry();
      inTP.close();
    }

  }

  private void generateProfileXML(ZipOutputStream out, String id, ProfileService profileService,
      Long rand) throws IOException {
    Profile tcamtProfile = profileService.findOne(id);

    if (tcamtProfile != null) {
      IGAMTDBConn igamtDB = new IGAMTDBConn();
      
      if(tcamtProfile.getSourceType().equals("igamt")){
        IGDocument igd = new IGAMTDBConn().findIGDocument(tcamtProfile.getId());
        tcamtProfile = igamtDB.convertIGAMT2TCAMT(igd.getProfile(), igd.getMetaData().getTitle(), igd.getId(), igd.getDateUpdated());
        tcamtProfile.getMetaData().setName(igd.getMetaData().getTitle());
        tcamtProfile.getMetaData().setDescription(igd.getMetaData().getDescription());
        tcamtProfile.getMetaData().setDate(igd.getMetaData().getDate());
        tcamtProfile.setSourceType("igamt");
        tcamtProfile.setAccountId(igd.getAccountId());
      }

      
      gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Profile profile = new gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Profile();
      profile.setId(tcamtProfile.getId() + rand);
      profile.setAccountId(tcamtProfile.getAccountId());
      profile.setMetaData(tcamtProfile.getMetaData());
      profile.setMessages(new Messages());
      DocumentMetaData metadata = new DocumentMetaData();
      Map<String, Segment> segmentsMap = new HashMap<String, Segment>();
      Map<String, Datatype> datatypesMap = new HashMap<String, Datatype>();
      Map<String, Table> tablesMap = new HashMap<String, Table>();

      for (Segment s : tcamtProfile.getSegments().getChildren()) {
        if (s != null)
          segmentsMap.put(s.getId(), s);
      }

      for (Datatype d : tcamtProfile.getDatatypes().getChildren()) {
        if (d != null)
          datatypesMap.put(d.getId(), d);
      }

      for (Table t : tcamtProfile.getTables().getChildren()) {
        if (t != null) {
          tablesMap.put(t.getId(), t);
        }
      }

      for (Message m : tcamtProfile.getMessages().getChildren()) {
        m.setId(m.getId() + rand);
        profile.getMessages().addMessage(m);

        for (SegmentRefOrGroup seog : m.getChildren()) {
          this.visit(seog, segmentsMap, datatypesMap, tablesMap, profile, igamtDB);
        }
      }

      byte[] buf = new byte[1024];
      out.putNextEntry(new ZipEntry(
          "Global" + File.separator + "Profiles" + File.separator + id + "_Profile.xml"));
      InputStream inTP = null;
      inTP = IOUtils.toInputStream(new XMLExportTool()
          .serializeProfileToDoc(profile, metadata, segmentsMap, datatypesMap, tablesMap).toXML());
      int lenTP;
      while ((lenTP = inTP.read(buf)) > 0) {
        out.write(buf, 0, lenTP);
      }
      out.closeEntry();
      inTP.close();

      out.putNextEntry(new ZipEntry(
          "Global" + File.separator + "Tables" + File.separator + id + "_ValueSet.xml"));
      inTP = null;
      inTP =
          IOUtils.toInputStream(new XMLExportTool().serializeTableXML(profile, metadata, tablesMap).toXML());
      lenTP = 0;
      while ((lenTP = inTP.read(buf)) > 0) {
        out.write(buf, 0, lenTP);
      }
      out.closeEntry();
      inTP.close();

      out.putNextEntry(new ZipEntry(
          "Global" + File.separator + "Constraints" + File.separator + id + "_Constraints.xml"));
      inTP = null;
      inTP = IOUtils.toInputStream(new XMLExportTool().serializeConstraintsXML(profile, metadata, segmentsMap, datatypesMap, tablesMap).toXML());
      lenTP = 0;
      while ((lenTP = inTP.read(buf)) > 0) {
        out.write(buf, 0, lenTP);
      }
      out.closeEntry();
      inTP.close();
    }

  }
}
