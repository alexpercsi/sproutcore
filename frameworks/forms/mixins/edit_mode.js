/**
  Handles propagation of a property inEditMode to all child views.
*/
SC.FormsEditMode = {
  
  /**
    Walks like a duck.
  */
  hasEditMode: YES,
  
  /**
    Whether we are in edit mode.
  */
  isEditing: NO,
  
  /**
    Handles changes to edit state. Alerts children.
  */
  editModeDidChange: function(){
    this._propagateEditMode();    
  }.observes("isEditing"),
  
  /**
    Ensures that edit mode is passed to all children.
  */
  _scfem_childViewsDidChange: function() {
    this._propagateEditMode();
  }.observes("childViews"),
  
  /**
    Propagates edit mode.
  */
  _propagateEditMode: function() {
    var isEditing = this.get("isEditing");
    var cv = this.get("childViews"), idx, len = cv.length, v;
    for (idx = 0; idx < len; idx++) {
      v = cv[idx];
      if (SC.typeOf(v) === SC.T_STRING || v.isClass) return;
      if (v.get("hasEditMode")) v.set("isEditing", isEditing);
    }
  }
  
};