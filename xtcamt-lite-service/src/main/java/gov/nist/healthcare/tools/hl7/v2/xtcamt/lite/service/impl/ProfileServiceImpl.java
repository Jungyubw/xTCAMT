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
 * @author Olivier MARIE-ROSE
 * 
 */

package gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.impl;

import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import com.mongodb.MongoException;

import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Code;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Component;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Constant.SCOPE;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.ContentDefinition;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Datatype;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.DatatypeLink;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.DynamicMappingDefinition;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.DynamicMappingItem;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Extensibility;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Field;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Group;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Message;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.ProfileMetaData;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Segment;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.SegmentLink;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.SegmentRef;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.SegmentRefOrGroup;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Stability;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Table;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Usage;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.ValueSetBinding;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.VariesMapItem;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.ByID;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.ByName;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.ByNameOrByID;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.ConformanceStatement;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.Constraint;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.Constraints;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.Context;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.Predicate;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.Reference;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.ProfileDataStr;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.Datatypes;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.Messages;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.Profile;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.Segments;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.Tables;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.repo.ProfileRepository;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.ProfileClone;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.ProfileException;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.ProfileSaveException;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.ProfileService;

@Service
public class ProfileServiceImpl implements ProfileService {
	private HashMap<String, Datatype> datatypesMap;
	private HashMap<String, Segment> segmentsMap;
	private Constraints conformanceStatements;
	private Constraints predicates;
	
	Logger log = LoggerFactory.getLogger(ProfileServiceImpl.class);
	@Autowired
	private ProfileRepository profileRepository;

	@Override
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public Profile save(Profile p) throws ProfileException {
		try {
			return profileRepository.save(p);
		} catch (MongoException e) {
			throw new ProfileException(e);
		}
	}

	@Override
	@Transactional
	public void delete(String id) {
		profileRepository.delete(id);
	}

	@Override
	public Profile findOne(String id) {
		Profile p = profileRepository.findOne(id);
		return p;
	}

	@Override
	public List<Profile> findAll() {
		List<Profile> profiles = profileRepository.findAll();
		log.info("profiles=" + profiles.size());
		return profiles;
	}

	@Override
	public List<Profile> findByAccountId(Long accountId) {
		List<Profile> profiles = profileRepository.findByAccountId(accountId);
		return profiles;
	}

	@Override
	public List<Profile> findByAccountIdAndSourceType(Long accountId, String sourceType) {
		List<Profile> profiles = profileRepository.findByAccountIdAndSourceType(accountId, sourceType);
		return profiles;
	}
	
	@Override
	public Profile clone(Profile p) throws CloneNotSupportedException {
		return new ProfileClone().clone(p);
	}

	@Override
	public Profile apply(Profile p) throws ProfileSaveException {
		DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
		p.getMetaData().setDate(dateFormat.format(Calendar.getInstance().getTime()));
		profileRepository.save(p);
		return p;
	}

	@Override
	public Profile readXML2Profile(ProfileDataStr pds) throws ProfileException {
		return deserializeXMLToProfile(pds.getProfileXMLFileStr(), pds.getValueSetXMLFileStr(),
				pds.getConstraintsXMLFileStr()); 
	}

	private Profile deserializeXMLToProfile(String xmlContentsProfile, String xmlValueSet, String xmlConstraints) {
		Document profileDoc = this.stringToDom(xmlContentsProfile);
		Element elmConformanceProfile = (Element) profileDoc.getElementsByTagName("ConformanceProfile").item(0);

		// Read Profile Meta
		Profile profile = new Profile();
		profile.setMetaData(new ProfileMetaData());
		this.deserializeMetaData(profile, elmConformanceProfile);
		this.deserializeEncodings(profile, elmConformanceProfile);

		// Read Profile Libs
		profile.setSegments(new Segments());
		profile.setDatatypes(new Datatypes());

		profile.setTables(this.deserializeXMLToTableLibrary(xmlValueSet, profile.getMetaData().getHl7Version()));

		this.conformanceStatements = this.deserializeXMLToConformanceStatements(xmlConstraints);
		this.predicates = this.deserializeXMLToPredicates(xmlConstraints);

		this.constructDatatypesMap((Element) elmConformanceProfile.getElementsByTagName("Datatypes").item(0), profile);

		Datatypes datatypes = new Datatypes();
		for (String key : datatypesMap.keySet()) {
			datatypes.addDatatype(datatypesMap.get(key));
		}
		profile.setDatatypes(datatypes);

		this.segmentsMap = this.constructSegmentsMap(
				(Element) elmConformanceProfile.getElementsByTagName("Segments").item(0), profile);

		Segments segments = new Segments();
		for (String key : segmentsMap.keySet()) {
			segments.addSegment(segmentsMap.get(key));
		}
		profile.setSegments(segments);

		// Read Profile Messages
		this.deserializeMessages(profile, elmConformanceProfile);

		return profile;
	}
	
