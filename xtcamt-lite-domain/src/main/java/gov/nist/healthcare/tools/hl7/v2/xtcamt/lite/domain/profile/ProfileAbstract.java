package gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile;

import java.util.Date;

import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.ProfileMetaData;

public class ProfileAbstract {
	private String id;
	
	private String sourceType;

	private ProfileMetaData metaData;

	private MessagesAbstract messages;
	
	private Long accountId;
	
	private Date lastUpdatedDate;

	public ProfileAbstract() {
		super();
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getSourceType() {
		return sourceType;
	}

	public void setSourceType(String sourceType) {
		this.sourceType = sourceType;
	}

	public ProfileMetaData getMetaData() {
		return metaData;
	}

	public void setMetaData(ProfileMetaData metaData) {
		this.metaData = metaData;
	}

	public MessagesAbstract getMessages() {
		return messages;
	}

	public void setMessages(MessagesAbstract messages) {
		this.messages = messages;
	}

	public Long getAccountId() {
		return accountId;
	}

	public void setAccountId(Long accountId) {
		this.accountId = accountId;
	}

	public Date getLastUpdatedDate() {
		return lastUpdatedDate;
	}

	public void setLastUpdatedDate(Date lastUpdatedDate) {
		this.lastUpdatedDate = lastUpdatedDate;
	}
}
