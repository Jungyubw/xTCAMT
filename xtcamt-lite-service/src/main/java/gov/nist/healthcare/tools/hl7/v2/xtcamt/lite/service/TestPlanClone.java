package gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service;

import org.springframework.stereotype.Service;

import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.TestPlan;

@Service
public class TestPlanClone {
	public TestPlan clone(TestPlan original) throws CloneNotSupportedException {
		return original.clone();

	}
}