	private void deserializeMessages(Profile profile, Element elmConformanceProfile) {
		NodeList nodes = elmConformanceProfile.getElementsByTagName("Message");
		if (nodes != null && nodes.getLength() != 0) {
			Messages messagesObj = new Messages();
			messagesObj.setId(ObjectId.get().toString());
			for (int i = 0; i < nodes.getLength(); i++) {
				Message messageObj = new Message();
				messageObj.setId(ObjectId.get().toString());
				Element elmMessage = (Element) nodes.item(i);
				messageObj.setMessageID(elmMessage.getAttribute("ID"));
				messageObj.setIdentifier(elmMessage.getAttribute("Identifier"));
				messageObj.setName(elmMessage.getAttribute("Name"));
				messageObj.setMessageType(elmMessage.getAttribute("Type"));
				messageObj.setEvent(elmMessage.getAttribute("Event"));
				messageObj.setStructID(elmMessage.getAttribute("StructID"));
				messageObj.setDescription(elmMessage.getAttribute("Description"));
				
				messageObj.setPredicates(this.findPredicates(this.predicates.getMessages(), elmMessage.getAttribute("ID"), elmMessage.getAttribute("StructID")));
				messageObj.setConformanceStatements(this.findConformanceStatement(this.conformanceStatements.getMessages(), elmMessage.getAttribute("ID"), elmMessage.getAttribute("StructID")));

				this.deserializeSegmentRefOrGroups(elmConformanceProfile, messageObj, elmMessage, profile.getSegments(), profile.getDatatypes());
				messagesObj.addMessage(messageObj);
			}
			profile.setMessages(messagesObj);
		}
	}
	
	private void deserializeSegmentRefOrGroups(Element elmConformanceProfile,
			Message messageObj, Element elmMessage, Segments segments,
			Datatypes datatypes) {
		List<SegmentRefOrGroup> segmentRefOrGroups = new ArrayList<SegmentRefOrGroup>();
		NodeList nodes = elmMessage.getChildNodes();

		int index = 0;
		for (int i = 0; i < nodes.getLength(); i++) {
			if (nodes.item(i).getNodeName().equals("Segment")) {
				index = index + 1;
				this.deserializeSegmentRef(elmConformanceProfile, segmentRefOrGroups, (Element) nodes.item(i), segments, datatypes, index);
			} else if (nodes.item(i).getNodeName().equals("Group")) {
				index = index + 1;
				this.deserializeGroup(elmConformanceProfile, segmentRefOrGroups, (Element) nodes.item(i), segments, datatypes, index);
			}
		}

		messageObj.setChildren(segmentRefOrGroups);

	}
	
	private void deserializeGroup(Element elmConformanceProfile, List<SegmentRefOrGroup> segmentRefOrGroups, Element groupElm, Segments segments, Datatypes datatypes, int position) {
		Group groupObj = new Group();
		groupObj.setId(ObjectId.get().toString());
		groupObj.setMax(groupElm.getAttribute("Max"));
		groupObj.setMin(new Integer(groupElm.getAttribute("Min")));
		groupObj.setName(groupElm.getAttribute("Name"));
		groupObj.setUsage(Usage.fromValue(groupElm.getAttribute("Usage")));
		groupObj.setPredicates(this.findPredicates(this.predicates.getGroups(), groupElm.getAttribute("ID"), groupElm.getAttribute("Name")));
		groupObj.setConformanceStatements(this.findConformanceStatement(this.conformanceStatements.getGroups(), groupElm.getAttribute("ID"), groupElm.getAttribute("Name")));
		groupObj.setPosition(position);

		List<SegmentRefOrGroup> childSegmentRefOrGroups = new ArrayList<SegmentRefOrGroup>();

		NodeList nodes = groupElm.getChildNodes();
		int index = 0;
		for (int i = 0; i < nodes.getLength(); i++) {
			if (nodes.item(i).getNodeName().equals("Segment")) {
				index = index + 1;
				this.deserializeSegmentRef(elmConformanceProfile,
						childSegmentRefOrGroups, (Element) nodes.item(i),
						segments, datatypes, index);
			} else if (nodes.item(i).getNodeName().equals("Group")) {
				index = index + 1;
				this.deserializeGroup(elmConformanceProfile,
						childSegmentRefOrGroups, (Element) nodes.item(i),
						segments, datatypes, index);
			}
		}

		groupObj.setChildren(childSegmentRefOrGroups);

		segmentRefOrGroups.add(groupObj);
	}
	
	private void deserializeSegmentRef(Element elmConformanceProfile,
			List<SegmentRefOrGroup> segmentRefOrGroups, Element segmentElm,
			Segments segments, Datatypes datatypes, int position) {
		SegmentRef segmentRefObj = new SegmentRef();
		segmentRefObj.setId(ObjectId.get().toString());
		segmentRefObj.setMax(segmentElm.getAttribute("Max"));
		segmentRefObj.setMin(new Integer(segmentElm.getAttribute("Min")));
		segmentRefObj.setUsage(Usage.fromValue(segmentElm.getAttribute("Usage")));
		segmentRefObj.setPosition(position);
		Segment s = this.segmentsMap.get(segmentElm.getAttribute("Ref"));
		SegmentLink sl = new SegmentLink();
		sl.setExt(s.getExt());
		sl.setId(s.getId());
		sl.setName(s.getName());
		
		segmentRefObj.setRef(sl);
		segmentRefOrGroups.add(segmentRefObj);
	}
	
