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
  
	canSelectCells: NO,

	content: function() {
		return this.get('dataSource')
	}.property('dataSource').cacheable(),

  _dv_lengthDidChange: function() {
    delete this.cells
    delete this._cellsHash
    delete this._rowsHash
    delete this.hiddenCells
    this.reload(this.get('nowShowing'))
  }.observes('length'),

	row: function() {
    var rows = this.get('rows'),
      hiddenRows = this.get('hiddenRows'),
			row, idx

		if(!hiddenRows) {
			hiddenRows = []
			this.set('hiddenRows', hiddenRows)
		}

		if(!rows) {
			rows = []
			this.set('rows', rows)
		}
		
		row = hiddenRows.pop()
		
		if(row && SC.typeOf(row) == "string") {
			idx = rows.indexOf(row)
			rows.replace(idx, 1, [document.getElementById(row)])
			row = rows.objectAt(idx)
		}
		
		if(!row) {
			var context = SC.RenderContext('div'),
				idx = rows.get('length'),
				cells = this.get('cells'),
				columns = this.get('columns'),
				rowCells = [],
				context2

			if(!cells) {
				cells = []
				this.set('cells', cells)
			}
			
			context.id(this.layerIdFor(idx)).classNames(['sc-dataview-row']);
			
			(columns || [this]).forEach(function(column, col) {
				rowCells.push(this.layerIdFor(idx, col))
				context2 = SC.RenderContext("div")
	      context2.id(this.layerIdFor(idx, col))
				context2.classNames(["cell", "column-" + col])
	      if(this.useRenderer) {
	        var renderer = this.cellRenderer
	        if(!renderer)
	          renderer = this.cellRenderer = this.get('theme').listItem({contentDelegate: this})
	        renderer.render(context2)
	      }
	
				context.push(context2.join(""))
			}, this);

			cells.push(rowCells)
			row = context.element();
			rows.push(row);
			(this.get('containerView') || this).get('layer').appendChild(row)
		}
		
		return row
	},
	

	viewForRow: function(row) {
		var rowViewsHash = this.get('rowViewsHash'),
			rowsHash = this.get('rowsHash'),
			layout

		if(!rowViewsHash) {
			rowViewsHash = {}
			this.set('rowViewsHash', rowViewsHash)
		}
		
		if(!rowsHash) {
			rowsHash = {}
			this.set('rowsHash', rowsHash)
		}

		var view = rowViewsHash[row]
		if(!view) {
			layout = this.layoutForRow(row)
			view = rowViewsHash[row] = this.row()
			SC.$(view).css(layout)
			rowsHash[this.get('rows').indexOf(view)] = row
		}
		
		view.className = "sc-dataview-row" + (row % 2 == 0 ? " even" : "") + (this.isSelected(row) ? " sel" : "")
		return view
	},
	
  layoutForRow: function(row, column) {
    return {
			position: "absolute",
      top:    this.rowOffsetForContentIndex(row) + "px",
      height: this.rowHeightForContentIndex(row) + "px",
      left:   0,
			right:  0
    };
  },
	
	viewForRowAndColumn: function(row, column) {
		return this.viewForCell(row, column)
	},
	
	viewForCell: function(row, column) {
		var rowView = this.viewForRow(row),
		rowIdx = this.get('rows').indexOf(rowView),
		view = this.get('cells').objectAt(rowIdx).objectAt(column),
		div
		
		if(!view)
			var view = this.createCell(row)
		
		if(view && SC.typeOf(view) == "string") {
			div = document.getElementById(view)
			this.get('cells').objectAt(rowIdx).replace(column, 1, div)
			view = this.get('cells').objectAt(rowIdx).objectAt(column)
		}

		return view
	},

  reloadCell: function(row, column, attrs) {
    var view = this.viewForCell(row, column),
			value = this.get('dataSource').valueForRowAndColumnInTableView(row, column, this)
			
		this._redrawLayer(view, value)
  },
  
  _redrawLayer: function(layer, value) {
		layer.childNodes[0].innerHTML = (value || "")
  },

  reloadIfNeeded: function() {
    var invalid = this._invalidIndexes, bench = YES;
    if (!invalid || !this.get('isVisibleInWindow')) return this ; // delay

		var columns = this.get('allColumns'),
   		nowShowing = this.get('nowShowing')

    if(nowShowing.get('length') == 0)
      return
      
    this._invalidIndexes = NO ;
    this._invalidColumns = NO ;

		if(!columns.isIndexSet)
			columns = this.get('nowShowingColumns')

    if(!invalid.isIndexSet) {
      invalid = nowShowing.toArray()
    } else {
      if(this._TMP_DIFF1.get('length') > 0)
        invalid = this._TMP_DIFF1.remove(this._TMP_DIFF2).toArray().concat(this._TMP_DIFF2.toArray())
      else
        invalid = invalid.toArray()
    }
    
    if(bench) {
      bench=("%@#reloadIfNeeded (Partial)"+ Math.random(100000) + " : " +  invalid.get('length')).fmt(this)
      SC.Benchmark.start(bench);
    }
    

		invalid.uniq().forEach(function(idx) {
			if(nowShowing.contains(idx)) {
				(columns || [0]).forEach(function(column, colIdx) {
					this.reloadCell(idx, colIdx)
				}, this)
			} else {
				this.releaseRow(idx)
			}
		}, this)

    if(bench)
      SC.Benchmark.end(bench);
    
    this.adjust(this.computeLayout())
    this.get('containerView').adjust(this.computeLayout())

    SC.$(this.get('hiddenRows')).css("left", "-9999px")

    return this
  },
  
  releaseRow: function(row, column) {
		var view, hiddenRow
		hiddenRows = this.get('hiddenRows')
		view = this.viewForRow(row)
		hiddenRows.push(view)
		delete this.get('rowsHash')[this.get('rows').indexOf(view)]
		delete this.get('rowViewsHash')[row]
  },
  
  reloadSelectionIndexesIfNeeded: function() {
    var invalid = this._invalidSelection, view
    if (!invalid || !this.get('isVisibleInWindow')) return this 
    this._invalidSelection = NO
		invalid.forEach(function(index) {
			view = this.viewForRow(index)
			SC.$(view).setClass("sel", this.isSelected(index))
		}, this)
  },
  
  contentIndexForLayerId: function(id) {
		var rowsHash = this.get('rowsHash')
    if (!id || !(id = id.toString())) return null ; // nothing to do
    
    var base = this._baseLayerId;
    if (!base) base = this._baseLayerId = SC.guidFor(this)+"-";
    
    // no match
    if ((id.length <= base.length) || (id.indexOf(base) !== 0)) return null ; 

    var ret = Number(id.split('-').objectAt(1))
    return isNaN(ret) ? null : rowsHash[ret] ;
  },
  
  contentIndexForCell: function(cell) {
		var rowsHash = this.get('rowsHash')
		var row = this.get('rows').indexOf(cell.parentNode)
		console.log("contentindexforcell", row, rowsHash[row])
		return rowsHash[row]
  },

	selectionIndexForItemView: function(cell) {
		return this.selectionIndexForCell(cell)
	},

  selectionIndexForCell: function(cell) {
		var rowsHash = this.get('rowsHash')
		var row = this.get('rows').indexOf(cell.parentNode),
			index = rowsHash[row]

		if(!this.get('canSelectCells'))
			return index
		
		var columns = this.get('columns'),
			column = cell.id.split('-')[2]
		
		return index * columns.get('length') + column
  },


  scrollToItemView: function(view) {},

  isSelected: function(item) {
    var sel = this.get('selection')
    return sel ? sel.contains(this.get('content'), item) : NO
  },

  columnsInRect: function(rect) {
    var columns = this.get('columns'),
        left       = SC.minY(rect),
        right    = SC.maxY(rect),
        width    = rect.height || 0,
        len, offset, start, end;

		if(SC.none(columns))
			return null
			
  	start = -1
		while(this.offsetForColumn(start + 1) < left) {
			start++
		}

		end = start
		do {
			end++
		} while(this.offsetForColumn(end) < right) 
		
		
		//     end = start + ((height - (height % rowHeight)) / rowHeight) ;
		//     // if (end > len) end = len;
		//     offset = this.rowOffsetForContentIndex(end);
		// 
		// end = len
		// while(this.offsetForColumn(end) > right) {
		// 	end--
		// }
		
    return SC.IndexSet.create(start, end-start);
  },

  nowShowingColumns: function() {
    return this.computeNowShowingColumns();
  }.property('columns', 'clippingFrame').cacheable(),

	allColumns: function() {
   return SC.IndexSet.create(0, this.getPath('columns.length')).freeze();
  }.property('columns').cacheable(),


	// 
	//   computeNowShowingColumns: function() {
	//     var r = this.columnsInRect(this.get('clippingFrame'));
	//     if (!r) r = this.get('allColumns'); // default show all
	// 
	//     // make sure the index set doesn't contain any indexes greater than the
	//     // actual content.
	//     else {
	//       var len = this.getPath('columns.length'), 
	//           max = r.get('max');
	//       if (max > len) r = r.copy().remove(len, max-len).freeze();
	//     }
	// 
	//     return r ;
	//   },
	// 
	// 
	//   _cv_nowShowingColumnsDidChange: function() {
	//     var nowShowing  = this.get('nowShowingColumns'),
	//         last        = this._sccv_lastNowShowingColumns,
	//         diff, diff1, diff2;
	// 
	//     diff1 = this._TMP_DIFF5
	//     diff2 = this._TMP_DIFF6
	// 
	//     if (diff1) diff1.clear();
	//     if (diff2) diff2.clear();
	// 
	//     // find the differences between the two
	//     // NOTE: reuse a TMP IndexSet object to avoid creating lots of objects
	//     // during scrolling
	//     if (last !== nowShowing) {
	//       if (last && nowShowing) {
	//         diff1 = this._TMP_DIFF1.add(last).remove(nowShowing);
	//         diff2 = this._TMP_DIFF2.add(nowShowing).remove(last);
	//         diff = diff1.add(diff2);
	//       } else diff = last || nowShowing ;
	//     }
	// 
	//     // if nowShowing has actually changed, then update
	//     if (diff && diff.get('length') > 0) {
	//       this._sccv_lastNowShowing = nowShowing ? nowShowing.frozenCopy() : null;
	//       this.reload(null, diff);
	//     }
	//   }.observes('nowShowingColumns'),
	// 
	// offsetForColumn: function(column) {
	// 	var offsets = this._columnOffests,
	// 		offset = offsets.objectAt(column)
	// 	
	// 	if(!offset)
	// 		offset = column > 0 ? this.offsetForColumn(column - 1) + this.widthForColumn(column - 1) : 0
	// 		
	// 	offsets.replace(column, 1, offset)
	// 	
	// 	return offset
	// },
	// 
	// widthForColumn: function(column) {
	// 	var columns = this.get('columns'),
	// 		column = columns.objectAt(column)
	// 	
	// 	return column ? column.get('width') || 120 : 120
	// }

  computeLayout: function() {
    var ret = this._sclv_layout;
    if (!ret) ret = this._sclv_layout = {};
    ret.minHeight = this.rowOffsetForContentIndex(this.get('length'))+4;
		ret.minWidth = this.get('calculatedWidth');
    this.set('calculatedHeight',ret.minHeight);
    return ret ;
  },

	ghostForColumn: function(column) {
		var nowShowing = this.get('nowShowing'),
			el = document.createElement('div')
			
		nowShowing.forEach(function(idx) {
			el.appendChild(this.viewForCell(idx, column).cloneNode(YES))
		}, this)
		
		el.className = "column-" + column + " ghost";
		
		return el
	}
  
});