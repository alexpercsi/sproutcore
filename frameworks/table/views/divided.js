// require('mixins/simple_layout')
// require('views/thumb')
// 
// SC.DividerView = SC.View.extend(SC.SimpleLayout, {
// 	showDividers: YES,
// 
// 	dividerThickness: 6,
// 	
// 	dividerSpacing: function() {
// 		return this.get('dividerThickness')
// 	}.property('dividerThickness').cacheable(),
// 
// 	dividerOffset: function() {
// 		return 0
// 	}.property('dividerThickness', 'dividerSpacing').cacheable(),
// 	
// 	dividerView: SC.ThumbView.extend({
// 	}),
// 	
// 	boundDividerView: function() {
// 		return this.get('dividerView').extend({
// 			isDivider: YES,
// 			delegate: this
// 		})
// 	}.property('dividerView').cacheable(),
// 	
// 	addDivider: function(beforeView) {
// 		if(!this.get('showDividers'))
// 			return
// 		var view = this.createChildView(this.get('boundDividerView'))
// 		var dividers = this.get('dividers')
// 		dividers.push(view)
// 	
// 		this.insertBefore(view, beforeView)
// 	},
// 
// 	removeDivider: function(view) {
// 		this.removeChild(view)
// 	},
// 	
// 	handleViewSize: function(view) {
// 		return !view.isDivider && !this.get('_dragging')
// 	},
// 	
// 	handleViewPosition: function(view) {
// 		return !this.get('_dragging') || this.get('_dragging') != view
// 	},
// 	
// 	containerView: function() {
// 		return this
// 	}.property().cacheable(),
// 	
// 	childViewsDidChange: function() {
// 		sc_super()
// 		// var views = this.get('views')
// 		// 
// 		// if(this.get('showDividers')) {
// 		// 	var dividers = this.get('dividers')
// 		// 	if(dividers)
// 		// 		dividers.forEach(function(i) {
// 		// 			this.removeDivider(i)
// 		// 		}, this)
// 		// 	this.set('dividers', [])
// 		// }
// 		// 
// 		// views.forEach(function(v, i) {
// 		// 	if(v.spacer)
// 		// 		return
// 		// 
// 		// 	var view = views.objectAt(i + 1)
// 		// 	this.addDivider(view)
// 		// }, this)
// 	}.observes('childViews'),
// 	
// 
// 	
// 
// 	/** Delegate methods */
//  
// 	/**
// 		Delegate method for the dividerView.
// 		Caches the allowed drag range for the divider.
// 	
// 		@params {SC.View} thumbView the divider
// 		@params {Event} evt the click event
// 	*/
// 	thumbViewDidBeginDrag: function(divider, evt) {
// 		var direction = this.get('layoutDirection')
// 		this._lastPoint = (direction == SC.LAYOUT_HORIZONTAL ? evt.pageX : evt.pageY)
// 		this._bodyClasses = document.body.className
// 		document.body.className += " resizing-horizontally"
// 	},
//  
// 	/**
// 		Delegate method for the dividerView.
//  
// 		Handles the actual drag of the divider view by adjusting the drag
// 		offset as needed and then passing that value to 
// 		adjustThicknessesForDividerAtIndex_byOffset
// 	
// 		@params {SC.View} thumbView the divider
// 		@params {Event} evt the click event
// 	*/
// 	thumbViewWasDragged: function(divider, evt) {
// 		var direction = this.get('layoutDirection')
// 		var lastPoint = this._lastPoint
// 		var lastOffset = this._lastOffset || 0
// 		var point = (direction == SC.LAYOUT_HORIZONTAL ? evt.pageX : evt.pageY)
// 		var offset = point - lastPoint
// 	
// 		// If we're going in the same direction, did we hit the barrier last time?
// 		if(lastOffset * offset > 0)
// 			if(this._reachedLimit)
// 				return
// 			
// 		this._reachedLimit = this._resizeDividerByOffset(divider, offset) > 0
// 
// 		this._lastPoint = point
// 		this._lastOffset = offset
// 	
// 		// this._div_reload()
// 
// 	},
// 
// 
// 	/**
// 		Delegate method for the dividerView. 
//  
// 		Resets some cached properties.
//  
// 		@params {SC.View} thumbView the divider
// 		@params {Event} evt the click event
// 	*/
// 	thumbViewDidEndDrag: function(divider, evt) {
// 		this._lastPoint = this._lastOffset = this._reachedLimit = this._minIndex = null
// 		document.body.className = this._bodyClasses
// 	},
//  
// 	_resizeDividerByOffset: function(divider, offset) {
// 
// 		var headers = this.get('headers')
// 		var position = headers.indexOf(divider)
// 		return this._adjustContentThickness(position, offset)
// 	
// 		// for splitview:
// 		// if(offset < 0) {
// 		// 	adjustedOffset = this._adjustContentThickness(next, offset * -1) * -1
// 		// 	return this._adjustContentThickness(previous, adjustedOffset, true)
// 		// } else {
// 		// 	adjustedOffset = this._adjustContentThickness(previous, offset) * -1
// 		// 	return this._adjustContentThickness(next, adjustedOffset, true)
// 		// }
// 	},
// 
// 	_adjustContentThickness: function(item, delta, chain) {
// 		var thicknesses = this.get('thicknesses'), newThickness, ret
// 		var thickness = thicknesses.objectAt(item)
// 		var key = this.get('thicknessKey')
// 		if(thickness && thickness.get && key) {
// 			thickness = thickness.get(key)
// 			newThickness = Math.max(10, thickness + delta)
// 			thicknesses.objectAt(item).set(key, newThickness)
// 		} else {
// 			newThickness = Math.max(10, thickness + delta)
// 			thicknesses.replace(item, 1, newThickness)
// 		}
// 		ret = newThickness - thickness - delta
// 		// if(ret == 0 || !chain)
// 			// return ret
// 
// 		return ret
// 
// 		// return this._adjustContentThickness(content.objectAt(index + (delta > 0 ? 1 : -1)), ret, true)
// 	},
// 	
// 	
// 	thicknessForView: function(idx, view) {
// 		if(!view)
// 			view = this.get('childViews').objectAt(idx)
// 		if(view && view.isDivider)
// 			return this.get('dividerThickness')
// 		else
// 			return sc_super()
// 	},
// 
// 	offsetForView: function(idx, view) {
// 		var cache = this._offsetCache;
// 		if (!cache)
// 			cache = this._offsetCache = [];
// 		if(cache[idx])
// 			return cache[idx]
// 			
// 		sc_super()
// 		if(idx > 0 && this.get('showDividers'))
// 			this._offsetCache[idx] -= this.get('dividerOffset')
// 	
// 		return this._offsetCache[idx]
// 	},
// 	
// 	
// 	
// 	/**
// 		Delegate method for the dividerView.
// 		Caches the allowed drag range for the divider.
// 	
// 		@params {SC.View} thumbView the divider
// 		@params {Event} evt the click event
// 	*/
// 	anchorViewDidBeginDrag: function(divider, evt) {
// 		this.set('_dragging', divider)
// 		var direction = this.get('layoutDirection')
// 		this._lastPoint = (direction == SC.LAYOUT_HORIZONTAL ? evt.pageX : evt.pageY)
// 		lastPoint = (direction == SC.LAYOUT_HORIZONTAL ? divider._initialX : divider._initialY)
// 
// 		var offset = this._lastPoint - lastPoint
// 	
// 	
// 		this.adjustDrag(divider, offset)
// 		return offset
// 	},
//  
// 	/**
// 		Delegate method for the dividerView.
//  
// 		Handles the actual drag of the divider view by adjusting the drag
// 		offset as needed and then passing that value to 
// 		adjustThicknessesForDividerAtIndex_byOffset
// 	
// 		@params {SC.View} thumbView the divider
// 		@params {Event} evt the click event
// 	*/
// 	anchorViewWasDragged: function(divider, evt) {
// 		var direction = this.get('layoutDirection')
// 		var lastPoint = this._lastPoint
// 		var point = (direction == SC.LAYOUT_HORIZONTAL ? evt.pageX : evt.pageY)
// 		var offset = point - lastPoint
// 	
// 		this._lastPoint = point
// 		this.adjustDrag(divider, offset)
// 		return offset
// 	},
// 
// 
// 
// 	/**
// 		Delegate method for the dividerView. 
//  
// 		Resets some cached properties.
//  
// 		@params {SC.View} thumbView the divider
// 		@params {Event} evt the click event
// 	*/
// 	anchorViewDidEndDrag: function(divider, evt) {
// 		this._lastPoint = null
// 		this.set('_dragging', null)
// 		this._div_reload(null)
// 	},
// 
// 	adjustDrag: function(view, offset) {
// 		var direction = this.get('layoutDirection')
// 		var frame = view.get('frame')
// 		var put = (direction == SC.LAYOUT_HORIZONTAL ? frame['x'] : frame['y']) + offset
// 		view.adjust((direction == SC.LAYOUT_HORIZONTAL ? 'left' : 'top') , put)
// 		
// 		this.set('_draggingOffset', put)
// 		
// 		var views = this.get('views')
// 		var childViews = this.get('childViews')
// 		var index = views.indexOf(view)
// 		var view2
// 
// 		if(offset < 1 && index > 0)
// 			var index2 = index - 1
// 		else if(offset > 1 && index < views.get('length') - 1)
// 			var index2 = index + 1
// 
// 		view2 = views.objectAt(index2)
// 		if(!view2 || view2.spacer)
// 			return
// 			
// 		index2 = childViews.indexOf(view2)
// 		var centerPoint = this.offsetForView(index2, view2) + (this.thicknessForView(index2, view2) / 2)
// 		
// 		if(offset < 1 && (view.get('frame').x > centerPoint))
// 			return
// 		else if(offset > 1 && (view.get('frame').x + view.get('frame').width < centerPoint))
// 			return
// 		
// 		this.swapViews(view, view2)
// 	}
// 
// 
// })