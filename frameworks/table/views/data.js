// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

SC.DataView = SC.ListView.extend({

  /**
     Delegate method for when a cell needs to know what the content will be

     @property {SC.View} view The cell view that needs a value
     @property {Number} row the index of the row
     @property {Number} column the index of the column
  */
  collectionViewWillDisplayCellForRowAndColumn: function(view, row, column) {
    var table = this.get('table');
    if(column >= 0) {
      var value = this.valueForRowAndColumnInTableView(row, column, this.get('table'));
      view.displayValue = value;
    }
  },
  
  /**
     Returns the appropriate value from the content based on row and column number

     @private
  */
  valueForRowAndColumnInTableView: function(row, column, tableView) {
    var ds = this.get('content');
    if (ds){
      var item = ds.objectAt(row),
        columns = tableView.get('columns');
        column = columns.objectAt(column);
      var  key = column.get('key');
      return item.get?item.get(key):item[key];
    }
  },
  
  /**
     Returns layout for row and column, or just for row if column is not specified

     @private
  */
  layoutForContentIndex: function(contentIndex,i) {
     if (SC.none(i)){
       return sc_super();
     }
     var columns = this.get('columns');
     return {
       top:0,
       bottom:0,
       width:columns.objectAt(i).get('width')
     };
   },
  
   /**
      Returns a view instance for the given row and column

      @param {Number} row the row index
      @param {Number} column the column index
   */
  viewForCell: function(row, column) {
    var itemViews = this._sc_itemViews;
    
    var view = itemViews[row][column];
      
    if(!view){
      return NO;  
    }

    return view;
  },
  
  /**
      Determines if a content item is selected

      @private
   */
  isSelected: function(item) {
    var sel = this.get('selection');
    return sel ? sel.contains(this.get('content'), item) : NO;
  },

  /** @private */
  computeLayout: function() {
    var ret = this._sclv_layout;
    if (!ret) ret = this._sclv_layout = {};
    ret.minHeight = this.rowOffsetForContentIndex(this.get('length'))+4;
    ret.minWidth = this.get('calculatedWidth');
    this.set('calculatedHeight',ret.minHeight);
    return ret ;
  },

  /**
    Returns a ghost view for a given column 
  */
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
  
  /** @private */
  mouseMoved: function(ev) {
    if(this._isDirty)
    {
      this.reload(null);
    }
    sc_super();
  },
  
  /** @private */
  _cv_columnsDidChange: function() {
    this.reload(null);
  }.observes('columns')
  
});