	private HashMap<String, Segment> constructSegmentsMap(Element elmSegments, Profile profile) {
		HashMap<String, Segment> segmentsMap = new HashMap<String, Segment>();
		NodeList segmentNodeList = elmSegments.getElementsByTagName("Segment");

		for (int i = 0; i < segmentNodeList.getLength(); i++) {
			Element elmSegment = (Element) segmentNodeList.item(i);
			segmentsMap.put(elmSegment.getAttribute("ID"),
					this.deserializeSegment(elmSegment, profile));
		}

		return segmentsMap;
	}
	
	private Segment deserializeSegment(Element segmentElm, Profile profile) {
		Segment segmentObj = new Segment();
		segmentObj.setId(ObjectId.get().toString());
		segmentObj.setDescription(segmentElm.getAttribute("Description"));
		if(segmentElm.getAttribute("Label") != null && !segmentElm.getAttribute("Label").equals("")){
			segmentObj.setLabel(segmentElm.getAttribute("Label"));
			if(segmentElm.getAttribute("Label").equals(segmentElm.getAttribute("Name"))){
			  segmentObj.setExt(null);
			  segmentObj.setScope(SCOPE.HL7STANDARD);
			}else{
			  segmentObj.setExt(segmentElm.getAttribute("Label").replace(segmentElm.getAttribute("Name") + "_", "")); 
			  segmentObj.setScope(SCOPE.USER);
			}
		}else{
			segmentObj.setExt(null);
			segmentObj.setScope(SCOPE.HL7STANDARD);
		}
		segmentObj.setName(segmentElm.getAttribute("Name"));
		segmentObj.setPredicates(this.findPredicates(this.predicates.getSegments(), segmentElm.getAttribute("ID"), segmentElm.getAttribute("Name")));
		segmentObj.setConformanceStatements(this.findConformanceStatement(this.conformanceStatements.getSegments(), segmentElm.getAttribute("ID"), segmentElm.getAttribute("Name")));
		segmentObj.setHl7Version(profile.getMetaData().getHl7Version());
		
		NodeList dynamicMapping = segmentElm.getElementsByTagName("Mapping");
		DynamicMappingDefinition dynamicMappingObj = null;
		if(dynamicMapping.getLength() > 0){
			dynamicMappingObj = new DynamicMappingDefinition();
		}
		
		for (int i = 0; i < dynamicMapping.getLength(); i++) {
			Element mappingElm = (Element)dynamicMapping.item(i);
			VariesMapItem mappingStructure = new VariesMapItem();
			mappingStructure.setHl7Version(segmentObj.getHl7Version());
			mappingStructure.setReferenceLocation(mappingElm.getAttribute("Reference"));
			if(mappingElm.getAttribute("SecondReference") != null && !mappingElm.getAttribute("SecondReference").equals("")) mappingStructure.setSecondRefereceLocation(mappingElm.getAttribute("SecondReference"));
			mappingStructure.setSegmentName(segmentObj.getName());
			mappingStructure.setTargetLocation(mappingElm.getAttribute("Position"));
			dynamicMappingObj.setMappingStructure(mappingStructure);
			
			NodeList cases = mappingElm.getElementsByTagName("Case");
			List<DynamicMappingItem> dynamicMappingItems = new ArrayList<DynamicMappingItem>();
			for(int j = 0; j < cases.getLength(); j++) {
				Element caseElm = (Element)cases.item(j);
				DynamicMappingItem dynamicMappingItem = new DynamicMappingItem();
				dynamicMappingItem.setDatatypeId(this.findDatatype(caseElm.getAttribute("Datatype"), profile).getId());
				dynamicMappingItem.setFirstReferenceValue(caseElm.getAttribute("Value"));
				if(caseElm.getAttribute("SecondValue") != null && !caseElm.getAttribute("SecondValue").equals("")){
				  dynamicMappingItem.setSecondReferenceValue(caseElm.getAttribute("SecondValue"));
				}
				dynamicMappingItems.add(dynamicMappingItem);
				
			}
			dynamicMappingObj.setDynamicMappingItems(dynamicMappingItems);
		}
		if(dynamicMappingObj != null) segmentObj.setDynamicMappingDefinition(dynamicMappingObj);
		
		NodeList fields = segmentElm.getElementsByTagName("Field");
		for (int i = 0; i < fields.getLength(); i++) {
			Element fieldElm = (Element) fields.item(i);
			segmentObj.addField(this.deserializeField(fieldElm, segmentObj, profile, segmentElm.getAttribute("ID"), (i + 1)));
		}
		return segmentObj;
	}
	
