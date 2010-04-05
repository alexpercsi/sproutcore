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
	
	drawLevel: -1,

	levelDivs: function() {
		var divs = []
		var levels = this.get('levels')
		for(var i = 0, len = levels.get('length'); i < len; i ++)
			divs.push(document.getElementById(this.layerIdFor('level-' + i)))
		
		return divs
	}.property('cells').cacheable(),

	createDivs: function(set, level) {
		var context = SC.RenderContext("div"),
			length = set.get('length'),
			levels = this.get('levels'),
			cells = this.get('cells'),
			itemsPerLevel = this._itemsPerLevel,
			power, one, inside, two, left, right, contents = []


		if(SC.none(cells))
			cells = this.set('cells', [])
	
		if(SC.none(level))
			level = 0
							
		if(SC.none(itemsPerLevel))
				itemsPerLevel = this._itemsPerLevel = Math.ceil(length * 0.10)
					
		if(SC.none(levels)) {
			levels = []
			this.set('levels',levels)
		}
	
		if(length > 1) {
			context.id(this.layerIdFor('level-' + level)).classNames(['cv-level retain'])

			if(length <= Math.ceil(itemsPerLevel / 2) * 2) {
				one = set
			} else {
				left = Math.max(1, Math.ceil(itemsPerLevel / 2)), right = left * -1
				one = set.slice(0, left)
				inside = set.slice(left, right)
				two = set.slice(right)
			}
			
			
			if(level == 0 && two) {
				for(var i = length, j = (i + Math.max(5, Math.ceil(i * .01))); i < j; i++)
					two.push(i)
			}
			
			level++
			
			contents = contents.concat(one)
			if(two)
				contents = contents.concat(two)

			levels.push(contents)

			one.forEach(function(d) {
				context.push(this.createDivs([d], level))
			}, this)
			
			if(inside)
				context.push(this.createDivs(inside, level))

			if(two)
				two.forEach(function(d) {
					context.push(this.createDivs([d], level))
				}, this)
			
			
			
		} else {
			// being absolutely positioned
			// if(level <	 this._drawLevel)
				// context.css(this.layoutForCell(set[0], 0))

			cells[set[0]] = this.layerIdFor(set[0])
			context.id(cells[set[0]]).css('height', this.get('rowHeight'))
			
			if(this.useRenderer) {
				var renderer = this.cellRenderer
				if(!renderer)
					renderer = this.cellRenderer = this.get('theme').listItem({contentDelegate: this})
				renderer.render(context)
			}
		}

		var ret = context.join("")
		return ret
	},
	
	_dv_lengthDidChange: function() {
		delete this.cells
		delete this.levels
		delete this._cellsHash
		delete this._rowsHash
		delete this.hiddenCells
		delete this._oldDrawLevel
		this.drawLevel = -1
		this.reload(this.get('nowShowing'))
	}.observes('length'),

	drawLevelDidChange: function() {
		var drawLevel = this.get('drawLevel'),
			oldDrawLevel = (this._oldDrawLevel || 0),
			levels = this.get('levels'), len, i

		if(levels) {
			len = levels.get('length')

			if(drawLevel > oldDrawLevel)
				for(i = oldDrawLevel; i < drawLevel; i++)
					this.releaseLevel(i)
			else {
				this.releaseLevel(drawLevel)
				this.retainLevel(drawLevel)
			}
		}
		
		this._oldDrawLevel = drawLevel

	}.observes('drawLevel'),
	
	retainLevel: function(level) {
		var levels = this.get('levels'),
			cells = this.get('cells'),
			levelDivs = this.get('levelDivs'), 
			contents = levels.objectAt(level)
			
		if(level >= levels.get('length'))
			return
		
		var layout = this.layoutForCell(contents[0], 0)


		div = levelDivs[level]

		SC.$(div).removeClass('release').addClass('retain')
		SC.$(div).css({
			top: layout.top
		})
	},
	
	releaseLevel: function(level) {
		var levels = this.get('levels'),
			levelDivs = this.get('levelDivs'),
			cells = this.get('cells'),
			contents = levels.objectAt(level), div, layout, layout2
		
		div = levelDivs[level]
		
		if(SC.none(contents))
			return 

		div.className = "cv-level release"
		div.style.top = "0px"
		
		contents.forEach(function(c) {
			var layout = this.layoutForCell(c, 0)
			SC.$(this.cellForIndex(c)).css('top', layout.top)
		}, this)
		
		if(level == 0) {
			var containerView = this.get('containerView')
			if(containerView)
				containerView.adjust({
					top: 0,
					left: 0,
					right: 0,
					bottom: 0
				})
		}

		if(level < levels.get('length') - 1) {
			div = levelDivs[level + 1]
			layout = this.layoutForCell(levels[level + 1][0], 0)
			SC.$(div).css({top: layout.top})
		}
	},
	
	layoutForCell: function(row, column) {
		return this.layoutForContentIndex(this.contentIndexForCell(row), column)
	},

	addCell: function(fullReload) {
		var cells = this.get('cells'),
			hiddenCells = this.get('hiddenCells'),
			cell = hiddenCells ? hiddenCells.objectAt(-1) : null
		
		if(cell)
			hiddenCells.removeObject(cell)

		return cell
	},

	reloadCell: function(cellIdx, attrs) {
		var cells = this.get('cells'),
			cell = this.cellForIndex(cellIdx)
			row = this.contentIndexForCell(cellIdx),
			column = 0

		var ret = this._redrawLayer(cell, attrs, row, column)
		// if(!this.useRenderer)
			// cell.innerHTML = ret.join("")
		
		// SC.$(cell).css(this.layoutForCell(row, 0))
	},
	
	_redrawLayer: function(layer, attrs, row, column) {
		var renderer = this.cellRenderer, context
		if(!renderer)
			renderer = this.cellRenderer = this.get('theme').listItem({contentDelegate: this})

		if(this.useRenderer) {
			if(!layer)
				return
			renderer.attachLayer(layer)
			renderer.attr(attrs)
			renderer.update()
		} else {
			view = this.viewForRowAndColumn(row, column, YES) 
			context = view.renderContext(view.get('tagName'))
    	view.renderToContext(context) ;
			return context
		}
	},

  reloadIfNeeded: function() {
	  var invalid = this._invalidIndexes, bench = YES;
    if (!invalid || !this.get('isVisibleInWindow')) return this ; // delay
  
		var nowShowing = this.get('nowShowing')
		if(nowShowing.get('length') == 0)
			return
			
    this._invalidIndexes = NO ;

		if(!this._cellsHash) cellsHash = this._cellsHash = {}
		if(!this._rowsHash) rowsHash = this._rowsHash = {}
		var hiddenCells = this.get('hiddenCells')
		if(!hiddenCells) {
			hiddenCells = []
			this.set('hiddenCells', hiddenCells)
		}

		if(!this.get('cells')) {
			var ret = this.createDivs(nowShowing.toArray(), 0);
			(this.get('containerView') || this).get('layer').innerHTML = ret
			this.get('cells').forEach(function(cell, i) {
				hiddenCells.push(this.cellForIndex(i))
			}, this)
		}

		if(!invalid.isIndexSet) {
			invalid = nowShowing.toArray()
		} else {
			if(this._TMP_DIFF1.get('length') > 0)
				invalid = this._TMP_DIFF1.remove(this._TMP_DIFF2).toArray().concat(this._TMP_DIFF2.toArray())
			else
				invalid = invalid.toArray()
		}
		
		var levels = this.get('levels'),
			drawLevel = this.get('drawLevel')

		this.set('drawLevel', levels.get('length'))

		var drawLevel = this.get('drawLevel'),
			contents = levels[drawLevel],
			content = this.get('content'),
			start = nowShowing.get('min'),
			end = nowShowing.get('max'), css,
			bench = NO
		
		if(bench) {
			bench=("%@#reloadIfNeeded (Partial)"+ Math.random(100000) + " : " +  invalid.get('length')).fmt(this)
			SC.Benchmark.start(bench);
		}
		
		if(contents) {
			var i = contents.objectAt(0), 
				j = contents.objectAt(-1), 
				idx = start + i, 
				left = idx,
				right = end = Math.min(end, idx + j - i + 1),
				set = SC.IndexSet.create(idx, end-idx),
				lastSlate = this._last_slateReload,
				rolledIn, rolledOut
		
			if(drawLevel > 0 && lastSlate && lastSlate.isIndexSet) {
				rolledOut = this._TMP_DIFF3.add(lastSlate).remove(set)
				rolledIn = this._TMP_DIFF4.add(set).remove(lastSlate)
				
				if(!rolledIn.contains(set)) {
					rolledOut.forEach(function(idx) {
						this.removeItemViewForRowAndColumn(idx, 0)
						invalid.push(idx)
					}, this)
				
					rolledIn.forEach(function(idx) {
						this.removeItemViewForRowAndColumn(idx, 0)
					}, this)
				}
				
				rolledOut.clear()
				rolledIn.clear()
			}
		
		
			for(; i <= j && idx < end; i++, idx++) {
				if(cell = this.cellForRowAndColumn(idx, 0))
					this.removeItemViewForRowAndColumn(idx, 0)
				this.retainCell(i)
				this.reloadCell(i, {content: content.objectAt(idx), contentIndex: idx})
				this._cellsHash[idx + ",0"] = i
				this._rowsHash[i] = idx + ",0"
			}
		
			this._last_slateReload = set.frozenCopy()
		
			if(drawLevel < this.get('levels').get('length'))
				SC.$(this.get('levelDivs')[drawLevel]).css({
					top: this.rowOffsetForContentIndex(this.contentIndexForCell(contents[0])) + "px"
				})
		}

		if(drawLevel > 0) {
			invalid.uniq().forEach(function(idx) {
				if(contents && idx >= left && idx < right)
					return
				// 		
				if(nowShowing.contains(idx)) {
					this.addItemViewForRowAndColumn(idx, 0)
				} else {
					this.removeItemViewForRowAndColumn(idx, 0)
				}
			}, this)
		}

		if(bench)
			SC.Benchmark.end(bench);
		
		this.adjust(this.computeLayout())
		this.get('containerView').adjust(this.computeLayout())

		SC.$(this.get('hiddenCells')).css("left", "-9999px")

		return this
	},
	
	retainCell: function(cellIdx) {
		var cell = this.cellForIndex(cellIdx)
			hiddenCells = this.get('hiddenCells')
		hiddenCells.removeObject(cell)
		return cell
	},
	
	releaseCell: function(cellIdx) {
		var cell = this.cellForIndex(cellIdx),
			hiddenCells = this.get('hiddenCells')
		
		hiddenCells.push(cell)
		return cell
	},
	
	removeItemViewForRowAndColumn: function(row, column) {
		var cellsHash = this._cellsHash,
			rowsHash = this._rowsHash,
			key = row + "," + (column || 0),
			cellIdx = cellsHash[key]
		
		hash = this.cellForIndex(cellIdx)
		
		if(!SC.none(hash) && rowsHash[cellIdx] == key) {
			this.releaseCell(cellIdx)
			delete rowsHash[cellIdx]
		}
		delete cellsHash[key]
		
	},
	
	cellForIndex: function(idx) {
		var cells = this.get('cells'),
			cell = cells.objectAt(idx),

		if(SC.typeOf(cell) == "string") {
			cell = document.getElementById(cell)
			cells.replace(idx, 1, cell)
		}
		
		return cell
	},
	
	addItemViewForRowAndColumn: function(row, column, fullReload) {
		var cells = this.get('cells'),
			cellsHash = this._cellsHash,
			content = this.get('content'),
			item = content.objectAt(row),
			key = row + "," + column,
			layout, cell = cellsHash[key]
			
			if(cell) {
				cellIdx = cell
				cell = this.cellForIndex(cell)
			} else {
				cell = this.addCell()
				if(!cell)
					return NO
				cellIdx = cells.indexOf(cell)
			}

			cellsHash[key] = cellIdx
			this._rowsHash[cellIdx] = key

			this.reloadCell(cellIdx, {content: item, contentIndex: row})
			SC.$(cell).css(this.layoutForCell(cellIdx, 0))
			return YES
	},

	reloadSelectionIndexesIfNeeded: function() {
		// debugger
		var invalid = this._invalidSelection
		if (!invalid || !this.get('isVisibleInWindow')) return this 
		this._invalidSelection = NO
		this.reload(invalid)
	},

	cellForRowAndColumn: function(row, column) {
		if(SC.none(column)) column = 0
		var ret = this_cellsHash[row = "," + column]
		return ret >= 0 ? ret : NO
	},
	
	viewForRowAndColumn: function(row, column) {
		if(!this.useRenderer)
			return sc_super()

		var cellsHash = this._cellsHash,
			key = row + "," + column,
			cell = this._cellsHash[key]

		return this.cellForIndex(cell)
	},
	
  contentIndexForLayerId: function(id) {
		var ret = sc_super()
		return ret ? this.contentIndexForCell(ret) : ret
	},
	
	// adjustFrame: function() {
	// 	var containerView = this.get('containerView')
	// 	containerView.adjust(this.computeLayout())
	// }.observes('clippingFrame'),
	
  layoutForContentIndex: function(contentIndex) {
    return {
      top:    this.rowOffsetForContentIndex(contentIndex) + "px",
      height: this.rowHeightForContentIndex(contentIndex) + "px",
      left:   '0px', 
      right:  '0px'
    };
  },

	contentIndexForCell: function(cell) {
		return this._rowsHash[cell] ? this._rowsHash[cell].split(",")[0] : cell
	},

  scrollToItemView: function(view) {},

	isSelected: function(item) {
		var sel = this.get('selection')
		return sel ? sel.contains(this.get('content'), item) : NO
	},
	
	contentIndexForItemView: function(itemView) {
		if(!itemView) return -1
		return parseInt(this.contentIndexForCell(this.get('cells').indexOf(itemView)))
	}
	
});