package gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service;

public class TestPlanException extends Exception {
	private static final long serialVersionUID = 1L;

	public TestPlanException(String id) {
		super("Unknown TestPlan with id " + id);
	}

	public TestPlanException(Exception error) {
		super(error);
	}

}
