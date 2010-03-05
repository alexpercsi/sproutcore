sc_require('views/thumb')

SC.SimpleLayout = {
	isLayout: YES,
	isDividedLayout: YES,

	layoutDirection: SC.LAYOUT_HORIZONTAL,

	thicknesses: null,
	thicknessesBindingDefault: SC.Binding.multiple(),

	totalThickness: 0,
	
	thicknessKey: null,
	
	
	// implement these methods to determine whether a view should be
	// considered one of the main views to be resized, and whether
	// the view should be positioned along with the main views
	// (i.e. we use these to position dividers along with the main views
	//    without causing yet more dividers to be created on addChild)

	handleViewSize: function(view) {
		return YES
	},
	
	handleViewPosition: function(view) {
		return YES
	},

	didAddChild: function(view, beforeView) {
		if(this.handleViewSize && !this.handleViewSize(view))
			return
			
		var views = this.get('views')
		var idx
		var thicknesses = this.get('thicknesses')
		if(SC.none(thicknesses))
			thicknesses = this.set('thicknesses', [])

		if(SC.none(beforeView))
			idx = thicknesses.get('length')
		else
			idx = views.indexOf(beforeView)

		views.insertAt(idx, view)
		var thickness = this.defaultThicknessForView(idx, view)
		thicknesses.insertAt(idx, thickness)
		this.set('totalThickness', this.get('totalThickness') + thickness)
	},

	didRemoveChild: function(view) {
		if(this.handleViewSize && !this.handleViewSize(view))
			return

		var views = this.get('views')
		var thicknesses = this.get('thicknesses')
		var idx = views.indexOf(view)
		views.removeAt(idx, 1)
		thicknesses.removeAt(idx, 1)
		if(this.get('showDividers'))
			this.removeDivider(this.get('dividers').objectAt(idx))
	},

	childViewsDidChange: function() {
		this.set('views', this.get('childViews').slice())
		this._div_reload(null)
	}.observes('childViews'),
	

	_div_reload: function(indexes) {
		var childViews = this.get('childViews')
		this._offsetCache = null
		var last = null
		childViews.forEach(function(v, i) {
			if(!this.handleViewPosition || this.handleViewPosition(v))
				v.adjust(this.layoutForView(i, v))
			if(!v.spacer)
				last = i
		}, this)
		
		this.set('totalThickness', this.offsetForView(last + 1))
	},

  layoutForView: function(idx, view) {
		var ret = {top: 0, left: 0, right: 0, bottom: 0}
		var direction = this.get('layoutDirection')
		if((direction == SC.LAYOUT_HORIZONTAL))
			delete ret['right']
		else
			delete ret['bottom']
		
		ret[(direction == SC.LAYOUT_HORIZONTAL) ? 'left' : 'top'] = this.offsetForView(idx, view)

		if(view.get('spacer'))
			ret[(direction == SC.LAYOUT_HORIZONTAL) ? 'right' : 'bottom'] = 0
		else
			ret[(direction == SC.LAYOUT_HORIZONTAL) ? 'width' : 'height'] = this.thicknessForView(idx, view)
			
		return ret
	},

	thicknessForView: function(idx, view) {
		if(!view)
			view = this.get('childViews').objectAt(idx)

		var views = this.get('views')
		var idx = views.indexOf(view)
		var key = this.get('thicknessKey')
		var thicknesses = this.get('thicknesses')
		var ret = this.get('thicknesses').objectAt(idx)
		if(key && ret && ret.get)
			ret = ret.get(key)
		else if(SC.none(ret) && !view.spacer)
			this.get('thicknesses').replace(idx, 1, (ret = this.defaultThicknessForView(idx, view)))

		return ret
	},

	offsetForView: function(idx, view) {
		var cache = this._offsetCache;
		if (!cache)
			cache = this._offsetCache = [];

		if(SC.none(this._offsetCache[idx])) {
			if(idx > 0)
				this._offsetCache[idx] = this.offsetForView(idx - 1) + this.thicknessForView(idx - 1)
			else
				this._offsetCache[idx] = 0
		}
	
		return this._offsetCache[idx]
	},

	defaultThicknessForView: function(idx, view) {
		return 120;
	},

	minimumThicknessForView: function(idx, view) {
		return 10;
	},

	maximumThicknessForView: function(idx, view) {
		return 9999;
	},


	thicknessesDidChange: function() {
		var thicknesses = this.get('thicknesses')
		if (SC.none(thicknesses) || thicknesses === this._thicknesses) return this; // nothing to do

		var observer   = this._dv_thicknessesRangeObserver
		var func = this.thicknessesRangeDidChange;

    // cleanup old content
		if(this._thicknesses)
			this._thicknesses.removeRangeObserver(observer)
	
		observer = thicknesses.addRangeObserver(null, this, func, null);      
		this._dv_thicknessesRangeObserver = observer ;

		this._thicknesses = thicknesses
		this.thicknessesRangeDidChange(null, null, '[]')
	}.observes('thicknesses'),

	thicknessesRangeDidChange: function(content, object, key, indexes) {
		this._div_reload(indexes);
	},
	
	_div_totalThicknessDidChange: function() {
		this.adjust('minWidth', this.get('totalThickness'))
		this.set('calculatedWidth', this.get('totalThickness'))
	}.observes('totalThickness'),
	


	swapViews: function(view1, view2) {
		var views = this.get('views')
		var childViews = this.get('childViews')
		var thicknesses = this.get('thicknesses')
		var index1 = childViews.indexOf(view1)
		var index2 = childViews.indexOf(view2)

		var before1 = childViews.objectAt(index1 + 1)
		var before2 = childViews.objectAt(index2 + 1)
		childViews.replace(index1, 1, view2)
		childViews.replace(index2, 1, view1)

		var index1 = views.indexOf(view1)
		var index2 = views.indexOf(view2)
		views.replace(index1, 1, view2)
		views.replace(index2, 1, view1)

		var thickness1 = thicknesses.objectAt(index1)

		thicknesses.beginPropertyChanges()
		thicknesses.replace(index1, 1, thicknesses.objectAt(index2))
		thicknesses.replace(index2, 1, thickness1)
		thicknesses.endPropertyChanges()
	},


}