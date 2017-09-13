package gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service;

import java.util.List;

import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.util.ProfilePropertySaveError;

public class ProfileDeleteException extends Exception {
	private static final long serialVersionUID = 1L;

	private List<ProfilePropertySaveError> errors = null;

	public ProfileDeleteException(String error) {
		super(error);
	} 
	
	public ProfileDeleteException(Exception error) {
		super(error);
	}
	

	public ProfileDeleteException(List<ProfilePropertySaveError> errors) {
		super();
		this.errors = errors;
	}

	public List<ProfilePropertySaveError> getErrors() {
		return errors;
	}

	public void setErrors(List<ProfilePropertySaveError> errors) {
		this.errors = errors;
	}

}
