// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/list');

SC.ListView = SC.ListView.extend({
	
	// rowHeight: 6,
	
	childViews: ["containerView"],
	
	containerView: SC.View,
	
	conformCells: function() {
		var nowShowing = this.get('nowShowing'),
			columns = 1,
			//this.get('columns') || 
			len = nowShowing.get('length') * columns,
			cells = this.get('cells'),
			numCells = cells ? cells.get('length') : 0, i
			
		if(!cells)
			cells = this.set('cells', [])
			
		for(i = len; i < numCells; i++)
			this.hideCell()
	
		for(i = numCells; i < len; i++)
			this.addCell()
	},

	hideCell: function() {
		var cells = this.get('cells'),
			hiddenCells = this.get('hiddenCells'),
			cell = cells.pop()
		
		if(!cell)
			return

		SC.$(cell).css('display', 'none')
		
		if(!hiddenCells)
			this.set('hiddenCells', (hiddenCells = []))
			
		hiddenCells.push(cell)
	},
	
	addCell: function() {
		var cells = this.get('cells'),
			hiddenCells = this.get('hiddenCells'),
			cell = hiddenCells ? hiddenCells.shiftObject() : null
			
		if(cell)
			cells.push(cell)
		else {
			cells.push(this.createCell(cells.get('length') + (hiddenCells ? hiddenCells.get('length') : 0)))
		}	
		
		cell = cells.objectAt(-1)
		SC.$(cell).css('display', 'block')
		return cell
	},
	
	createCell: function(idx) {
		var renderer = this.cellRenderer,
			context = SC.RenderContext("div").id("row-" + idx),
			element
		
		if(!renderer)
			renderer = this.cellRenderer = SC.EmptyTheme.renderers.listItem()

		renderer.render(context)
		element = context.element();
		(this.get('containerView') || this).get('layer').appendChild(element)
		return element
	},

	reloadCell: function(cell, row) {
		var cells = this.get('cells'),
			cell = cells.objectAt(cell),
			renderer = this.cellRenderer,
			content = this.get('content'),
			item = content.objectAt(row)
			
		renderer.attachLayer(cell)
		// renderer.attr('title', "row " + row)
		renderer.attr('content', item)
		renderer.update()
		SC.$(cell).css(this.layoutForContentIndex(row))
		return cell
	},

  reloadIfNeeded: function() {
	  var invalid = this._invalidIndexes;
    if (!invalid || !this.get('isVisibleInWindow')) return this ; // delay
  
    this._invalidIndexes = NO ;

		var cells = this.get('cells'),
			layout  = this.computeLayout(),
			nowShowing = this.get('nowShowing'),
			containerView = this.get('containerView') || this,
			columns = this.get('columns') || NO,
			cellsHash = this._cellsHash, cell
		
		if(!cellsHash)
			cellsHash = this._cellsHash = []
			
		this.conformCells()

		bench=("%@ dataview reload" + Math.random(10000)).fmt(this)
		SC.Benchmark.start(bench);

		nowShowing.forEach(function(idx, i) {
			// (columns || [this]).forEach(function(col, j) {
				this.reloadCell(i, idx)
			// }, this)
		}, this)
	
		// complex updating might benefit from 
		// leaving unchanged views intact and
		// merely shifting around detritus,
		// but it's actually slow for super simple
		// stuff
	
		// if(!invalid.isIndexSet)
		// 	invalid = nowShowing
		// 
		//     invalid.forEach(function(idx) {
		//      	if (nowShowing.contains(idx)) {
		// 		// console.log("add " + idx)
		// 		cell = this.addCell()
		// 		cellsHash[idx] = cells.indexOf(cell)
		// 		this.reloadCell(cell, idx)
		// 	} else {
		// 		// console.log("remove " + idx)
		// 		if(cellsHash[idx])
		// 			this.hideCell(cellsHash[idx])
		// 		delete cellsHash[idx]
		// 	}
		// }, this)

		SC.Benchmark.end(bench)

    // adjust my own layout if computed
    if (layout) { this.adjust(layout); }
		

    return this ;
  },
	
	frameDidChange: function() {
		var frame = this.get('frame')
	
		this.get('containerView').adjust({
			top: frame.y * -1,
			left: frame.x,
			width: frame.width,
			height: frame.height
		})
	}.observes('frame'),
	
	layoutForContentIndex: function(contentIndex) {
		var frame = this.get('frame')
	    return {
	      top:    this.rowOffsetForContentIndex(contentIndex) - (frame.y * -1),
	      height: this.rowHeightForContentIndex(contentIndex),
	      left:   0, 
	      right:  0
	    };
	  }
  

});
