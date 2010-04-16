require('theme')

SC.EmptyTheme.renderers.ListItem = SC.Renderer.extend({
  init: function(settings) {
    this._controlRenderer = this.theme.control();
    this._titleRenderer = this.theme.title();
    this.attr(settings);
  },

	// theme: SC.EmptyTheme.renderers,

  render: function(context) {
    // configure sub renderers
    this._controlRenderer.attr({
      isEnabled: this.isEnabled,
      isActive: this.isActive,
      isSelected: this.isSelected,
      controlSize: this.controlSize
    });
    this._titleRenderer.attr({
      title: '',
      icon: this.icon,
      needsEllipsis: this.needsEllipsis,
      escapeHTML: this.escapeHTML
    });
    
    // render control renderer
    this._controlRenderer.render(context);
    
    /* Render OUR stuff */
    // add href attr if tagName is anchor...
    // var href, toolTip, classes, theme;
    // if (this.isAnchor) {
    //   href = this.href;
    //   if (!href || (href.length === 0)) href = "javascript:;";
    //   context.attr('href', href);
    // }
    // 
    // // If there is a toolTip set, grab it and localize if necessary.
    // toolTip = this.toolTip;
    // if (SC.typeOf(toolTip) === SC.T_STRING) {
    //   context.attr('title', toolTip) ;
    //   context.attr('alt', toolTip) ;
    // }
    // 
    // // add some standard attributes & classes.
    // classes = this._TEMPORARY_CLASS_HASH ? this._TEMPORARY_CLASS_HASH : this._TEMPORARY_CLASS_HASH = {};

		context.addClass(["sc-collection-item"])

    // classes.def = this.isDefault;
    // classes.cancel = this.isCancel;
    // classes.icon = !!this.icon;
    // context.attr('role', 'button').setClass(classes);
    // 
    // theme = this.oldButtonTheme;
    // if (theme) context.addClass(theme);
    
    
    this.renderContents(context);
  },
  
  renderContents: function(context) {
		// context.begin("div").addClass(["disclosure", "button"]).css("border", "1px solid").end()
    // context.begin('img').end();	
    this._titleRenderer.render(context);
  },
  
  update: function() {
		var del = this.contentDelegate	
	
    this._controlRenderer.attr({
      isEnabled: this.isEnabled,
      isActive: this.isActive,
      // isSelected: this.isSelected,
			isSelected: SC.none(this.isSelected) ? del.isSelected(this.contentIndex) : this.isSelected,
      controlSize: this.controlSize
    });
console.log(this.contentValueKey, this.content.get(this.contentValueKey))
    this._titleRenderer.attr({
      title: this.content.get(this.contentValueKey) + "bob",
      icon: this.icon,
      needsEllipsis: this.needsEllipsis,
      escapeHTML: this.escapeHTML
    });
    
    // do actual updating
    this._controlRenderer.update();

		// var img = this.$(img)
		// img.css('display', this.content.)
    
    // var classes, theme, q = this.$();
    // 
    // classes = this._TEMPORARY_CLASS_HASH ? this._TEMPORARY_CLASS_HASH : this._TEMPORARY_CLASS_HASH = {};
    // classes.def = this.isDefault;
    // classes.cancel = this.isCancel;
    // classes.icon = !!this.icon;
    // 
    // q.setClass(classes);
    // theme = this.oldButtonTheme;
    // if (theme) q.addClass(theme);
    // 
    
    // update title
    this.updateContents();
  },
  
  updateContents: function() {
    this._titleRenderer.update();
  },
  
  didAttachLayer: function(layer){
    this._titleRenderer.attachLayer(layer);
    this._controlRenderer.attachLayer(layer);
  },
  
  didDetachLayer: function() {
    this._titleRenderer.detachLayer();
    this._controlRenderer.detachLayer();
  }
});
SC.EmptyTheme.renderers.listItem = SC.EmptyTheme.renderers.ListItem.create();