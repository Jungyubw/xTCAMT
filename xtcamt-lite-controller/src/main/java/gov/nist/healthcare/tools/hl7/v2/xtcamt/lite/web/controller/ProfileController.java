package gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.web.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import gov.nist.healthcare.nht.acmgt.dto.ResponseMessage;
import gov.nist.healthcare.nht.acmgt.dto.domain.Account;
import gov.nist.healthcare.nht.acmgt.repo.AccountRepository;
import gov.nist.healthcare.nht.acmgt.service.UserService;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.IGDocument;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.IGDocumentScope;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Message;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.ProfileDataStr;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.MessageAbstract;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.MessagesAbstract;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.Profile;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.ProfileAbstract;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.ProfileDeleteException;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.ProfileService;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.TestPlanListException;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.impl.IGAMTDBConn;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.web.exception.UserAccountNotFoundException;

@RestController
@RequestMapping("/profiles")
public class ProfileController extends CommonController {
	@Autowired
	UserService userService;
	
	@Autowired
	ProfileService profileService;

	@Autowired
	AccountRepository accountRepository;
	
	@RequestMapping(method = RequestMethod.GET, produces = "application/json")
	public List<ProfileAbstract> getAllProfiles() throws Exception {
		User u = userService.getCurrentUser();
		Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
		if (account == null) {
			throw new Exception();
		}
		
		IGAMTDBConn con = new IGAMTDBConn();
		try {
			List<Profile> result = new ArrayList<Profile>();
			List<ProfileAbstract> abstractResult = new ArrayList<ProfileAbstract>();
			List<IGDocument> igdocs = this.userIGDocuments();
			for(IGDocument igd: igdocs){
			  if(igd.getScope().equals(IGDocumentScope.USER)){
			    Profile tcamtP = profileService.findOne(igd.getId());
                if(tcamtP == null || !tcamtP.getLastUpdatedDate().equals(igd.getDateUpdated())){
                    Profile p = con.convertIGAMT2TCAMT(igd.getProfile(), igd.getMetaData().getTitle(), igd.getId(), igd.getDateUpdated());
                    p.getMetaData().setName(igd.getMetaData().getTitle());
                    p.getMetaData().setDescription(igd.getMetaData().getDescription());
                    p.getMetaData().setDate(igd.getMetaData().getDate());
                    p.setSourceType("igamt");
                    p.setAccountId(igd.getAccountId());
                    p.setSegments(null);
                    p.setDatatypes(null);
                    p.setTables(null);
                    profileService.save(p);
                    result.add(p);
                }else{
                    result.add(tcamtP);
                }
			  }
				
			}
			List<Profile> privateProfiles = getAllPrivateProfiles(account); 
			List<Profile> publicProfiles = getAllPublicProfiles(); 
			result.addAll(privateProfiles);
			result.addAll(publicProfiles);
			
			for(Profile p : result){
				ProfileAbstract pa = new ProfileAbstract();
				pa.setAccountId(p.getAccountId());
				pa.setId(p.getId());
				pa.setLastUpdatedDate(p.getLastUpdatedDate());
				pa.setMetaData(p.getMetaData());
				pa.setSourceType(p.getSourceType());
				
				MessagesAbstract msa = new MessagesAbstract();
				msa.setId(p.getMessages().getId());
				for(Message m : p.getMessages().getChildren()){
					MessageAbstract ma = new MessageAbstract();
					ma.setDescription(m.getDescription());
					ma.setEvent(m.getEvent());
					ma.setId(m.getId());
					ma.setIdentifier(m.getIdentifier());
					ma.setMessageID(m.getMessageID());
					ma.setMessageType(m.getMessageType());
					ma.setName(m.getName());
					ma.setPosition(m.getPosition());
					ma.setStructID(m.getStructID());
					msa.addMessage(ma);
				}
				pa.setMessages(msa);
				
				abstractResult.add(pa);
			}
			
			return abstractResult;
		} catch (Exception e) {
			throw new Exception(e);
		}
	}
	
