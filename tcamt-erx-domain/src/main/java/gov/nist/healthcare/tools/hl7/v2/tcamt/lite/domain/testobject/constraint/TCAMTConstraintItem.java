package gov.nist.healthcare.tools.hl7.v2.tcamt.lite.domain.testobject.constraint;

import java.util.ArrayList;
import java.util.List;

public class TCAMTConstraintItem {

  private String iPath;
  private String name;
  private List<String> listData = new ArrayList<String>();
  private TestDataCategorization testDataCategorization;


  public String getiPath() {
    return iPath;
  }

  public void setiPath(String iPath) {
    this.iPath = iPath;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public List<String> getListData() {
    return listData;
  }

  public void setListData(List<String> listData) {
    this.listData = listData;
  }

  public TestDataCategorization getTestDataCategorization() {
    return testDataCategorization;
  }

  public void setTestDataCategorization(TestDataCategorization testDataCategorization) {
    this.testDataCategorization = testDataCategorization;
  }
}
