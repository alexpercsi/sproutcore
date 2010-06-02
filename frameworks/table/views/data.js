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
	
	_isDataView:YES,

	content: function() {
		return this.get('dataSource');
	}.property('dataSource').cacheable(),
	
	collectionViewWillDisplayCellForRowAndColumn: function(tableView, view, row, column) {
		if(column >= 0) {
			var value = this.valueForRowAndColumnInTableView(row, column, this);
			view.displayValue = value;
		}
		sc_super();
	},
	
	valueForRowAndColumnInTableView: function(row, column, tableView) {
	  var ds = this.get('dataSource');
	  if (ds){
	    var item = ds.objectAt(row),
  			columns = tableView.get('columns');
  			column = columns.objectAt(column);
  		var	key = column.get('key');

  		return item.get(key);
	  }
	},
	
	row: function() {
		var rows = this.get('rows'),
			hiddenRows = this.get('hiddenRows'),
			row, idx;
	
		if(!hiddenRows) {
			hiddenRows = [];
			this.set('hiddenRows', hiddenRows);
		}
	
		row = hiddenRows.pop();
		
		if(!row)
		{
			return NO;
		}

		return row;
	},
	
	viewForRow: function(row) {
		var view = this._sc_itemViews[row];
		if(!view) {
			var rowView = this.row();
			
			if(!rowView)
			{
				return NO;
			}
			
			if(SC.typeOf(rowView) == "array") {
				view = rowView[-1];
				this._sc_itemViews[row] = rowView;
			} else 
			{
				view = rowView;
			}

			SC.$(view).css(this.layoutForRow(row));
		}

		if (SC.none(view))
		{
		  return NO;
	  }

		view.className = "sc-dataview-row" + (row % 2 === 0 ? " even" : "") + (this.isSelected(row) ? " sel" : "");
		return view;
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
			itemViews = this._sc_itemViews;
			
		if(!rowView){
			return NO;
		}
		
		var view = itemViews[row][column];
			
		if(!view){
			return NO;  
		}

		return view;
	},

  reloadCell: function(row, column, attrs) {
    var view = this.viewForCell(row, column),
			value = this.valueForRowAndColumnInTableView(row, column, this);
			
		if(!view)
		{
			return NO;
		}
			
		this._redrawLayer(view, value);
		
		return YES;
  },
  
  _redrawLayer: function(layer, value) {
    if (layer && layer.childNodes && layer.childNodes.length>0)
    {
		  layer.childNodes[0].childNodes[0].innerHTML = (value || "");
	  }
  },

	reloadIfNeeded: function() {
		if(!this._invalidIndexes.isIndexSet && this.get('hiddenRows')) {
			this.get('hiddenRows').forEach(function(row) {
				row[-1].parentNode.removeChild(row[-1]);
			});
			this.set('hiddenRows', []);
		}
		sc_super();
		if(this.get('hiddenRows'))
		{
			SC.$(this.get('hiddenRows').map(function(i) { return i[-1]; })).css('left', '-9999px');
		}
	},

	addItemViewForRowAndColumn: function(row, column, rebuild) {
		// console.log("addItemView", row, column, rebuild)
		if(rebuild)
		{
			return sc_super();
		}
			
		if(SC.none(column) || !this.reloadCell(row, column))
		{
			this.addItemViewForRowAndColumn(row, column, YES);
		}
	},
	
	removeItemViewForRowAndColumn: function(row, column) {
		this.releaseRow(row);
	},
  
  releaseRow: function(row, column) {
		// console.log("release", row)
		var view, hiddenRows, view2;
		hiddenRows = this.get('hiddenRows');

		if(!hiddenRows) {
			hiddenRows = [];
			this.set('hiddenRows', hiddenRows);
		}

		var itemViews = this._sc_itemViews;
		view = itemViews[row];
		
		var viewCache = this._viewCache;
		if(!viewCache)
		{
			viewCache = this._viewCache = [];
		}
			
		// var colViewCache = viewCache[column]
			
		// if(!colViewCache)
			// colViewCache = viewCache[column] = []
		
		// console.log(viewCache)
		
		if (view)
		{
		  for(var i = view.length - 1; i >= -1; i--) {
  			if(view[i].get) {
  				view2 = view[i].get('layer');
  				view[i].set('layer', null);
					// view[1].destroy()
					
					if(!viewCache[i]){
						viewCache[i] = [];
					}
					
					viewCache[i].push(view[i]);
  				view[i] = view2;

  			}	
  		}
		
  		hiddenRows.push(view);
	  }
		delete itemViews[row];
  },

  selectionIndexForCell: function(cell) {
		var rowsHash = this.get('rowsHash');
		var row = this.get('rows').indexOf(cell.parentNode),
			index = rowsHash[row];

		if(!this.get('canSelectCells'))
		{
			return index;
		}
		
		var columns = this.get('columns'),
			column = cell.id.split('-')[2];
		
		return index * columns.get('length') + column;
  },

  isSelected: function(item) {
    var sel = this.get('selection');
    return sel ? sel.contains(this.get('content'), item) : NO;
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
			el = document.createElement('div');
			
		nowShowing.forEach(function(idx) {
		  var view = this.viewForCell(idx, column);
		  if (view)
		  {
		    if (view.get)
		    {
		      var layer=view.get('layer');
  			  el.appendChild(layer.cloneNode(YES));
			  }
			  else
			  {
			    if (view.cloneNode)
			    {
			      el.appendChild(view.cloneNode(YES));
			    }
			  }
		  }
		}, this);
		
		el.className = "column-" + column + " ghost";
		
		return el;
	},
	
	mouseMoved: function(ev) {
		if(this._isDirty)
		{
			this.reload(null);
		}
	  sc_super();
	}
  
});
