package gov.nist.healthcare.tools.hl7.v2.tcamt.lite.web.util;

import org.apache.xerces.xs.XSElementDeclaration;
import org.apache.xerces.xs.XSImplementation;
import org.apache.xerces.xs.XSLoader;
import org.apache.xerces.xs.XSModel;
import org.apache.xerces.xs.XSTypeDefinition;
import org.w3c.dom.bootstrap.DOMImplementationRegistry;

public class XSDTester {

  public static void main(String[] args) {
    // TODO Auto-generated method stub
    System.out.println("START");
  try {
 // Get DOM Implementation using DOM Registry
    System.setProperty(DOMImplementationRegistry.PROPERTY, "org.apache.xerces.dom.DOMXSImplementationSourceImpl");
    DOMImplementationRegistry registry = DOMImplementationRegistry.newInstance();

    XSImplementation impl = 
        (XSImplementation) registry.getDOMImplementation("XS-Loader");

    XSLoader schemaLoader = impl.createXSLoader(null);
    XSModel model = schemaLoader.loadURI("SCRIPT_XML_10_6.xsd");
    XSElementDeclaration root  = model.getElementDeclaration("Message", "http://www.ncpdp.org/schema/SCRIPT");
    visit(model, root);
    
    System.out.println(root);
  } catch (ClassNotFoundException e) {
    // TODO Auto-generated catch block
    e.printStackTrace();
  } catch (InstantiationException e) {
    // TODO Auto-generated catch block
    e.printStackTrace();
  } catch (IllegalAccessException e) {
    // TODO Auto-generated catch block
    e.printStackTrace();
  } catch (ClassCastException e) {
    // TODO Auto-generated catch block
    e.printStackTrace();
  } 
  }

  private static void visit(XSModel model, XSElementDeclaration found) {
    XSTypeDefinition xSTypeDefinition = model.getTypeDefinition(found.getTypeDefinition().getName(), found.getNamespace());
//    System.out.println(xSTypeDefinition.get);
  }

}