	@RequestMapping(value = "/{id}", method = RequestMethod.GET)
	public Profile get(@PathVariable("id") String id) throws Exception {
		try {
			Profile p =  profileService.findOne(id);
			
			if(p.getSourceType().equals("igamt")){
			  IGAMTDBConn con = new IGAMTDBConn();
			  IGDocument igd = new IGAMTDBConn().findIGDocument(p.getId());
			  p = con.convertIGAMT2TCAMT(igd.getProfile(), igd.getMetaData().getTitle(), igd.getId(), igd.getDateUpdated());
              p.getMetaData().setName(igd.getMetaData().getTitle());
              p.getMetaData().setDescription(igd.getMetaData().getDescription());
              p.getMetaData().setDate(igd.getMetaData().getDate());
              p.setSourceType("igamt");
              p.setAccountId(igd.getAccountId());
			  
			}
			
			return p;
			
		} catch (Exception e) {
			throw new Exception(e);
		}
	}
	
	@RequestMapping(value = "/{id}/delete", method = RequestMethod.POST)
	public ResponseMessage delete(@PathVariable("id") String id) throws ProfileDeleteException {
		try {
			User u = userService.getCurrentUser();
			Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
			if (account == null) throw new UserAccountNotFoundException();
			profileService.delete(id);
			return new ResponseMessage(ResponseMessage.Type.success, "profileDeletedSuccess", null);
		} catch (RuntimeException e) {
			throw new ProfileDeleteException(e);
		} catch (Exception e) {
			throw new ProfileDeleteException(e);
		}
	}

	@RequestMapping(value = "/importXMLFiles", method = RequestMethod.POST)
	public void importXMLFiles(@RequestBody ProfileDataStr pds) throws Exception {
		User u = userService.getCurrentUser();
		Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
		if (account == null) {
			throw new Exception();
		}

		Profile p = profileService.readXML2Profile(pds);
		p.setAccountId(account.getId());
		p.setLastUpdatedDate(new Date());
		p.setSourceType("private");
		profileService.save(p);
	}
	
	@RequestMapping(value = "/replaceXMLFiles/{id}", method = RequestMethod.POST)
	public void replaceXMLFiles(@RequestBody ProfileDataStr pds, @PathVariable("id") String id) throws Exception {
		User u = userService.getCurrentUser();
		Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
		if (account == null) {
			throw new Exception();
		}
		
		Profile oldP = profileService.findOne(id);
		
		if(oldP != null){
			HashMap<String, String> messageIdIdentifierMap = new HashMap<String, String>();
			
			for(Message m:oldP.getMessages().getChildren()){
				if(m.getIdentifier() != null){
					messageIdIdentifierMap.put(m.getIdentifier(), m.getId());	
				}
			}

			Profile p = profileService.readXML2Profile(pds);
			p.setId(oldP.getId());
			p.setAccountId(oldP.getAccountId());
			p.setLastUpdatedDate(new Date());
			p.setSourceType("private");
			
			for(Message m:p.getMessages().getChildren()){
				if(m.getIdentifier() != null){
					String messageID = messageIdIdentifierMap.get(m.getIdentifier());
					if(messageID != null && !messageID.equals("")){
						m.setId(messageID);
					}
				}
			}
			profileService.save(p);	
		}
	}
	
	
	@RequestMapping(value = "/importXMLFilesForPublic", method = RequestMethod.POST)
	public void importXMLFilesForPublic(@RequestBody ProfileDataStr pds) throws Exception {
		User u = userService.getCurrentUser();
		Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
		if (account == null) {
			throw new Exception();
		}

		Profile p = profileService.readXML2Profile(pds);
		p.setAccountId((long) 0);
		p.setLastUpdatedDate(new Date());
		p.setSourceType("public");
		profileService.save(p);
	}
	
	private List<IGDocument> userIGDocuments() throws Exception {
		User u = userService.getCurrentUser();
		Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
		if (account == null) {
			throw new Exception();
		}
		return new IGAMTDBConn().getUserDocument(account.getId());
	}
	
	private List<Profile> getAllPrivateProfiles(Account account) throws UserAccountNotFoundException, TestPlanListException {
		try {
			return profileService.findByAccountIdAndSourceType(account.getId(),"private");
		} catch (RuntimeException e) {
			throw new TestPlanListException(e);
		} catch (Exception e) {
			throw new TestPlanListException(e);
		}
	}
	
	private List<Profile> getAllPublicProfiles() throws TestPlanListException {
		try {
			return profileService.findByAccountIdAndSourceType((long) 0, "public");
		} catch (RuntimeException e) {
			throw new TestPlanListException(e);
		} catch (Exception e) {
			throw new TestPlanListException(e);
		}
	}
}
