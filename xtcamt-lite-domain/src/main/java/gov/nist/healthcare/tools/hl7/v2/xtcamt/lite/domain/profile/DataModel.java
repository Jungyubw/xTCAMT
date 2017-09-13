package gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile;

import java.util.Date;

public abstract class DataModel {

  protected Date dateUpdated;
  protected boolean duplicated = false;

  /**
   * @return the duplicated
   */
  public boolean isDuplicated() {
    return duplicated;
  }

  /**
   * @param duplicated the duplicated to set
   */
  public void setDuplicated(boolean duplicated) {
    this.duplicated = duplicated;
  }

  protected String publicationDate;
  protected int publicationVersion = 0;
  protected String createdFrom;
  private String hl7Section;
  protected String authorNotes = "";
  protected String sourceUrl;


  /**
   * @return the sourceUrl
   */
  public String getSourceUrl() {
    return sourceUrl;
  }

  /**
   * @param sourceUrl the sourceUrl to set
   */
  public void setSourceUrl(String sourceUrl) {
    this.sourceUrl = sourceUrl;
  }

  /**
   * @return the authorNotes
   */
  public String getAuthorNotes() {
    return authorNotes;
  }

  /**
   * @param authorNotes the authorNotes to set
   */
  public void setAuthorNotes(String authorNotes) {
    this.authorNotes = authorNotes;
  }

  public DataModel() {
    this.dateUpdated = new Date();
  }

  protected String type;

  public String dt() {
    return type;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public Date getDateUpdated() {
    return dateUpdated;
  }

  public void setDateUpdated(Date dateUpdated) {
    this.dateUpdated = dateUpdated;
  }



  public String getPublicationDate() {
    return publicationDate;
  }

  public void setPublicationDate(String publicationDate) {
    this.publicationDate = publicationDate;
  }

  public int getPublicationVersion() {
    return publicationVersion;
  }

  public void setPublicationVersion(int publicationVersion) {
    this.publicationVersion = publicationVersion;
  }

  public String getCreatedFrom() {
    return createdFrom;
  }

  public void setCreatedFrom(String createdFrom) {
    this.createdFrom = createdFrom;
  }



  public String getHl7Section() {
    return hl7Section;
  }

  public void setHl7Section(String hl7Section) {
    this.hl7Section = hl7Section;
  }



}
