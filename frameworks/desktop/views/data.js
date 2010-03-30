// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/list');

SC.DataView = SC.ListView.extend({

	useRenderer: YES,
	
	childViews: ["containerView"],
	containerView: SC.View,

	addCell: function(fullReload) {
		var cells = this.get('cells'),
			hiddenCells = this.get('hiddenCells'),
			cell = hiddenCells ? hiddenCells.shiftObject() : null,
			row, cellIdx, ret

		if(fullReload) {
			row = cells.get('length')
			ret = this._createCell(!fullReload, this.layoutForContentIndex(row))
			cells.push(this.layerIdFor(row))
			return ret
		}
			
		if(!cell) {
			cell = this._createCell(true)
			cells.push(cell)
		}
		
		return cell
	},
	
	hideCell: function(cell) {
		// return
		
		if(SC.none(cell))
			return

		var hiddenCells = this.get('hiddenCells'),
			cells = this.get('cells')
			
		hiddenCells.push(this.cellForIndex(cell))
	},

	_createCell: function(force, initialLayout) {
		// console.log("CREATING")
		var renderer = this.cellRenderer,
			idx = this.get('cells').get('length'),
			containerView = this.get('containerView') || this,
			element,
			context = SC.RenderContext("div").css("position", "absolute").css(initialLayout).id(this.layerIdFor(idx))
			.css("position", "relative")
			// .css('overflow', 'hidden')
			// .css('float', 'left')

		if(this.useRenderer) {
		 	if(!renderer)
				renderer = this.cellRenderer = this.get('theme').listItem({contentDelegate: this})		
			renderer.render(context);
		}

		if(force) {
			element = context.element();
			containerView.get('layer').appendChild(element)
			return element
		}
		return context
	},
	
	reloadCell: function(cellIdx, attrs) {
		var cells = this.get('cells'),
			cell = this.cellForIndex(cellIdx)
			row = this.contentIndexForCell(cellIdx),
			column = 0

		var ret = this._redrawLayer(cell, attrs, row, column)
		if(!this.useRenderer)
			cell.innerHTML = ret.join("")
		
		SC.$(cell).css(this.layoutForContentIndex(row))
	},
	
	_redrawLayer: function(layer, attrs, row, column) {
		var renderer = this.cellRenderer, context

		if(this.useRenderer) {
			if(!layer)
				return
			// renderer.attachLayer(layer)
			// renderer.attr(attrs)
			// renderer.update()
			layer.innerHTML = attrs.content.get('subject')
		} else {
			view = this.viewForRowAndColumn(row, column, YES) 
			context = view.renderContext(view.get('tagName'))
    	view.renderToContext(context) ;
			return context
		}
	},

  reloadIfNeeded: function() {
	  var invalid = this._invalidIndexes;
    if (!invalid || !this.get('isVisibleInWindow')) return this ; // delay
  
		var nowShowing = this.get('nowShowing')

		// if(!invalid.isIndexSet)
			this._invalidIndexes = nowShowing

		if(!this._cellsHash) this._cellsHash = {}
		if(!this._rowsHash) this._rowsHash = {}
		if(!this.get('cells')) this.set('cells', [])
		if(!this.get('hiddenCells')) this.set('hiddenCells', [])
		
		console.log(this._invalidIndexes.isIndexSet ? this._invalidIndexes.toArray().get('length') : this._invalidIndexes)
		
		sc_super()
		
		SC.$(this.get('hiddenCells')).css("left", "-9999px")

		return this
	},
	
	removeItemViewForRowAndColumn: function(row, column) {
		return 
		var cellsHash = this._cellsHash,
			rowsHash = this._rowsHash,
			key = row + "," + column,
			hash = cellsHash[key],
			cellIdx = this.get('cells').indexOf(hash)
			hash = this.cellForIndex(cellIdx)

		if(!SC.none(hash)) {
			this.hideCell(cellIdx)
			delete cellsHash[key]	
			delete rowsHash[cellIdx]
		}
	},
	
	cellForIndex: function(idx) {
		var cells = this.get('cells'),
			cell = cells.objectAt(idx)

		if(SC.typeOf(cell) == "string") {
			cell = document.getElementById(cell)
			cells.replace(idx, 1, cell)
		}
		
		if(!cell)
			return this.addCell()
		
		return cell
	},
	
	addItemViewForRowAndColumn: function(row, column, fullReload) {
		var cells = this.get('cells'),
			cellsHash = this._cellsHash,
			rowsHash = this._rowsHash,
			key = row + "," + column,
			cell = cellsHash[key],
			cellIdx = cells.indexOf(cell),
			cell = SC.typeOf(cell) == "string" ? (cellsHash[key] = document.getElementById(cell)) : cell,
			content = this.get('content'),
			item = content.objectAt(row),
			cellIdx, layerId, view, ret
			// fullReload = fullReload && !this.useRenderer,
			cell = this.cellForIndex(row - this.get('nowShowing').get('min'))
			if(!cell) {
				cell = this.addCell(fullReload)
				rowsHash[cellIdx] = row

				if(fullReload) {
					cellIdx = cells.get('length') - 1
					layerId = this.layerIdFor(cellIdx)
					ret = this._redrawLayer(null, null, row, column)
					cell.push(ret ? ret.join("") : "")
					cellsHash[key] = layerId
					return cell.join("")
				} else {
					cellIdx = cells.indexOf(cell)
					cellsHash[key] = cell
				}

			} else {
				cellIdx = cells.indexOf(cell)

				if(cell && cells[cellIdx] != cell)
					cells[cellIdx] = cell
					

			}

			rowsHash[cellIdx] = row				
			this.reloadCell(cellIdx, {content: item, contentIndex: row})
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
	
	viewForRowAndColumn: function(row, column) {
		if(!this.useRenderer)
			return sc_super()

		var cellsHash = this._cellsHash,
			key = row + "," + column,
			cell = this._cellsHash[key]

		if(SC.typeOf(cell) == "string")
			cell = cellsHash[key] = document.getElementById(cell)

		return cell
	},
	
  contentIndexForLayerId: function(id) {
		var ret = sc_super()
		return ret ? this.contentIndexForCell(ret) : ret
	},
	
	adjustFrame: function() {
		var frame = this.get('frame'),
		clippingFrame = this.get('clippingFrame')
		var containerView = this.get('containerView')
		containerView.adjust({
			top: frame.y * -1,
			left: 0,
			width: frame.width,
			height: clippingFrame.height
		})
	}.observes('clippingFrame'),
	// 
	// layoutForContentIndex: function(row) {
	// 	  var rowHeight = this.get('rowHeight') || 48,
	//         frameWidth = this.get('clippingFrame').width,
	//         itemsPerRow = this.get('itemsPerRow'),
	//         columnWidth = Math.floor(frameWidth/itemsPerRow),
	//         row = Math.floor(row / itemsPerRow),
	//         col = row - (itemsPerRow*row) ;
	//     return { 
	//       height: rowHeight,
	//       width: columnWidth
	//     };
	//   },
	
	layoutForContentIndex: function(row) {
		var ret = sc_super()
		delete ret.top
		return ret
  },
	

	contentIndexForCell: function(cell) {
		return this._rowsHash[cell]
	},

  scrollToItemView: function(view) {},

	isSelected: function(item) {
		var sel = this.get('selection')
		return sel ? sel.contains(this.get('content'), item) : NO
	},
	
	contentIndexForItemView: function(itemView) {
		if(!itemView) return -1
		return this.contentIndexForCell(this.get('cells').indexOf(itemView))
	}
	
});