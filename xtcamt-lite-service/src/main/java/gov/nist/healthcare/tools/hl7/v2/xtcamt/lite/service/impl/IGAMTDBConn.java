package gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.service.impl;

import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoDbFactory;
import org.springframework.data.mongodb.core.query.BasicQuery;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import com.mongodb.MongoClient;

import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Code;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Datatype;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.DatatypeLink;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.DynamicMappingItem;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.IGDocument;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Segment;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.SegmentLink;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Table;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.TableLink;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.ValueSetOrSingleCodeBinding;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.CoConstraintColumnDefinition;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.CoConstraintIFColumnData;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.CoConstraintTHENColumnData;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.Datatypes;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.Messages;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.Profile;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.Segments;
import gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile.Tables;

public class IGAMTDBConn {
  private MongoOperations mongoOps;

  public IGAMTDBConn() {
    super();
    try {
      mongoOps = new MongoTemplate(new SimpleMongoDbFactory(new MongoClient(), "igamt"));
    } catch (UnknownHostException e) {
      e.printStackTrace();
    }
  }

  public List<IGDocument> getUserDocument(long id) {
    try {
      return mongoOps.find(Query.query(Criteria.where("accountId").is(id)), IGDocument.class);
    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }

  public IGDocument findIGDocument(String id) {
    try {
      return mongoOps.findOne(Query.query(Criteria.where("_id").is(id)), IGDocument.class);
    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }

  public Table findTableById(String id) {
    try {
      return mongoOps.findOne(Query.query(Criteria.where("_id").is(id)), Table.class);
    } catch (Exception e) {
      e.printStackTrace();
    }
    return null;
  }

  public Segment findSegmentById(String id) {
    try {
      return mongoOps.findOne(Query.query(Criteria.where("_id").is(id)), Segment.class);

    } catch (Exception e) {
      e.printStackTrace();
    }

    return null;
  }

  public Datatype findDatatypeById(String id) {
    try {
      return mongoOps.findOne(Query.query(Criteria.where("_id").is(id)), Datatype.class);

    } catch (Exception e) {
      e.printStackTrace();
    }

    return null;
  }



  public Profile convertIGAMT2TCAMT(gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Profile p,
      String igName, String igId, Date date) {
    Profile tcamtProfile = new Profile();
    tcamtProfile.setAccountId(p.getAccountId());
    tcamtProfile.setId(igId);
    tcamtProfile.setSectionContents(p.getSectionContents());
    tcamtProfile.setSectionDescription(p.getSectionDescription());
    tcamtProfile.setSectionPosition(p.getSectionPosition());
    tcamtProfile.setSectionTitle(igName);
    tcamtProfile.setType(p.getType());
    tcamtProfile.setLastUpdatedDate(date);
    tcamtProfile.setMetaData(p.getMetaData());
    Messages messages = new Messages();
    messages.setId(p.getMessages().getId());
    messages.setType(p.getMessages().getType());
    messages.setChildren(p.getMessages().getChildren());

    tcamtProfile.setMessages(messages);

    Datatypes datatypes = new Datatypes();
    datatypes.setId(p.getDatatypeLibrary().getId());
    datatypes.setSectionContents(p.getDatatypeLibrary().getSectionContents());
    datatypes.setSectionDescription(p.getDatatypeLibrary().getSectionDescription());
    datatypes.setSectionDescription(p.getDatatypeLibrary().getSectionDescription());
    datatypes.setSectionPosition(p.getDatatypeLibrary().getSectionPosition());
    datatypes.setSectionTitle(p.getDatatypeLibrary().getSectionTitle());
    datatypes.setType(p.getDatatypeLibrary().getType());
    for (DatatypeLink link : p.getDatatypeLibrary().getChildren()) {
      Datatype dt = this.findDatatypeById(link.getId());
      datatypes.addDatatype(dt);
    }
    tcamtProfile.setDatatypes(datatypes);

    Tables tables = new Tables();
    tables.setDateCreated(p.getTableLibrary().getMetaData().getDate());
    tables.setDescription(p.getTableLibrary().getDescription());
    tables.setId(p.getTableLibrary().getId());
    tables.setName(p.getTableLibrary().getProfileName());
    tables.setOrganizationName(p.getTableLibrary().getOrganizationName());
    tables.setProfileName(p.getTableLibrary().getProfileName());
    tables.setSectionContents(p.getTableLibrary().getSectionContents());
    tables.setSectionDescription(p.getTableLibrary().getSectionDescription());
    tables.setSectionPosition(p.getTableLibrary().getSectionPosition());
    tables.setSectionTitle(p.getTableLibrary().getSectionTitle());
    tables.setStatus(p.getTableLibrary().getStatus());
    tables.setType(p.getTableLibrary().getType());
    tables.setValueSetLibraryIdentifier(p.getTableLibrary().getValueSetLibraryIdentifier());
    tables.setValueSetLibraryVersion(p.getTableLibrary().getValueSetLibraryVersion());
    for (TableLink link : p.getTableLibrary().getChildren()) {
      Table t = this.findTableById(link.getId());
      tables.addTable(t);
    }
    tcamtProfile.setTables(tables);

    Segments segments = new Segments();
    segments.setId(p.getSegmentLibrary().getId());
    segments.setSectionContents(p.getSegmentLibrary().getSectionContents());
    segments.setSectionDescription(p.getSegmentLibrary().getSectionDescription());
    segments.setSectionPosition(p.getSegmentLibrary().getSectionPosition());
    segments.setSectionTitle(p.getSegmentLibrary().getSectionTitle());
    segments.setType(p.getSegmentLibrary().getType());
    for (SegmentLink link : p.getSegmentLibrary().getChildren()) {
      Segment seg = this.findSegmentById(link.getId());
      seg = this.generateDynamicMappingDefinition(seg, datatypes, tables);
      segments.addSegment(seg);
    }
    tcamtProfile.setSegments(segments);

    return tcamtProfile;
  }

  private Segment generateDynamicMappingDefinition(Segment s, Datatypes datatypes, Tables tables) {
    if (s.getName().equals("OBX") || s.getName().equals("MFA") || s.getName().equals("MFE")) {
      String reference = null;
      String secondReference = null;
      String referenceTableId = null;
      HashMap<String, Datatype> dm = new HashMap<String, Datatype>();
      HashMap<String, Datatype> dm2nd = new HashMap<String, Datatype>();

      if (s.getName().equals("OBX")) {
        reference = "2";
      }

      if (s.getName().equals("MFA")) {
        reference = "6";
      }

      if (s.getName().equals("MFE")) {
        reference = "5";
      }

      if (s.getCoConstraintsTable() != null
          && s.getCoConstraintsTable().getIfColumnDefinition() != null) {
        if (s.getCoConstraintsTable().getIfColumnDefinition().isPrimitive()) {
          secondReference = s.getCoConstraintsTable().getIfColumnDefinition().getPath();
        } else {
          secondReference = s.getCoConstraintsTable().getIfColumnDefinition().getPath() + ".1";
        }
      }

      referenceTableId = this.findValueSetID(s.getValueSetBindings(), reference);

      if (referenceTableId != null) {
        Table table = tables.findOneTableById(referenceTableId);
        String hl7Version = null;
        hl7Version = table.getHl7Version();
        if (hl7Version == null)
          hl7Version = s.getHl7Version();

        if (table != null) {
          for (Code c : table.getCodes()) {
            if (c.getValue() != null) {
              Datatype d = this.findHL7DatatypeByNameAndVesion(datatypes, c.getValue(), hl7Version);
              if (d != null) {
                dm.put(c.getValue(), d);
              }
            }
          }
        }
        if (s.getDynamicMappingDefinition() != null) {
          for (DynamicMappingItem item : s.getDynamicMappingDefinition().getDynamicMappingItems()) {
            if (item.getFirstReferenceValue() != null && item.getDatatypeId() != null)
              dm.put(item.getFirstReferenceValue(), datatypes.findOne(item.getDatatypeId()));
          }
        }
      }
      if (secondReference != null) {
        for (CoConstraintColumnDefinition definition : s.getCoConstraintsTable()
            .getThenColumnDefinitionList()) {
          if (definition.isdMReference()) {
            List<CoConstraintTHENColumnData> dataList =
                s.getCoConstraintsTable().getThenMapData().get(definition.getId());

            if (dataList != null && s.getCoConstraintsTable().getIfColumnData() != null) {
              for (int i = 0; i < dataList.size(); i++) {
                CoConstraintIFColumnData ref = s.getCoConstraintsTable().getIfColumnData().get(i);
                CoConstraintTHENColumnData data = dataList.get(i);

                if (ref != null && data != null && ref.getValueData() != null
                    && ref.getValueData().getValue() != null && data.getDatatypeId() != null
                    && data.getValueData() != null && data.getValueData().getValue() != null) {
                  dm2nd.put(ref.getValueData().getValue(), datatypes.findOne(data.getDatatypeId()));
                }
              }
            }
          }
        }
      }

      if (s.getDynamicMappingDefinition() != null && (dm.size() > 0 || dm2nd.size() > 0)) {
        s.getDynamicMappingDefinition().getMappingStructure()
            .setSecondRefereceLocation(secondReference);
        s.getDynamicMappingDefinition().setDynamicMappingItems(new ArrayList<DynamicMappingItem>());

        for (String key : dm.keySet()) {
          Datatype d = dm.get(key);
          if (d != null) {
            DynamicMappingItem item = new DynamicMappingItem();
            item.setDatatypeId(d.getId());
            item.setFirstReferenceValue(d.getName());
            s.getDynamicMappingDefinition().getDynamicMappingItems().add(item);
          }
        }

        for (String key : dm2nd.keySet()) {
          Datatype d = dm2nd.get(key);
          if (d != null) {
            DynamicMappingItem item = new DynamicMappingItem();
            item.setDatatypeId(d.getId());
            item.setFirstReferenceValue(d.getName());
            item.setSecondReferenceValue(key);
            s.getDynamicMappingDefinition().getDynamicMappingItems().add(item);
          }
        }
      }
    }
    return s;
  }

  private String findValueSetID(List<ValueSetOrSingleCodeBinding> valueSetBindings,
      String referenceLocation) {
    for (ValueSetOrSingleCodeBinding vsb : valueSetBindings) {
      if (vsb.getLocation().equals(referenceLocation))
        return vsb.getTableId();
    }
    return null;
  }

  private Datatype findHL7DatatypeByNameAndVesion(Datatypes datatypes, String value,
      String hl7Version) {
    for (Datatype d : datatypes.getChildren()) {
      if (d.getName().equals(value) && d.getHl7Version().equals(hl7Version)
          && d.getScope().toString().equals("HL7STANDARD"))
        return d;
    }
    return null;
  }

  public Datatype findByNameAndVesionAndScope(String name, String hl7Version, String scope) {
    BasicQuery query1 = new BasicQuery(
        "{ name : '" + name + "', hl7Version : '" + hl7Version + "', scope : '" + scope + "'}");
    return mongoOps.findOne(query1, Datatype.class);
  }
}
