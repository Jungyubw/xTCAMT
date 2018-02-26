package gov.nist.healthcare.tools.hl7.v2.tcamt.lite.web.util;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

public class XsdElements {
  public static void main(String args[]) {
    try {
      // parse the document
      DocumentBuilderFactory docBuilderFactory = DocumentBuilderFactory.newInstance();
      DocumentBuilder docBuilder = docBuilderFactory.newDocumentBuilder();
      Document doc = docBuilder.parse(new File("SCRIPT_XML_10_6.xsd"));
      NodeList elementList = doc.getElementsByTagName("xs:element");
      NodeList simpleTypeList = doc.getElementsByTagName("xs:simpleType");
      NodeList complexTypeList = doc.getElementsByTagName("xs:complexType");

      Map<String, Node> elementsMapTypeByName = new HashMap<String, Node>();
      Map<String, Node> elementsMapNonTypeByName = new HashMap<String, Node>();
      Map<String, Node> simpleTypesByName = new HashMap<String, Node>();
      Map<String, Node> complexTypesByName = new HashMap<String, Node>();

      for (int i = 0; i < elementList.getLength(); i++) {
        Element elm = (Element) elementList.item(i);
        if (elm.hasAttributes() && !elm.getAttribute("name").isEmpty()) {
          if (!elm.getAttribute("type").isEmpty()) {
            elementsMapTypeByName.put(elm.getAttribute("name"), elm);
          } else {
            elementsMapNonTypeByName.put(elm.getAttribute("name"), elm);
            // String nm = elm.getAttribute("name");
            // System.out.println(nm);
            // String nm1 = elm.getAttribute("type");
            // System.out.println(nm1);
          }
        } else {
//          String ref = elm.getAttribute("ref");
//          System.out.println(ref);
        }
      }

      for (int i = 0; i < simpleTypeList.getLength(); i++) {
        Element elm = (Element) simpleTypeList.item(i);
        if (elm.hasAttributes() && !elm.getAttribute("name").isEmpty()) {
          simpleTypesByName.put(elm.getAttribute("name"), elm);
//           String nm = elm.getAttribute("name");
//           System.out.println(nm);
        } else {
//          System.out.println(elm);
        }
      }
      
      for (int i = 0; i < complexTypeList.getLength(); i++) {
        Element elm = (Element) complexTypeList.item(i);
        if (elm.hasAttributes() && !elm.getAttribute("name").isEmpty()) {
          complexTypesByName.put(elm.getAttribute("name"), elm);
//           String nm = elm.getAttribute("name");
//           System.out.println(nm);
        } else {
//          System.out.println(elm);
        }
      }
    } catch (ParserConfigurationException e) {
      e.printStackTrace();
    } catch (SAXException e) {
      e.printStackTrace();
    } catch (IOException ed) {
      ed.printStackTrace();
    }
  }
}
