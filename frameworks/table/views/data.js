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
			arguments[2] = true
			// debugger
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

  isSelected: function(item) {
    var sel = this.get('selection')
    return sel ? sel.contains(this.get('content'), item) : NO
  },

  nowShowingColumns: function() {
    return this.computeNowShowingColumns();
  }.property('columns', 'clippingFrame').cacheable(),

	allColumns: function() {
   return SC.IndexSet.create(0, this.getPath('columns.length')).freeze();
  }.property('columns').cacheable(),

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