	private Field deserializeField(Element fieldElm, Segment segment,
			Profile profile, String segmentId, int position) {
		Field fieldObj = new Field();
		fieldObj.setId(ObjectId.get().toString());

		fieldObj.setName(fieldElm.getAttribute("Name"));
		fieldObj.setUsage(Usage.fromValue(fieldElm.getAttribute("Usage")));
		Datatype d = this.findDatatype(fieldElm.getAttribute("Datatype"), profile);
		DatatypeLink dl = new DatatypeLink();
		dl.setExt(d.getExt());
		dl.setId(d.getId());
		dl.setName(d.getName());
		fieldObj.setPosition(position);
		
		fieldObj.setDatatype(dl);
		fieldObj.setMinLength(fieldElm.getAttribute("MinLength"));
		if(fieldElm.getAttribute("MaxLength") != null){
			fieldObj.setMaxLength(fieldElm.getAttribute("MaxLength"));
		}
		if(fieldElm.getAttribute("ConfLength") != null){
			fieldObj.setConfLength(fieldElm.getAttribute("ConfLength"));
		}
		
		if (fieldElm.getAttribute("Binding") != null) {
			ValueSetBinding vsb = new ValueSetBinding();
			String id = findTableIdByMappingId(fieldElm.getAttribute("Binding"), profile.getTables());

			if(id != null){
				vsb.setTableId(id);
				vsb.setId(ObjectId.get().toString());
				vsb.setLocation(fieldObj.getPosition() + "");
				
				if (fieldElm.getAttribute("BindingStrength") != null) {
					vsb.setBindingStrength(fieldElm.getAttribute("BindingStrength"));
				}
				if (fieldElm.getAttribute("BindingLocation") != null) {
					String bindingLocation = fieldElm.getAttribute("BindingLocation");
					bindingLocation = bindingLocation.replaceAll(":", " or ");
					vsb.setBindingLocation(bindingLocation);
				}
				vsb.setUsage(fieldObj.getUsage());
				
				segment.addValueSetBinding(vsb);
			}
		}
		
		
		if(fieldElm.getAttribute("Hide") != null && fieldElm.getAttribute("Hide").equals("true") ){
			fieldObj.setHide(true);
		}else{
			fieldObj.setHide(false);
		}
		fieldObj.setMin(new Integer(fieldElm.getAttribute("Min")));
		fieldObj.setMax(fieldElm.getAttribute("Max"));
		if(fieldElm.getAttribute("ItemNo") != null){
			fieldObj.setItemNo(fieldElm.getAttribute("ItemNo"));
		}
		return fieldObj;
	}
	
	private Datatype findDatatype(String key, Profile profile) {
		if (datatypesMap.get(key) != null)
			return datatypesMap.get(key);
		throw new IllegalArgumentException("Datatype " + key + " not found");
	}
	
	private void constructDatatypesMap(Element elmDatatypes, Profile profile) {
		this.datatypesMap = new HashMap<String, Datatype>();
		NodeList datatypeNodeList = elmDatatypes.getElementsByTagName("Datatype");

		for (int i = 0; i < datatypeNodeList.getLength(); i++) {
			Element elmDatatype = (Element) datatypeNodeList.item(i);
			if (!datatypesMap.keySet().contains(elmDatatype.getAttribute("ID"))) {
				datatypesMap.put(elmDatatype.getAttribute("ID"), this.deserializeDatatype(elmDatatype, profile,elmDatatypes));
			}
		}
	}
	
	private Datatype deserializeDatatype(Element elmDatatype, Profile profile, Element elmDatatypes) {
		String ID = elmDatatype.getAttribute("ID");
		if (!datatypesMap.keySet().contains(ID)) {
			Datatype datatypeObj = new Datatype();
			datatypeObj.setId(ObjectId.get().toString());
			datatypeObj.setHl7Version(profile.getMetaData().getHl7Version());
			datatypeObj.setDescription(elmDatatype.getAttribute("Description"));
			if(elmDatatype.getAttribute("Label") != null &&  !elmDatatype.getAttribute("Label").equals("")){
				datatypeObj.setLabel(elmDatatype.getAttribute("Label"));
				datatypeObj.setExt(elmDatatype.getAttribute("Label").replace(elmDatatype.getAttribute("Name")+ "_", ""));
				if(elmDatatype.getAttribute("Label").equals(elmDatatype.getAttribute("Name"))){
				  datatypeObj.setExt(null);
				  datatypeObj.setScope(SCOPE.HL7STANDARD);
	            }else{
	              datatypeObj.setExt(elmDatatype.getAttribute("Label").replace(elmDatatype.getAttribute("Name") + "_", "")); 
	              datatypeObj.setScope(SCOPE.USER);
	            }
			}else{
				datatypeObj.setExt(null);
				datatypeObj.setScope(SCOPE.HL7STANDARD);
			}
			datatypeObj.setName(elmDatatype.getAttribute("Name"));
			datatypeObj.setPredicates(this.findPredicates(this.predicates.getDatatypes(), ID, elmDatatype.getAttribute("Name")));
			datatypeObj.setConformanceStatements(this.findConformanceStatement(this.conformanceStatements.getDatatypes(), ID, elmDatatype.getAttribute("Name")));

			NodeList nodes = elmDatatype.getChildNodes();
			int componentPosition = 0;
			for (int i = 0; i < nodes.getLength(); i++) {
				if (nodes.item(i).getNodeName().equals("Component")) {
					componentPosition = componentPosition + 1;
					Element elmComponent = (Element) nodes.item(i);
					Component componentObj = new Component();
					componentObj.setId(ObjectId.get().toString());
					componentObj.setName(elmComponent.getAttribute("Name"));
					componentObj.setUsage(Usage.fromValue(elmComponent.getAttribute("Usage")));
					Element elmDt = getDatatypeElement(elmDatatypes, elmComponent.getAttribute("Datatype"));
					Datatype datatype = this.deserializeDatatype(elmDt, profile, elmDatatypes);
					DatatypeLink dl = new DatatypeLink();
					dl.setId(datatype.getId());
					dl.setName(datatype.getName());
					dl.setExt(datatype.getExt());
					componentObj.setDatatype(dl);
					componentObj.setPosition(componentPosition);
					componentObj.setMinLength(elmComponent.getAttribute("MinLength"));
					if (elmComponent.getAttribute("MaxLength") != null) {
						componentObj.setMaxLength(elmComponent.getAttribute("MaxLength"));
					}
					if (elmComponent.getAttribute("ConfLength") != null) {
						componentObj.setConfLength(elmComponent.getAttribute("ConfLength"));
					}

					if (elmComponent.getAttribute("Binding") != null) {
						ValueSetBinding vsb = new ValueSetBinding();
						String id = findTableIdByMappingId(elmComponent.getAttribute("Binding"), profile.getTables());
	
						if(id != null){
							vsb.setTableId(id);
							vsb.setId(ObjectId.get().toString());
							vsb.setLocation(componentObj.getPosition() + "");
							
							if (elmComponent.getAttribute("BindingStrength") != null) {
								vsb.setBindingStrength(elmComponent.getAttribute("BindingStrength"));
							}
							if (elmComponent.getAttribute("BindingLocation") != null) {
								String bindingLocation = elmComponent.getAttribute("BindingLocation");
								bindingLocation = bindingLocation.replaceAll(":", " or ");
								vsb.setBindingLocation(bindingLocation);
							}
							vsb.setUsage(componentObj.getUsage());
							
							datatypeObj.addValueSetBinding(vsb);
						}
					}
					if(elmComponent.getAttribute("Hide") != null && elmComponent.getAttribute("Hide").equals("true") ){
						componentObj.setHide(true);
					}else{
						componentObj.setHide(false);
					}
					datatypeObj.addComponent(componentObj);
				}
			}
			datatypesMap.put(ID, datatypeObj);
			return datatypeObj;
		} else {
			return datatypesMap.get(ID);
		}
	}
	
