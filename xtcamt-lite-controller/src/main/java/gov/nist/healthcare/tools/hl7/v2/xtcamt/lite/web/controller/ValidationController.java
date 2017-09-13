package gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.web.controller;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import gov.nist.healthcare.nht.acmgt.repo.AccountRepository;
import gov.nist.healthcare.nht.acmgt.service.UserService;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.ConstraintContainer;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.ProfileService;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.web.util.ExportUtil;
import gov.nist.healthcare.unified.enums.Context;
import gov.nist.healthcare.unified.model.EnhancedReport;
import gov.nist.healthcare.unified.proxy.ValidationProxy;
import hl7.v2.validation.content.ConformanceContext;
import hl7.v2.validation.content.DefaultConformanceContext;
import hl7.v2.validation.vs.ValueSetLibrary;
import hl7.v2.validation.vs.ValueSetLibraryImpl;

@RestController
public class ValidationController {

	Logger log = LoggerFactory.getLogger(TestPlanController.class);

	@Autowired
	UserService userService;
	
	@Autowired
	ProfileService profileService;

	@Autowired
	AccountRepository accountRepository;

	@RequestMapping(value = "/validation", method = RequestMethod.POST)
	public String Validate(@RequestParam(value = "message") String message,
			@RequestParam(value = "igDocumentId") String igDocumentId,
			@RequestParam(value = "conformanceProfileId") String conformanceProfileId,
			@RequestParam(value = "context") String context,
			@RequestBody ConstraintContainer cbConstraints) throws Exception {
		ExportUtil util = new ExportUtil();
		String html="";
		String error="";

		String[] xmls = util.generateProfileXML(igDocumentId, profileService);
		
		if(xmls != null){
			String profileXML = xmls[0];
			String valueSetXML = xmls[1];
			String constraintsXML = xmls[2];
			String testStepConstraintXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + System.getProperty("line.separator") + cbConstraints.getConstraint();
			
			System.out.println(message);
			System.out.println(profileXML);
			System.out.println(valueSetXML);
			System.out.println(constraintsXML);
			System.out.println(testStepConstraintXML);
			String response = "";
			try {
				ValidationProxy vp = new ValidationProxy("Unified Report Test Application", "NIST");
				EnhancedReport report = new EnhancedReport();
				InputStream vsLibXML = new ByteArrayInputStream(valueSetXML.getBytes(StandardCharsets.UTF_8));
				ValueSetLibrary valueSetLibrary = ValueSetLibraryImpl.apply(vsLibXML).get();

				if (context.equals("free")) {
					InputStream contextXML = new ByteArrayInputStream(constraintsXML.getBytes(StandardCharsets.UTF_8));
					List<InputStream> confContexts = Arrays.asList(contextXML);
					ConformanceContext cc = DefaultConformanceContext.apply(confContexts).get();
					report = vp.validate(message, profileXML, cc, valueSetLibrary, conformanceProfileId, Context.Free);
				} else if (context.equals("based")) {
					InputStream contextTCAMTXML = new ByteArrayInputStream(testStepConstraintXML.getBytes(StandardCharsets.UTF_8));
					InputStream contextIGAMTXML = new ByteArrayInputStream(constraintsXML.getBytes(StandardCharsets.UTF_8));
					List<InputStream> confContexts = Arrays.asList(contextIGAMTXML,contextTCAMTXML);
					ConformanceContext cc = DefaultConformanceContext.apply(confContexts).get();
					report = vp.validate(message, profileXML, cc, valueSetLibrary, conformanceProfileId, Context.Based);
				}
				response  = report.to("json").toString();
				html = report.render("report", null);
			} catch (Exception e) {
				error=e.getMessage();
				e.printStackTrace();
			}
			JSONObject obj = new JSONObject();
			obj.put("json", response);
			obj.put("html",html);
			obj.put("error",error);
			return obj.toString();	
		}
		
		return null;
	}
}
