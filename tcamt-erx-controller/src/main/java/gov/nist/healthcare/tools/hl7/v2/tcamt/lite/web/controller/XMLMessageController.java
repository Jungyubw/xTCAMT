package gov.nist.healthcare.tools.hl7.v2.tcamt.lite.web.controller;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;

import javax.xml.parsers.ParserConfigurationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.w3c.dom.Document;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.service.exception.TestPlanSaveException;
import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.web.controller.container.TestData;
import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.web.controller.container.TestDataContainer;
import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.web.controller.container.XMLMessageContainer;
import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.web.util.XMLManager;
import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.web.util.schemareader.Element;
import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.web.util.schemareader.SchemaFile;

@RestController
@RequestMapping("/xmlmessage")

public class XMLMessageController extends CommonController {

  Logger log = LoggerFactory.getLogger(XMLMessageController.class);

  @RequestMapping(value = "/verifiedParsing", method = RequestMethod.POST)
  public TestDataContainer save(@RequestBody XMLMessageContainer xmlMessage)
      throws TestPlanSaveException, SAXException, ParserConfigurationException, IOException {
    ClassLoader classLoader = getClass().getClassLoader();
    File schemaFile = new File(classLoader.getResource("Schemas/transport.xsd").getFile());
    SchemaFile schema = new SchemaFile(schemaFile.getAbsolutePath());

    TestDataContainer testDataContainer = new TestDataContainer();


    // Validation XML against to XSD
    testDataContainer.setErrorMessage(schema.validate(xmlMessage.getMessage(), "EN"));
    if (testDataContainer.getErrorMessage().equals("Valid xml."))
      testDataContainer.setResult(true);
    else
      testDataContainer.setResult(false);
    
    
    if(testDataContainer.isResult()){
    //parsing XSD
      ArrayList<Element> allElementsFromXSD = schema.getElements("Message");
      HashMap<String,Element> xsdElementsMap = new HashMap<String,Element>();
      for(Element elm:allElementsFromXSD){
        xsdElementsMap.put(elm.getFullPath(), elm);
      }
      
//       Pasrsing XML
      TestData data = new TestData();
      Document doc = XMLManager.stringToDom(xmlMessage.getMessage());
      this.visitNode(doc.getChildNodes(), null, null, data, xsdElementsMap);

      testDataContainer.setData(data);  
    }
    
    return testDataContainer;
  }

  private void visitNode(NodeList nodeList, String parentIPath, String parentPath, TestData parentData, HashMap<String,Element> xsdElementsMap) {
    int instanceNum = 1;
    String previousNodeName = "";
    for (int count = 0; count < nodeList.getLength(); count++) {
      Node tempNode = nodeList.item(count);
      if (tempNode.getNodeType() == Node.ELEMENT_NODE) {
        
        if(previousNodeName.equals(tempNode.getLocalName())){
          instanceNum = instanceNum + 1;
        }else {
          instanceNum = 1;
        }
        
        previousNodeName = tempNode.getLocalName();
        
        String currentIPath = null;
        String currentPath = null;
        
        if(parentPath == null) currentPath = tempNode.getLocalName();
        else currentPath = parentPath + "/" + tempNode.getLocalName();     
        
        if(instanceNum == 1){
          if(parentIPath == null) currentIPath = tempNode.getLocalName();
          else currentIPath = parentIPath + "/" + tempNode.getLocalName();          
        }else{
          if(parentIPath == null) currentIPath = tempNode.getLocalName() + "[" + instanceNum + "]";
          else currentIPath = parentIPath + "/" + tempNode.getLocalName() + "[" + instanceNum + "]";  
        }
        
        TestData data = new TestData();
        parentData.getChildren().add(data);

        Element elm = xsdElementsMap.get(currentPath);
        data.setiPath(currentIPath);
        data.updateElement(elm);
        

        if(isLeafNode(tempNode)){
          data.setValue(tempNode.getTextContent());
          data.setLeafNode(true);
        }else {
          data.setLeafNode(false);
        }
        
        if (tempNode.hasAttributes()) {
          NamedNodeMap nodeMap = tempNode.getAttributes();
          for (int i = 0; i < nodeMap.getLength(); i++) {
            Node node = nodeMap.item(i);
            
            TestData childData = new TestData();
            String attrData = elm.getAttributes().get(node.getLocalName());
            if(attrData != null){
              childData.updateAttribute(attrData);
              data.getChildren().add(childData);  
            }
            
          }
        }
        
        if (tempNode.hasChildNodes()) {
          
          visitNode(tempNode.getChildNodes(),currentIPath, currentPath, data, xsdElementsMap);
        }
        
       
      }
    }
  }

  /**
   * @param tempNode
   * @return
   */
  private boolean isLeafNode(Node node) {
    for (int count = 0; count < node.getChildNodes().getLength(); count++) {
      if (node.getChildNodes().item(count).getNodeType() == Node.ELEMENT_NODE) {
        return false;
      }
    }
    return true;
  }

}
