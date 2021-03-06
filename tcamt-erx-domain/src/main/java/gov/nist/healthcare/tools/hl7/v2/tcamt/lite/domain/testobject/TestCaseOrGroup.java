package gov.nist.healthcare.tools.hl7.v2.tcamt.lite.domain.testobject;

import javax.persistence.Id;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeInfo.As;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = As.PROPERTY, property = "type")
@JsonSubTypes({@JsonSubTypes.Type(value = TestCase.class, name = "TESTCASE"),
    @JsonSubTypes.Type(value = TestCaseGroup.class, name = "GROUP")})
public abstract class TestCaseOrGroup {
  @Id
  protected String id;

  protected Long longId;

  protected String name;

  protected String testStoryConfigId;

  protected String description = "";

  protected Integer version;

  protected CaseOrGroup type;

  public TestCaseOrGroup() {
    super();
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
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

  public Long getLongId() {
    return longId;
  }

  public void setLongId(Long longId) {
    this.longId = longId;
  }

  public CaseOrGroup getType() {
    return type;
  }

  public void setType(CaseOrGroup type) {
    this.type = type;
  }



}
