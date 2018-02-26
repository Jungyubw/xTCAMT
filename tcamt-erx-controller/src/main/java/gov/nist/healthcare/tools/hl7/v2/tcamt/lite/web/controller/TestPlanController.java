package gov.nist.healthcare.tools.hl7.v2.tcamt.lite.web.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.domain.testobject.TestPlan;
import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.service.TestPlanService;
import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.service.TestStoryConfigurationService;
import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.service.exception.TestPlanDeleteException;
import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.service.exception.TestPlanException;
import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.service.exception.TestPlanListException;
import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.service.exception.TestPlanNotFoundException;
import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.service.exception.TestPlanSaveException;
import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.web.TestPlanSaveResponse;
import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.web.controller.container.TestPlanChangeCommand;
import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.web.exception.OperationNotAllowException;
import gov.nist.healthcare.tools.hl7.v2.tcamt.lite.web.exception.UserAccountNotFoundException;

@RestController
@RequestMapping("/testplans")

public class TestPlanController extends CommonController {

  Logger log = LoggerFactory.getLogger(TestPlanController.class);

  @Autowired
  private TestPlanService testPlanService;

  @Autowired
  UserService userService;

  @Autowired
  AccountRepository accountRepository;

  @Autowired
  TestStoryConfigurationService testStoryConfigurationService;

  @Value("${gvt.url}")
  private String GVT_URL;


  /**
   * 
   * @param type
   * @return
   * @throws UserAccountNotFoundException
   * @throws TestPlanException
   */
  @RequestMapping(method = RequestMethod.GET, produces = "application/json")
  public List<TestPlan> getAllTestPlans()
      throws UserAccountNotFoundException, TestPlanListException {
    try {
      User u = userService.getCurrentUser();
      Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
      if (account == null) {
        throw new UserAccountNotFoundException();
      }
      return testPlanService.findByAccountId(account.getId());
    } catch (RuntimeException e) {
      throw new TestPlanListException(e);
    } catch (Exception e) {
      throw new TestPlanListException(e);
    }
  }

  @RequestMapping(value = "/{id}", method = RequestMethod.GET)
  public TestPlan get(@PathVariable("id") String id) throws TestPlanNotFoundException {
    try {
      log.info("Fetching profile with id=" + id);
      User u = userService.getCurrentUser();
      Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
      if (account == null)
        throw new UserAccountNotFoundException();
      TestPlan tp = findTestPlan(id);
      return tp;
    } catch (RuntimeException e) {
      throw new TestPlanNotFoundException(e);
    } catch (Exception e) {
      throw new TestPlanNotFoundException(e);
    }
  }

  @RequestMapping(value = "/{id}/delete", method = RequestMethod.POST)
  public ResponseMessage delete(@PathVariable("id") String id) throws TestPlanDeleteException {
    try {
      User u = userService.getCurrentUser();
      Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
      if (account == null)
        throw new UserAccountNotFoundException();
      log.info("Delete TestPlan with id=" + id);
      TestPlan tp = findTestPlan(id);
      if (tp.getAccountId() == account.getId()) {
        testPlanService.delete(id);
        return new ResponseMessage(ResponseMessage.Type.success, "testPlanDeletedSuccess", null);
      } else {
        throw new OperationNotAllowException("delete");
      }
    } catch (RuntimeException e) {
      throw new TestPlanDeleteException(e);
    } catch (Exception e) {
      throw new TestPlanDeleteException(e);
    }
  }

  @RequestMapping(value = "/{id}/copy", method = RequestMethod.POST)
  public ResponseMessage copy(@PathVariable("id") String id) throws TestPlanDeleteException {
    try {
      User u = userService.getCurrentUser();
      Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
      if (account == null)
        throw new UserAccountNotFoundException();
      TestPlan tp = findTestPlan(id);
      if (tp.getAccountId().equals(account.getId())) {
        testPlanService.save(testPlanService.clone(tp));
        return new ResponseMessage(ResponseMessage.Type.success, "testPlanCSuccess", null);
      } else {
        throw new OperationNotAllowException("clone");
      }
    } catch (RuntimeException e) {
      throw new TestPlanDeleteException(e);
    } catch (Exception e) {
      throw new TestPlanDeleteException(e);
    }
  }

  @RequestMapping(value = "/save", method = RequestMethod.POST)
  public TestPlanSaveResponse save(@RequestBody TestPlanChangeCommand command)
      throws TestPlanSaveException {

    System.out.println("SAVE REQ");
    try {

      User u = userService.getCurrentUser();
      Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
      if (account == null)
        throw new UserAccountNotFoundException();

      TestPlan saved = testPlanService.apply(command.getTp());
      return new TestPlanSaveResponse(saved.getLastUpdateDate(), saved.getVersion());
    } catch (RuntimeException e) {
      throw new TestPlanSaveException(e);
    } catch (Exception e) {
      throw new TestPlanSaveException(e);
    }
  }

  private TestPlan findTestPlan(String testplanId) throws TestPlanNotFoundException {
    TestPlan tp = testPlanService.findOne(testplanId);
    if (tp == null) {
      throw new TestPlanNotFoundException(testplanId);
    }
    return tp;
  }

}
