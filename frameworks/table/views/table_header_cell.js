SC.TableHeaderCellView = SC.ButtonView.extend({
  classNames: ['endash-table-cell'],

	titleBinding: '.column.label',
	
	tagName: 'div',
	
	sortDescriptor: null,
	sortDescriptorBinding: '.parentView*sortDescriptor',
	
	sortState: function() {
		var key = this.get('sortDescriptor')
		if(!key || this.spacer)
			return
		
		var descending = NO

		if(SC.typeOf(key) == "array")
			key = key[0]
			
	  if (key.indexOf('ASC') > -1) {
	     	key = key.split('ASC ')[1];
	     } else if (key.indexOf('DESC') > -1) {
	       key = key.split('DESC ')[1];
	       descending = YES;
	     }
		if(key == this.get('column').get('key'))
			return descending ? "DESC" : "ASC"
		
		return "none"
	}.property('sortDescriptor').cacheable(),
	
  displayProperties: ['dragging', 'sortState'],

	sortStateBinding: '*column.sortState',
	
	render: function(context, firstTime) {
		// if(!firstTime)
			// return
			
    // add href attr if tagName is anchor...
    var href, toolTip, classes, theme;
		var sortState = this.get('sortState')
		
    if (this.get('tagName') === 'a') {
      href = this.get('href');
      if (!href || (href.length === 0)) href = "javascript:;";
      context.attr('href', href);
    }

    // If there is a toolTip set, grab it and localize if necessary.
    toolTip = this.get('toolTip') ;
    if (SC.typeOf(toolTip) === SC.T_STRING) {
      if (this.get('localize')) toolTip = toolTip.loc() ;
      context.attr('title', toolTip) ;
      context.attr('alt', toolTip) ;
    }
    
    // add some standard attributes & classes.
    classes = this._TEMPORARY_CLASS_HASH;
		classes.asc = (sortState  == "ASC")
		classes.desc = (sortState == "DESC")
		classes.selected = !SC.none(sortState) && sortState !== "none"
    classes.def = this.get('isDefault');
    classes.cancel = this.get('isCancel');
		
    classes.icon = !!this.get('icon');
		classes.dragging = this.get('dragging')
    context.attr('role', 'button').setClass(classes);
    theme = this.get('theme');
    if (theme) context.addClass(theme);

    // render inner html 
     this.renderTitle(context, firstTime) ; // from button mixin
   },
	
  mouseDown: function(evt) {
		this._initialX = evt.pageX
		return sc_super()
	},
		
	mouseDragged: function(evt) {
		var x = evt.pageX

		if(!this._dragging)
		 	if(Math.abs(this._initialX - x) < 6)
				return
			else {
				this._dragging = YES
				this.set('dragging', YES)
				this.invokeDelegateMethod(this.delegate, 'anchorViewDidBeginDrag', this, evt)
				return YES
			}
		
		this.invokeDelegateMethod(this.delegate, 'anchorViewWasDragged', this, evt)
		return YES
  },

	mouseUp: function(evt) {
		if(this._dragging) {
			this.set('dragging', NO)
			this.invokeDelegateMethod(this.delegate, 'anchorViewDidEndDrag', this, evt)
			this._dragging = false
		} else {
			this.get('parentView').get('table').sortByColumn(this.get('column'), this.get('sortState'))
		}
		return sc_super()
	}

})