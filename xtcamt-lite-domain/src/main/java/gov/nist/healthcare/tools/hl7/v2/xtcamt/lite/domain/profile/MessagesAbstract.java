package gov.nist.healthcare.tools.hl7.v2.xtcamt.lite.domain.profile;

import java.util.HashSet;
import java.util.Set;

public class MessagesAbstract {
  private String id;

  private Set<MessageAbstract> children = new HashSet<MessageAbstract>();

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public Set<MessageAbstract> getChildren() {
    return children;
  }

  public void setChildren(Set<MessageAbstract> children) {
    this.children = children;
  }

  public void addMessage(MessageAbstract m) {
    m.setPosition(children.size() + 1);
    children.add(m);
  }

  public void delete(String id) {
	  MessageAbstract m = findOne(id);
    if (m != null)
      this.getChildren().remove(m);
  }

  public MessageAbstract findOne(String id) {
    if (this.getChildren() != null)
      for (MessageAbstract m : this.getChildren()) {
        if (m.getId().equals(id)) {
          return m;
        }
      }

    return null;
  }
  

  public MessageAbstract findOneByStrucId(String id) {
    if (this.getChildren() != null)
      for (MessageAbstract m : this.getChildren()) {
        if (m.getStructID().equals(id)) {
          return m;
        }
      }

    return null;
  }
}
