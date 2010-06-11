sc_require('views/thumb');
SC.TableHeaderCellView = SC.View.extend(SC.Button,{
  
  layout:{top:0,bottom:0},
  
  classNames: ['sc-table-cell'],

	titleBinding: '.column.label',
	
	tagName: 'div',
	
	sortDescriptor: null,
	sortDescriptorBinding: '.parentView*sortDescriptor',
	
	childViews: 'labelView thumbView'.w(),
	
	labelView: SC.LabelView.extend({
		tagName: 'label',
		valueBinding: '.parentView*column.label'
	}),
	
	thumbView: SC.ThumbView.extend({
		delegateBinding: '.parentView',
		layout: {
			top: 0, bottom: 0, right: 0, width: 16
		}
	}),
	
	sortState: function() {
		var key = this.get('sortDescriptor');
		if(!key || this.spacer)
		{
			return;
		}
		
		var descending = NO;

		if(SC.typeOf(key) == "array")
		{
			key = key[0];
		}
			
	  if (key.indexOf('ASC') > -1) {
	     	key = key.split('ASC ')[1];
	     } else if (key.indexOf('DESC') > -1) {
	       key = key.split('DESC ')[1];
	       descending = YES;
	     }
		if(key == this.get('column').get('key'))
		{
			return descending ? "DESC" : "ASC";
		}
		
		return "none";
	}.property('sortDescriptor').cacheable(),
	
  displayProperties: ['dragging', 'sortState'],

	sortStateBinding: '*column.sortState',
	
	render: function(context, firstTime) {
    var href, toolTip, classes, theme;
		var sortState = this.get('sortState');

    classes = this._TEMPORARY_CLASS_HASH || {};
		classes.asc = (sortState  == "ASC");
		classes.desc = (sortState == "DESC");
		classes.selected = !SC.none(sortState) && sortState !== "none";
		classes.draggging = this.get('dragging');
	  classes.def = this.get('isDefault');
	  classes.cancel = this.get('isCancel');
		
    classes.icon = !!this.get('icon');
		classes.dragging = this.get('dragging');
	  
	  context.attr('role', 'button').setClass(classes);
	  theme = this.get('theme');
	  if (theme) context.addClass(theme);

    if (firstTime) this.renderChildViews(context, firstTime) ;
  },
	
  mouseDown: function(evt) {
		this._initialX = evt.pageX;
		return sc_super();
	},
		
	mouseDragged: function(evt) {
		var x = evt.pageX;
		if(!this._dragging)
		{
		 	if(Math.abs(this._initialX - x) < 6)
		 	{
				return;
			}
			else {
				this._dragging = YES;
				this.set('dragging', YES);
				this.invokeDelegateMethod(this.delegate, 'headerDidBeginDrag', this, evt);
				return YES;
			}
		}
			var lastX = this._lastX;
			if(SC.none(lastX))
			{
				lastX = this._lastX = x;
			}

		var offset = x - lastX;
		this._lastX = x;
		
		this.invokeDelegateMethod(this.delegate, 'headerWasDragged', this, offset, evt);
		return YES;
  },

	mouseUp: function(evt) {
		if(this._dragging) {
			this.set('dragging', NO);
			this.invokeDelegateMethod(this.delegate, 'headerDidEndDrag', this, evt);
			this._dragging = false;
		} else {
			this.get('parentView').get('table').sortByColumn(this.get('column'), this.get('sortState'));
		}
		this._lastX = null;
		return sc_super();
	},
	
	thumbViewWasDragged: function(view, offset, evt) {
		var column = this.get('column'),
			width = column.get('width') || 100,
			minWidth = column.get('minWidth') || 20,
			maxWidth = column.get('maxWidth'),
			newWidth;
			
		newWidth = Math.max(minWidth, width + offset.x);
		if(maxWidth)
		{
			newWidth = Math.min(maxWidth, newWidth);
		}

		column.set('width', newWidth);
		this.invokeDelegateMethod(this.delegate, 'thumbWasDragged', this, offset, evt);
	},
	
	thumbViewDidBeginDrag: function(view, offset, evt) {
	  this.set('dragging',YES);
	},
	
	thumbViewDidEndDrag: function(view, offset, evt){
	  this.set('dragging',NO);
	  this.invokeDelegateMethod(this.delegate, 'headerDidEndDrag', this, evt);
	}

});