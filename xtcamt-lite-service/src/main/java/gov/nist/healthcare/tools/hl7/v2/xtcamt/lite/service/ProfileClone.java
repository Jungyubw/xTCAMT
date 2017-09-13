package gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service;

import org.springframework.stereotype.Service;

import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.Profile;

@Service
public class ProfileClone {
	public Profile clone(Profile original) throws CloneNotSupportedException {
		return original.clone();

	}
}
