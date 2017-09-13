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

package gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.web.config;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;

import gov.nist.healthcare.nht.acmgt.dto.domain.Account;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Datatype;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.IGDocument;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.IGDocumentScope;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Message;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Segment;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Table;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.ER7Template;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.MessageTemplate;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.Template;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.TestCase;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.TestCaseGroup;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.TestCaseOrGroup;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.TestPlan;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.TestStep;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.Profile;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.ProfileException;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.ProfileService;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.TemplateService;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.TestPlanException;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.TestPlanService;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.TestStoryConfigurationService;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.impl.IGAMTDBConn;

@Service
public class Bootstrap implements InitializingBean {

  private final Logger logger = LoggerFactory.getLogger(this.getClass());

  @Autowired
  TestPlanService testplanService;

  @Autowired
  ProfileService profileService;

  @Autowired
  TemplateService templateService;

  @Autowired
  TestStoryConfigurationService testStoryConfigurationService;

  /*
   * (non-Javadoc)
   * 
   * @see org.springframework.beans.factory.InitializingBean#afterPropertiesSet()
   */
  @Override
  public void afterPropertiesSet() throws Exception {
    // updateHL7Version();
    // updateLongIDforTestPlan();
    //
    updateMessageTemplates();
    resetIGAMTProfile();
  }

  private void updateMessageTemplates() {
    List<Template> templates = templateService.findAll();
    for (Template t : templates) {
      for (ER7Template et : t.getEr7Templates()) {
        Profile p = profileService.findOne(et.getIntegrationProfileId());
        if(p!= null){
          for (Message m : p.getMessages().getChildren()) {
            if (m.getId().equals(et.getConformanceProfileId())) {
              et.setStructID(m.getStructID());
            }
          }  
        }
      }

      for (MessageTemplate mt : t.getMessageTemplates()) {
        Profile p = profileService.findOne(mt.getIntegrationProfileId());
        if(p!= null){
          for (Message m : p.getMessages().getChildren()) {
            if (m.getId().equals(mt.getConformanceProfileId())) {
              mt.setStructID(m.getStructID());
            }
          } 
        }
      }
      templateService.save(t);
    }
    

  }
 
  private void resetIGAMTProfile() throws ProfileException {
    List<Profile> profiles = profileService.findAll();
    
    List<String> ids = new ArrayList<String>(); 
    
    for (Profile p : profiles) {
      if (p.getSourceType().equals("igamt")) {
        ids.add(p.getId());
        profileService.delete(p.getId());
      }
    }
    IGAMTDBConn con = new IGAMTDBConn();
    for(String id:ids){
      IGDocument igd = con.findIGDocument(id);
      System.out.println(igd.getScope());
      if(igd.getScope().equals(IGDocumentScope.USER)){
        Profile p = con.convertIGAMT2TCAMT(igd.getProfile(), igd.getMetaData().getTitle(), igd.getId(), igd.getDateUpdated());
        p.getMetaData().setName(igd.getMetaData().getTitle());
        p.getMetaData().setDescription(igd.getMetaData().getDescription());
        p.getMetaData().setDate(igd.getMetaData().getDate());
        p.setSourceType("igamt");
        p.setSegments(null);
        p.setDatatypes(null);
        p.setTables(null);
        p.setAccountId(igd.getAccountId());
        profileService.save(p); 
      }
    }
  }

  private void updateLongIDforTestPlan() throws TestPlanException {
    List<TestPlan> tps = testplanService.findAll();

    for (TestPlan tp : tps) {
      if (tp.getLongId() == null) {
        long range = Long.MAX_VALUE;
        Random r = new Random();
        tp.setLongId((long) (r.nextDouble() * range));
      }

      for (TestCaseOrGroup tcog : tp.getChildren()) {
        visit(tcog);
      }

      testplanService.save(tp);
    }

  }

  private void visit(TestCaseOrGroup tcog) {
    if (tcog.getLongId() == null) {
      long range = Long.MAX_VALUE;
      Random r = new Random();
      tcog.setLongId((long) (r.nextDouble() * range));
    }

    if (tcog instanceof TestCase) {
      TestCase tc = (TestCase) tcog;
      for (TestStep child : tc.getTeststeps()) {
        if (child.getLongId() == null) {
          long range = Long.MAX_VALUE;
          Random r = new Random();
          child.setLongId((long) (r.nextDouble() * range));
        }
      }

    } else if (tcog instanceof TestCaseGroup) {
      TestCaseGroup group = (TestCaseGroup) tcog;
      for (TestCaseOrGroup child : group.getChildren()) {
        visit(child);
      }
    }

  }

  private void updateHL7Version() throws ProfileException {
    List<Profile> profiles = profileService.findAll();

    for (Profile p : profiles) {
      if (p.getSourceType().equals("private")) {
        String version = p.getMetaData().getHl7Version();

        for (Segment s : p.getSegments().getChildren()) {
          if (s.getHl7Version() == null) {
            s.setHl7Version(version);
          }
        }

        for (Datatype d : p.getDatatypes().getChildren()) {
          if (d.getHl7Version() == null) {
            d.setHl7Version(version);
          }
        }

        for (Table t : p.getTables().getChildren()) {
          if (t.getHl7Version() == null) {
            t.setHl7Version(version);
          }
        }

        profileService.save(p);

      }
    }

  }

  public Logger getLogger() {
    return logger;
  }
}