	private Element getDatatypeElement(Element elmDatatypes, String id) {
		NodeList datatypeNodeList = elmDatatypes
				.getElementsByTagName("Datatype");
		for (int i = 0; i < datatypeNodeList.getLength(); i++) {
			Element elmDatatype = (Element) datatypeNodeList.item(i);
			if (id.equals(elmDatatype.getAttribute("ID"))) {
				return elmDatatype;
			}
		}
		return null;
	}
	
	private String findTableIdByMappingId(String bindingIdentifier, Tables tables) {
		for (Table table : tables.getChildren()) {
			if (table.getBindingIdentifier().equals(bindingIdentifier)) {
				return table.getId();
			}
		}
		return null;
	}

	
	private List<Predicate> findPredicates(Context context, String id, String name) {
		Set<ByNameOrByID> byNameOrByIDs = context.getByNameOrByIDs();
		List<Predicate> result = new ArrayList<Predicate>();
		for (ByNameOrByID byNameOrByID : byNameOrByIDs) {
			if (byNameOrByID instanceof ByID) {
				ByID byID = (ByID) byNameOrByID;
				if (byID.getByID().equals(id)) {
					for (Predicate p : byID.getPredicates()) {
						result.add(p);
					}
				}
			} else if (byNameOrByID instanceof ByName) {
				ByName byName = (ByName) byNameOrByID;
				if (byName.getByName().equals(name)) {
					for (Predicate p : byName.getPredicates()) {
						result.add(p);
					}
				}
			}
		}
		return result;
	}
	
	private List<ConformanceStatement> findConformanceStatement(Context context, String id, String name) {
		Set<ByNameOrByID> byNameOrByIDs = context.getByNameOrByIDs();
		List<ConformanceStatement> result = new ArrayList<ConformanceStatement>();
		for (ByNameOrByID byNameOrByID : byNameOrByIDs) {
			if (byNameOrByID instanceof ByID) {
				ByID byID = (ByID) byNameOrByID;
				if (byID.getByID().equals(id)) {
					for (ConformanceStatement c : byID.getConformanceStatements()) {
						result.add(c);
					}
				}else if (byNameOrByID instanceof ByName) {
					ByName byName = (ByName) byNameOrByID;
					if (byName.getByName().equals(name)) {
						for (ConformanceStatement c : byName.getConformanceStatements()) {
							result.add(c);
						}
					}
				}
			}
		}
		return result;
	}

