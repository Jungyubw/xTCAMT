/**
 * This software was developed at the National Institute of Standards and Technology by employees
 * of the Federal Government in the course of their official duties. Pursuant to title 17 Section 105 of the
 * United States Code this software is not subject to copyright protection and is in the public domain.
 * This is an experimental system. NIST assumes no responsibility whatsoever for its use by other parties,
 * and makes no guarantees, expressed or implied, about its quality, reliability, or any other characteristic.
 * We would appreciate acknowledgement if the software is used. This software can be redistributed and/or
 * modified freely provided that any derivative works bear some notice that they are derived from it, and any
 * modified versions bear some notice that they have been modified.
 */

/**
 * 
 * @author Jungyub Woo
 * 
 */

package gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service;

import java.util.List;

import org.springframework.stereotype.Service;

import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.ProfileDataStr;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.Profile;

@Service
public interface ProfileService {
	
	public Profile save(Profile p) throws ProfileException;

	public void delete(String id);

	public Profile findOne(String id);

	public List<Profile> findAll();

	public List<Profile> findByAccountId(Long accountId);
	
	public List<Profile> findByAccountIdAndSourceType(Long accountId, String sourceType);

	public Profile clone(Profile ig) throws CloneNotSupportedException;

	public Profile apply(Profile ig) throws ProfileSaveException;
	
	public Profile readXML2Profile(ProfileDataStr pds) throws ProfileException;
}
