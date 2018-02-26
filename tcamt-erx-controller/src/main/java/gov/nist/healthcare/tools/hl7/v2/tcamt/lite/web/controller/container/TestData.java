/**
 * This software was developed at the National Institute of Standards and Technology by employees of
 * the Federal Government in the course of their official duties. Pursuant to title 17 Section 105
 * of the United States Code this software is not subject to copyright protection and is in the
 * public domain. This is an experimental system. NIST assumes no responsibility whatsoever for its
 * use by other parties, and makes no guarantees, expressed or implied, about its quality,
 * reliability, or any other characteristic. We would appreciate acknowledgement if the software is
 * used. This software can be redistributed and/or modified freely provided that any derivative
 * works bear some notice that they are derived from it, and any modified versions bear some notice
 * that they have been modified.
 */
package gov.nist.healthcare.tools.hl7.v2.tcamt.lite.web.controller.container;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.web.util.schemareader.Element;

/**
 * @author jungyubw
 *
 */
public class TestData {

  /*
   * 
   * System.out.println(elm.getFullPath()); System.out.println(elm.getInfo());
   * System.out.println(elm.getType()); System.out.println(elm.getMaxOccurs());
   * System.out.println(elm.getMinOccurs()); System.out.println(elm.getName());
   * System.out.println(elm.getDepth()); System.out.println(elm.getAttributes().keySet());
   * System.out.println(elm.getRestrictions());
   * 
   * attributeDecl.getName(), xsAttributeType.getName() + ", " + use + ", " +
   * attributeDecl.getFixedValue() + ", " + attributeDecl.getDefaultValue()
   */
  
  /**
   * @param elm
   */
  public void updateElement(Element elm) {
    this.setPath(elm.getFullPath());
    this.setDepth(elm.getDepth());
    this.setInfo(elm.getInfo());
    this.setMaxOccurs(elm.getMaxOccurs());
    this.setMinOccurs(elm.getMinOccurs());
    this.setName(elm.getName());
    this.setRestrictions(elm.getRestrictions());
    this.setType(RowType.ELEMENT); 
    this.setNodeType(elm.getType());
  }
  
  /**
   * @param attrData
   */
  public void updateAttribute(String attrData) {
    this.setType(RowType.ATTRIBUTE);
    String[] attrDataSet = attrData.split(", ");
    this.setName(attrDataSet[0]);
    this.setUse(attrDataSet[1]);
    this.setFixedValue(attrDataSet[2]);
    this.setDefaultValue(attrDataSet[3]);
  }


  private List<TestData> children = new ArrayList<TestData>();

  private String iPath;
  private String path;

  private RowType type;
  private String nodeType;
  private String name;
  private String value;
  private String info;
  private boolean isLeafNode;

  private int depth;
  private int maxOccurs;
  private int minOccurs;
  private HashMap<String, String> restrictions = new HashMap<String, String>();

  // Attibute
  private String use;
  private String fixedValue;
  private String defaultValue;

  public List<TestData> getChildren() {
    return children;
  }

  public void setChildren(List<TestData> children) {
    this.children = children;
  }

  public String getiPath() {
    return iPath;
  }

  public void setiPath(String iPath) {
    this.iPath = iPath;
  }

  public String getPath() {
    return path;
  }

  public void setPath(String path) {
    this.path = path;
  }

  public RowType getType() {
    return type;
  }

  public void setType(RowType type) {
    this.type = type;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getValue() {
    return value;
  }

  public void setValue(String value) {
    this.value = value;
  }

  public String getInfo() {
    return info;
  }

  public void setInfo(String info) {
    this.info = info;
  }

  public int getDepth() {
    return depth;
  }

  public void setDepth(int depth) {
    this.depth = depth;
  }

  public int getMaxOccurs() {
    return maxOccurs;
  }

  public void setMaxOccurs(int maxOccurs) {
    this.maxOccurs = maxOccurs;
  }

  public int getMinOccurs() {
    return minOccurs;
  }

  public void setMinOccurs(int minOccurs) {
    this.minOccurs = minOccurs;
  }

  public HashMap<String, String> getRestrictions() {
    return restrictions;
  }

  public void setRestrictions(HashMap<String, String> restrictions) {
    this.restrictions = restrictions;
  }

  public String getUse() {
    return use;
  }

  public void setUse(String use) {
    this.use = use;
  }

  public String getFixedValue() {
    return fixedValue;
  }

  public void setFixedValue(String fixedValue) {
    this.fixedValue = fixedValue;
  }

  public String getDefaultValue() {
    return defaultValue;
  }

  public void setDefaultValue(String defaultValue) {
    this.defaultValue = defaultValue;
  }

  public String getNodeType() {
    return nodeType;
  }

  public void setNodeType(String nodeType) {
    this.nodeType = nodeType;
  }

  public boolean isLeafNode() {
    return isLeafNode;
  }

  public void setLeafNode(boolean isLeafNode) {
    this.isLeafNode = isLeafNode;
  }
  
  
}