	private void deserializeMetaData(Profile profile, Element elmConformanceProfile) {
		profile.getMetaData().setProfileID(elmConformanceProfile.getAttribute("ID"));
		profile.getMetaData().setType(elmConformanceProfile.getAttribute("Type"));
		profile.getMetaData().setHl7Version(elmConformanceProfile.getAttribute("HL7Version"));
		profile.getMetaData().setSchemaVersion(elmConformanceProfile.getAttribute("SchemaVersion"));

		NodeList nodes = elmConformanceProfile.getElementsByTagName("MetaData");

		Element elmMetaData = (Element) nodes.item(0);
		profile.getMetaData().setName(elmMetaData.getAttribute("Name"));
		profile.getMetaData().setOrgName(elmMetaData.getAttribute("OrgName"));
		profile.getMetaData().setVersion(elmMetaData.getAttribute("Version"));
		profile.getMetaData().setDate(elmMetaData.getAttribute("Date"));
		profile.getMetaData().setSpecificationName(elmMetaData.getAttribute("SpecificationName"));
		profile.getMetaData().setStatus(elmMetaData.getAttribute("Status"));
		profile.getMetaData().setTopics(elmMetaData.getAttribute("Topics"));
	}

	private Document stringToDom(String xmlSource) {
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		factory.setNamespaceAware(true);
		factory.setIgnoringComments(false);
		factory.setIgnoringElementContentWhitespace(true);
		DocumentBuilder builder;
		try {
			builder = factory.newDocumentBuilder();
			return builder.parse(new InputSource(new StringReader(xmlSource)));
		} catch (ParserConfigurationException e) {
			e.printStackTrace();
		} catch (SAXException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}

	private void deserializeEncodings(Profile profile, Element elmConformanceProfile) {
		NodeList nodes = elmConformanceProfile.getElementsByTagName("Encoding");
		if (nodes != null && nodes.getLength() != 0) {
			Set<String> encodingSet = new HashSet<String>();
			for (int i = 0; i < nodes.getLength(); i++) {
				encodingSet.add(nodes.item(i).getNodeValue());
			}
			profile.getMetaData().setEncodings(encodingSet);
		}
	}

	public Tables deserializeXMLToTableLibrary(String xmlContents, String hl7Version) {
		Document tableLibraryDoc = this.stringToDom(xmlContents);
		Tables tableLibrary = new Tables();
		Element elmTableLibrary = (Element) tableLibraryDoc.getElementsByTagName("ValueSetLibrary").item(0);
		tableLibrary.setValueSetLibraryIdentifier(elmTableLibrary.getAttribute("ValueSetLibraryIdentifier"));
		this.deserializeXMLToTable(elmTableLibrary, tableLibrary, hl7Version);

		return tableLibrary;
	}

	private void deserializeXMLToTable(Element elmTableLibrary, Tables tableLibrary, String hl7Version) {
		NodeList valueSetDefinitionsNode = elmTableLibrary.getElementsByTagName("ValueSetDefinitions");
		for (int i = 0; i < valueSetDefinitionsNode.getLength(); i++) {
			Element valueSetDefinitionsElement = (Element) valueSetDefinitionsNode.item(i);
			NodeList valueSetDefinitionNodes = valueSetDefinitionsElement.getElementsByTagName("ValueSetDefinition");
			for (int j = 0; j < valueSetDefinitionNodes.getLength(); j++) {
				Element elmTable = (Element) valueSetDefinitionNodes.item(j);

				Table tableObj = new Table();
				tableObj.setId(ObjectId.get().toString());
				tableObj.setHl7Version(hl7Version);
				tableObj.setBindingIdentifier(elmTable.getAttribute("BindingIdentifier"));
				tableObj.setName(elmTable.getAttribute("Name"));

				tableObj.setGroup(valueSetDefinitionsElement.getAttribute("Group"));
				String orderStr = valueSetDefinitionsElement.getAttribute("Order");
				if (orderStr != null && !orderStr.equals("")) {
					tableObj.setOrder(Integer.parseInt(orderStr));
				}

				if (elmTable.getAttribute("Description") != null && !elmTable.getAttribute("Description").equals(""))
					tableObj.setDescription(elmTable.getAttribute("Description"));
				if (elmTable.getAttribute("Version") != null && !elmTable.getAttribute("Version").equals(""))
					tableObj.setVersion(elmTable.getAttribute("Version"));
				if (elmTable.getAttribute("Oid") != null && !elmTable.getAttribute("Oid").equals(""))
					tableObj.setOid(elmTable.getAttribute("Oid"));

				if (elmTable.getAttribute("Extensibility") != null
						&& !elmTable.getAttribute("Extensibility").equals("")) {
					tableObj.setExtensibility(Extensibility.fromValue(elmTable.getAttribute("Extensibility")));
				} else {
					tableObj.setExtensibility(Extensibility.fromValue("Open"));
				}

				if (elmTable.getAttribute("Stability") != null && !elmTable.getAttribute("Stability").equals("")) {
					tableObj.setStability(Stability.fromValue(elmTable.getAttribute("Stability")));
				} else {
					tableObj.setStability(Stability.fromValue("Static"));
				}

				if (elmTable.getAttribute("ContentDefinition") != null
						&& !elmTable.getAttribute("ContentDefinition").equals("")) {
					tableObj.setContentDefinition(
							ContentDefinition.fromValue(elmTable.getAttribute("ContentDefinition")));
				} else {
					tableObj.setContentDefinition(ContentDefinition.fromValue("Extensional"));
				}

				this.deserializeXMLToCode(elmTable, tableObj);
				tableLibrary.addTable(tableObj);
			}
		}
	}

	private void deserializeXMLToCode(Element elmTable, Table tableObj) {
		NodeList nodes = elmTable.getElementsByTagName("ValueElement");

		for (int i = 0; i < nodes.getLength(); i++) {
			Element elmCode = (Element) nodes.item(i);

			Code codeObj = new Code();
			codeObj.setId(ObjectId.get().toString());
			codeObj.setValue(elmCode.getAttribute("Value"));
			codeObj.setLabel(elmCode.getAttribute("DisplayName"));

			if (elmCode.getAttribute("CodeSystem") != null && !elmCode.getAttribute("CodeSystem").equals(""))
				codeObj.setCodeSystem(elmCode.getAttribute("CodeSystem"));
			if (elmCode.getAttribute("CodeSystemVersion") != null
					&& !elmCode.getAttribute("CodeSystemVersion").equals(""))
				codeObj.setCodeSystemVersion(elmCode.getAttribute("CodeSystemVersion"));
			if (elmCode.getAttribute("Comments") != null && !elmCode.getAttribute("Comments").equals(""))
				codeObj.setComments(elmCode.getAttribute("Comments"));

			if (elmCode.getAttribute("Usage") != null && !elmCode.getAttribute("Usage").equals("")) {
				codeObj.setCodeUsage(elmCode.getAttribute("Usage"));
			} else {
				codeObj.setCodeUsage("R");
			}

			tableObj.addCode(codeObj);
		}

	}

	private Constraints deserializeXMLToConformanceStatements(String xmlConstraints) {
		if (xmlConstraints != null) {
			Document conformanceContextDoc = this.stringToDom(xmlConstraints);
			Element elmConstraints = (Element) conformanceContextDoc.getElementsByTagName("Constraints").item(0);
			Constraints constraints = new Constraints();
			constraints.setId(ObjectId.get().toString());

			Context datatypeContextObj = new Context();
			datatypeContextObj.setId(ObjectId.get().toString());
			Context segmentContextObj = new Context();
			segmentContextObj.setId(ObjectId.get().toString());
			Context groupContextObj = new Context();
			groupContextObj.setId(ObjectId.get().toString());
			Context messageContextObj = new Context();
			messageContextObj.setId(ObjectId.get().toString());

			this.deserializeXMLToContext((Element) elmConstraints.getElementsByTagName("Datatype").item(0),
					datatypeContextObj);
			this.deserializeXMLToContext((Element) elmConstraints.getElementsByTagName("Segment").item(0),
					segmentContextObj);
			this.deserializeXMLToContext((Element) elmConstraints.getElementsByTagName("Group").item(0),
					groupContextObj);
			this.deserializeXMLToContext((Element) elmConstraints.getElementsByTagName("Message").item(0),
					messageContextObj);

			constraints.setDatatypes(datatypeContextObj);
			constraints.setSegments(segmentContextObj);
			constraints.setGroups(groupContextObj);
			constraints.setMessages(messageContextObj);

			return constraints;
		}
		return null;
	}
	
	private Constraints deserializeXMLToPredicates(String xmlConstraints) {
		if (xmlConstraints != null) {
			Document conformanceContextDoc = this.stringToDom(xmlConstraints);
			Element elmConstraints = (Element) conformanceContextDoc.getElementsByTagName("Predicates").item(0);
			Constraints constraints = new Constraints();
			constraints.setId(ObjectId.get().toString());

			Context datatypeContextObj = new Context();
			datatypeContextObj.setId(ObjectId.get().toString());
			Context segmentContextObj = new Context();
			segmentContextObj.setId(ObjectId.get().toString());
			Context groupContextObj = new Context();
			groupContextObj.setId(ObjectId.get().toString());
			Context messageContextObj = new Context();
			messageContextObj.setId(ObjectId.get().toString());

			this.deserializeXMLToContext((Element) elmConstraints.getElementsByTagName("Datatype").item(0), datatypeContextObj);
			this.deserializeXMLToContext((Element) elmConstraints.getElementsByTagName("Segment").item(0), segmentContextObj);
			this.deserializeXMLToContext((Element) elmConstraints.getElementsByTagName("Group").item(0), groupContextObj);
			this.deserializeXMLToContext((Element) elmConstraints.getElementsByTagName("Message").item(0), messageContextObj);

			constraints.setDatatypes(datatypeContextObj);
			constraints.setSegments(segmentContextObj);
			constraints.setGroups(groupContextObj);
			constraints.setMessages(messageContextObj);

			return constraints;
		}
		return null;
	}

	private void deserializeXMLToContext(Element elmContext, Context contextObj) {
		if (elmContext != null) {
			NodeList nodes = elmContext.getChildNodes();

			for (int i = 0; i < nodes.getLength(); i++) {
				if (nodes.item(i).getNodeName().equals("ByName")) {
					ByName byNameObj = new ByName();
					byNameObj.setId(ObjectId.get().toString());
					Element elmByName = (Element) nodes.item(i);
					byNameObj.setByName(elmByName.getAttribute("Name"));
					deserializeXMLToConstraints(elmByName, byNameObj);
					contextObj.getByNameOrByIDs().add(byNameObj);
				} else if (nodes.item(i).getNodeName().equals("ByID")) {
					ByID byIDObj = new ByID();
					byIDObj.setId(ObjectId.get().toString());
					Element elmByID = (Element) nodes.item(i);
					byIDObj.setByID(elmByID.getAttribute("ID"));
					deserializeXMLToConstraints(elmByID, byIDObj);
					contextObj.getByNameOrByIDs().add(byIDObj);
				}

			}
		}

	}

	private void deserializeXMLToConstraints(Element elmByNameOrByID, ByNameOrByID byNameOrByIDObj) {
		NodeList constraintNodes = elmByNameOrByID.getElementsByTagName("Constraint");

		for (int i = 0; i < constraintNodes.getLength(); i++) {
			ConformanceStatement constraintObj = new ConformanceStatement();
			constraintObj.setId(ObjectId.get().toString());
			Element elmConstraint = (Element) constraintNodes.item(i);

			constraintObj.setConstraintId(elmConstraint.getAttribute("ID"));
			constraintObj.setConstraintTarget(elmConstraint.getAttribute("Target"));
			String constraintClassification = elmConstraint.getAttribute("Classification");
			if (constraintClassification == null || constraintClassification.equals("")) {
				constraintObj.setConstraintClassification("E");
			} else {
				constraintObj.setConstraintClassification(constraintClassification);
			}
			NodeList descriptionNodes = elmConstraint.getElementsByTagName("Description");
			if (descriptionNodes != null && descriptionNodes.getLength() == 1) {
				constraintObj.setDescription(descriptionNodes.item(0).getTextContent());
			}else {
				constraintObj.setDescription("NO DESC");
			}
			System.out.println(constraintObj.toString());
			this.deserializeXMLToReference(elmConstraint, constraintObj);
			constraintObj
					.setAssertion(this.convertElementToString(elmConstraint.getElementsByTagName("Assertion").item(0)));
			System.out.println(constraintObj.toString());
			byNameOrByIDObj.getConformanceStatements().add(constraintObj);
		}

		NodeList predicateNodes = elmByNameOrByID.getElementsByTagName("Predicate");

		for (int i = 0; i < predicateNodes.getLength(); i++) {
			Predicate predicateObj = new Predicate();
			predicateObj.setId(ObjectId.get().toString());
			Element elmPredicate = (Element) predicateNodes.item(i);

			predicateObj.setConstraintId(elmPredicate.getAttribute("ID"));
			predicateObj.setConstraintTarget(elmPredicate.getAttribute("Target"));
			predicateObj.setTrueUsage(Usage.fromValue(elmPredicate.getAttribute("TrueUsage")));
			predicateObj.setFalseUsage(Usage.fromValue(elmPredicate.getAttribute("FalseUsage")));
			NodeList descriptionNodes = elmPredicate.getElementsByTagName("Description");
			if (descriptionNodes != null && descriptionNodes.getLength() == 1) {
				predicateObj.setDescription(descriptionNodes.item(0).getTextContent());
			}else {
				predicateObj.setDescription("NO DESC");
			}
			this.deserializeXMLToReference(elmPredicate, predicateObj);
			predicateObj
					.setAssertion(this.convertElementToString(elmPredicate.getElementsByTagName("Condition").item(0)));
			byNameOrByIDObj.getPredicates().add(predicateObj);
		}
	}

	private void deserializeXMLToReference(Element elmConstraint, Constraint constraintObj) {
		NodeList nodes = elmConstraint.getElementsByTagName("Reference");
		if (nodes != null && nodes.getLength() == 1) {
			Reference referenceObj = new Reference();
			Element elmReference = (Element) nodes.item(0);

			referenceObj.setChapter(elmReference.getAttribute("Chapter"));
			referenceObj.setPage(Integer.parseInt(elmReference.getAttribute("Page")));
			referenceObj.setSection(elmReference.getAttribute("Section"));
			referenceObj.setUrl(elmReference.getAttribute("URL"));

			constraintObj.setReference(referenceObj);
		}

	}

	private String convertElementToString(Node node) {
		try {
			TransformerFactory transFactory = TransformerFactory.newInstance();
			Transformer transformer = transFactory.newTransformer();
			StringWriter buffer = new StringWriter();
			transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
			transformer.transform(new DOMSource(node), new StreamResult(buffer));

			return buffer.toString();
		} catch (TransformerException e) {
			e.printStackTrace();
		}

		return null;
	}

	public HashMap<String, Datatype> getDatatypesMap() {
		return datatypesMap;
	}

	public void setDatatypesMap(HashMap<String, Datatype> datatypesMap) {
		this.datatypesMap = datatypesMap;
	}

	public HashMap<String, Segment> getSegmentsMap() {
		return segmentsMap;
	}

	public void setSegmentsMap(HashMap<String, Segment> segmentsMap) {
		this.segmentsMap = segmentsMap;
	}

	public Constraints getConformanceStatements() {
		return conformanceStatements;
	}

	public void setConformanceStatements(Constraints conformanceStatements) {
		this.conformanceStatements = conformanceStatements;
	}

	public Constraints getPredicates() {
		return predicates;
	}

	public void setPredicates(Constraints predicates) {
		this.predicates = predicates;
	}
}
