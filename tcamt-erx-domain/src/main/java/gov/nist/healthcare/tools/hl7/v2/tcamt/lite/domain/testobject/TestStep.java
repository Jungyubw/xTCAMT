package gov.nist.healthcare.tools.hl7.v2.tcamt.lite.domain.testobject;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Random;

import javax.persistence.Id;

import org.bson.types.ObjectId;

import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.domain.testobject.constraint.TCAMTConstraintItem;

public class TestStep implements Serializable, Cloneable {

  /**
   * 
   */
  private static final long serialVersionUID = 1164104159252764632L;

  @Id
  private String id;

  private Long longId;

  private String name;

  private String description;

  private HashMap<String, String> testStoryContent = new HashMap<String, String>();

  private String xmlMessage;

  private Integer version;

  private TestStepType teststepType = TestStepType.SUT_MANUAL;

  private HashMap<String, TCAMTConstraintItem> tcamtConstraintMap =
      new HashMap<String, TCAMTConstraintItem>();

  private String testStoryConfigId;
  
  public TestStep() {
    super();
  }

  public TestStep(String id, Long longId, String name, String description,
      HashMap<String, String> testStoryContent, String xmlMessage, Integer version,
      TestStepType teststepType, HashMap<String, TCAMTConstraintItem> tcamtConstraintMap,
      String testStoryConfigId) {
    super();
    this.id = id;
    this.longId = longId;
    this.name = name;
    this.description = description;
    this.testStoryContent = testStoryContent;
    this.xmlMessage = xmlMessage;
    this.version = version;
    this.teststepType = teststepType;
    this.setTcamtConstraintMap(tcamtConstraintMap);
    this.testStoryConfigId = testStoryConfigId;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public Long getLongId() {
    return longId;
  }

  public void setLongId(Long longId) {
    this.longId = longId;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public HashMap<String, String> getTestStoryContent() {
    return testStoryContent;
  }

  public void setTestStoryContent(HashMap<String, String> testStoryContent) {
    this.testStoryContent = testStoryContent;
  }

  public String getXmlMessage() {
    return xmlMessage;
  }

  public void setXmlMessage(String xmlMessage) {
    this.xmlMessage = xmlMessage;
  }

  public Integer getVersion() {
    return version;
  }

  public void setVersion(Integer version) {
    this.version = version;
  }

  public String getTestStoryConfigId() {
    return testStoryConfigId;
  }

  public void setTestStoryConfigId(String testStoryConfigId) {
    this.testStoryConfigId = testStoryConfigId;
  }

  public static long getSerialversionuid() {
    return serialVersionUID;
  }

  @Override
  public TestStep clone() throws CloneNotSupportedException {
    TestStep cloned = (TestStep) super.clone();
    cloned.setId(ObjectId.get().toString());
    long range = Long.MAX_VALUE;
    Random r = new Random();
    cloned.setLongId((long) (r.nextDouble() * range));

    return cloned;
  }

  public TestStepType getTeststepType() {
    return teststepType;
  }

  public void setTeststepType(TestStepType teststepType) {
    this.teststepType = teststepType;
  }

  public HashMap<String, TCAMTConstraintItem> getTcamtConstraintMap() {
    return tcamtConstraintMap;
  }

  public void setTcamtConstraintMap(HashMap<String, TCAMTConstraintItem> tcamtConstraintMap) {
    this.tcamtConstraintMap = tcamtConstraintMap;
  }


}
