package gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.web.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import gov.nist.healthcare.nht.acmgt.dto.domain.Account;
import gov.nist.healthcare.nht.acmgt.repo.AccountRepository;
import gov.nist.healthcare.nht.acmgt.service.UserService;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.IGDocument;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.Profile;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.ProfileService;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.impl.IGAMTDBConn;

@RestController
@RequestMapping("/igdocuments")
public class IGDocumentController extends CommonController {
	@Autowired
	UserService userService;
	
	@Autowired
	ProfileService profileService;

	@Autowired
	AccountRepository accountRepository;

	@RequestMapping(method = RequestMethod.GET, produces = "application/json")
	public List<Profile> getIGDocumentList() throws Exception {
		IGAMTDBConn con = new IGAMTDBConn();
		
		try {
			List<Profile> result = new ArrayList<Profile>();
			List<IGDocument> igdocs = this.userIGDocuments();
			for(IGDocument igd: igdocs){
				Profile tcamtP = profileService.findOne(igd.getId());
				if(tcamtP == null || !tcamtP.getLastUpdatedDate().equals(igd.getDateUpdated())){
					Profile p = con.convertIGAMT2TCAMT(igd.getProfile(), igd.getMetaData().getTitle(), igd.getId(), igd.getDateUpdated());
					p.getMetaData().setName(igd.getMetaData().getTitle());
					p.getMetaData().setDescription(igd.getMetaData().getDescription());
					p.getMetaData().setDate(igd.getMetaData().getDate());
					p.setSourceType("igamt");
					p.setAccountId(igd.getAccountId());
					
					profileService.save(p);
					result.add(p);
				}else{
					result.add(tcamtP);
				}
			}
			
			return result;
		} catch (Exception e) {
			throw new Exception(e);
		}
	}

	private List<IGDocument> userIGDocuments() throws Exception {
		User u = userService.getCurrentUser();
		Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
		if (account == null) {
			throw new Exception();
		}
		return new IGAMTDBConn().getUserDocument(account.getId());
	}

	@RequestMapping(value = "/{id}/tcamtProfile", method = RequestMethod.GET, produces = "application/json")
	public Profile getTCAMTProfile(@PathVariable("id") String id)
			throws Exception {

		IGAMTDBConn con = new IGAMTDBConn();
		User u = userService.getCurrentUser();
		Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
		if (account == null) {
			throw new Exception();
		}

		IGDocument igDocument = con.findIGDocument(id);
		
		
		return con.convertIGAMT2TCAMT(igDocument.getProfile(), igDocument.getMetaData().getTitle(), id, igDocument.getDateUpdated());
	}
}
