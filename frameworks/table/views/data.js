// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/list');

SC.DataView = SC.ListView.extend({

  // useRenderer: YES,
    
  // childViews: ["containerView"],
  // containerView: SC.View,
  
	canSelectCells: NO,

	content: function() {
		return this.get('dataSource')
	}.property('dataSource').cacheable(),
	
	// collectionViewWillDisplayCellForRowAndColumn: function(collectionView, view, row, column) {
		// this is where we need to insert the actual content for the cell
	// },

	row: function() {
		var rows = this.get('rows'),
			hiddenRows = this.get('hiddenRows'),
			row, idx
	
		if(!hiddenRows) {
			hiddenRows = []
			this.set('hiddenRows', hiddenRows)
		}
	
		row = hiddenRows.pop()
		
		if(!row)
			return NO

		return row
	},
	
	viewForRow: function(row) {
		var view = this._sc_itemViews[row]
		if(!view) {
			rowView = this.row()
			
			if(!rowView)
				return NO
			
			if(SC.typeOf(rowView) == "array") {
				view = rowView[-1]
				this._sc_itemViews[row] = rowView
			} else 
				view = rowView

			SC.$(view).css(this.layoutForRow(row))
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
	
	viewForCell: function(row, column) {
		var rowView = this.viewForRow(row),
			itemViews = this._sc_itemViews
			
		if(!rowView)
			return NO
		
		var view = itemViews[row][column]
			
		if(!view)
			return NO
			
		return view
	},

  reloadCell: function(row, column, attrs) {
    var view = this.viewForCell(row, column),
			value = this.get('dataSource').valueForRowAndColumnInTableView(row, column, this)
			
		if(!view)
			return NO
			
		this._redrawLayer(view, value)
		
		return YES
  },
  
  _redrawLayer: function(layer, value) {
		layer.childNodes[0].innerHTML = (value || "")
  },

	reloadIfNeeded: function() {
		if(!this._invalidIndexes.isIndexSet && this.get('hiddenRows')) {
			this.get('hiddenRows').forEach(function(row) {
				row[-1].parentNode.removeChild(row[-1])
			})
			this.set('hiddenRows', [])
		}
		sc_super()
		if(this.get('hiddenRows'))
			SC.$(this.get('hiddenRows').map(function(i) { return i[-1] })).css('left', '-9999px')
	},

	addItemViewForRowAndColumn: function(row, column, rebuild) {
		if(rebuild || SC.none(column) || !this.reloadCell(row, column)) {
			console.log("have to build", row, rebuild)
			return sc_super()
		}
	},
	
	removeItemViewForRowAndColumn: function(row, column) {
		this.releaseRow(row)
	},
  
  releaseRow: function(row, column) {
		var view, hiddenRows, view2
		hiddenRows = this.get('hiddenRows')

		if(!hiddenRows) {
			hiddenRows = []
			this.set('hiddenRows', hiddenRows)
		}

		var itemViews = this._sc_itemViews
		view = itemViews[row]
		
		for(var i = -1; i < view.length; i++) {
			if(view[i].get) {
				view2 = view[i].get('layer')
				view[i].set('layer', null)
				view[i] = view2
			}	
		}
		
		hiddenRows.push(view)
		delete itemViews[row]
  },
  // 
  // reloadSelectionIndexesIfNeeded: function() {
  //   var invalid = this._invalidSelection, view
  //   if (!invalid || !this.get('isVisibleInWindow')) return this 
  //   this._invalidSelection = NO
  // 		invalid.forEach(function(index) {
  // 			view = this.viewForRow(index)
  // 			SC.$(view).setClass("sel", this.isSelected(index))
  // 		}, this)
  // },
  
  // contentIndexForLayerId: function(id) {
  // 		var rowsHash = this.get('rowsHash')
  //   if (!id || !(id = id.toString())) return null ; // nothing to do
  //   
  //   var base = this._baseLayerId;
  //   if (!base) base = this._baseLayerId = SC.guidFor(this)+"-";
  //   
  //   // no match
  //   if ((id.length <= base.length) || (id.indexOf(base) !== 0)) return null ; 
  // 
  //   var ret = Number(id.split('-').objectAt(1))
  //   return isNaN(ret) ? null : rowsHash[ret] ;
  // },
  
	//   contentIndexForCell: function(cell) {
	// 	var rowsHash = this.get('rowsHash')
	// 	var row = this.get('rows').indexOf(cell.parentNode)
	// 	return rowsHash[row]
	//   },
	// 
	// selectionIndexForItemView: function(cell) {
	// 	return this.selectionIndexForCell(cell)
	// },

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

  // scrollToItemView: function(view) {},

  isSelected: function(item) {
    var sel = this.get('selection')
    return sel ? sel.contains(this.get('content'), item) : NO
  },

  // columnsInRect: function(rect) {
  //   var columns = this.get('columns'),
  //       left       = SC.minY(rect),
  //       right    = SC.maxY(rect),
  //       width    = rect.height || 0,
  //       len, offset, start, end;
  // 
  // 		if(SC.none(columns))
  // 			return null
  // 			
  // 	start = -1
  // 		while(this.offsetForColumn(start + 1) < left) {
  // 			start++
  // 		}
  // 
  // 		end = start
  // 		do {
  // 			end++
  // 		} while(this.offsetForColumn(end) < right) 
  // 		
  // 		
  // 		//     end = start + ((height - (height % rowHeight)) / rowHeight) ;
  // 		//     // if (end > len) end = len;
  // 		//     offset = this.rowOffsetForContentIndex(end);
  // 		// 
  // 		// end = len
  // 		// while(this.offsetForColumn(end) > right) {
  // 		// 	end--
  // 		// }
  // 		
  //   return SC.IndexSet.create(start, end-start);
  // },

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