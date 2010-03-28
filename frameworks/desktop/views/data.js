// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/list');

SC.DataView = SC.ListView.extend({
	
	init: function() {
		sc_super()
		this.cellRenderer = this.get('theme').listItem({contentDelegate: this})
		return this
	},
	
	addCell: function() {
		var cells = this.get('cells'),
			hiddenCells = this.get('hiddenCells'),
			cell = hiddenCells ? hiddenCells.shiftObject() : null
			
		if(!cell) {
			cell = this._createCell()
			cells.push(cell)
		}

		return cell
	},
	
	hideCell: function(cell) {
		if(!cell)
			return

		var hiddenCells = this.get('hiddenCells')
		hiddenCells.push(cell)
	},

	_createCell: function() {
		var renderer = this.cellRenderer,
			idx = this.get('cells').get('length'),
			context = SC.RenderContext("div").css("position", "absolute").id(this.layerIdFor(idx)),
			containerView = this.get('containerView') || this,
			element
		
		renderer.render(context);
		element = context.element();
		containerView.get('layer').appendChild(element)
		return element
	},
	
	reloadCell: function(cellIdx, attrs) {
		var renderer = this.cellRenderer,
			cells = this.get('cells'),
			cell = cells.objectAt(cellIdx)

		renderer.attachLayer(cell)
		renderer.attr(attrs)
		renderer.update()
		SC.$(cell).css(this.layoutForContentIndex(this.contentIndexForCell(cellIdx)))
	},

  reloadIfNeeded: function() {
	  var invalid = this._invalidIndexes;
    if (!invalid || !this.get('isVisibleInWindow')) return this ; // delay
  
		var nowShowing = this.get('nowShowing')
		if(!invalid.isIndexSet)
			this._invalidIndexes = nowShowing

		if(!this._cellsHash) this._cellsHash = {}
		if(!this._rowsHash) this._rowsHash = {}
		if(!this.get('cells')) this.set('cells', [])
		if(!this.get('hiddenCells')) this.set('hiddenCells', [])
		
		sc_super()
		
		SC.$(this.get('hiddenCells')).css("left", "-9999px")

		return this
	},
	
	removeItemViewForRowAndColumn: function(row, column) {
		var cellsHash = this._cellsHash,
			rowsHash = this._rowsHash,
			key = row + "," + column,
			hash = cellsHash[key],
			cellIdx = this.get('cells').indexOf(hash)
			
		if(!SC.none(hash)) {
			this.hideCell(hash)
			delete cellsHash[key]	
			delete rowsHash[cellIdx]
		}
	},
	
	addItemViewForRowAndColumn: function(row, column) {
		var cells = this.get('cells'),
			cellsHash = this._cellsHash,
			rowsHash = this._rowsHash,
			key = row + "," + column,
			cell = cellsHash[key],
			content = this.get('content'),
			item = content.objectAt(row),
			cellIdx
			
			if(!cell) {
				cell = this.addCell()
				cellIdx = cells.indexOf(cell)
				cellsHash[key] = cell
				rowsHash[cellIdx] = row
			} else
				cellIdx = cells.indexOf(cell)
				
			this.reloadCell(cellIdx, {content: item})
	},

	reloadSelectionIndexesIfNeeded: function() {
		var invalid = this._invalidSelection
		if (!invalid || !this.get('isVisibleInWindow')) return this 
		this._invalidSelection = NO
		this.reload(invalid)
	},

	cellForRowAndColumn: function(row, column) {
		if(SC.none(column)) column = 0
		return this.get('cells').indexOf(this._cellsHash[row + "," + column])
	},
	
	viewForRowAndColumn: function(row) {
		return this.cellForRowAndColumn(row, 0)
	},
	
  contentIndexForLayerId: function(id) {
		var ret = sc_super()
		return ret ? this.contentIndexForCell(ret) : ret
	},

	contentIndexForCell: function(cell) {
		return this._rowsHash[cell]
	},

  scrollToItemView: function(view) {},

	isSelected: function(item) {
		var sel = this.get('selection')
		return sel ? sel.contains(item) : NO
	}
	
});