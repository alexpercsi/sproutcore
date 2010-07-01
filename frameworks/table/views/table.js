// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple, Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('views/table_header');
sc_require('views/table_cell');


SC.TableView = SC.View.extend({
  
  classNames: ['sc-table-view'],
  
  horizontalScrollOffset: 0,

  /**
    The content object the table view will display. Usually an SC.ArrayController's content
    
    @type SC.Array
  */
  content: null,
  
  /**
    The height of each row in the TableView
    
    @property {Number}
  */
  rowHeight:22,
  
  /**
    IF YES, a Foldered list view will be used to render the dataview. Useful for displaying tree structures.
    
    @property {Boolean}
  */
  isFoldered: NO,
  
  selection:null,
  
  target:null,
  action:null,
  
  /**
    IF YES, a table header will be rendered. Note that if a table header is not rendered, 
    there will be no way to resize columns, reorder rows or sort from the TableView UI.
    
    @property {Boolean}
  */
  useHeaders: YES,
  
  /**
    An example view that will be used to render cells in the table
    
    @property {SC.View}
  */
  exampleView: SC.ListItemView,
  
  /**
    An example ScrollView that will be used to paint the scrollpane of the tableView. 
    This is useful if your app has custom scrollbars.
    
    @property {SC.ScrollView}
  */
  exampleScrollView: SC.ScrollView,
  
  /**
    An example ListView that will be used to paint the foldered list view of the tableView.
    This is useful to add customization to your listview.
    
    @property {SC.ListView}
  */
  exampleFolderedListView: SC.FolderedListView,
  
  isEditable: YES,
  canEditContent: YES,
  
  /**
     Equivalent of the orderBy property of an SC.ArrayController. It is actually bound to the content orderBy property

     @private
   */
  sortDescriptor: null,
  sortDescriptorBinding: '*content.orderBy',
  
  createChildViews: function() {
    
    var childViews = [], childView=null;
    
    childView = this.createChildView(SC.ScrollView.design({
      
      isVisibleBinding: '.parentView.useHeaders',
      
      headerHeightBinding: '.parentView.headerHeight',
      headerHeightDidChange: function(){
        if (this.get('headerHeight')){
          this.get('layout').height=this.get('headerHeight');
        }
      }.observes('headerHeight'),

      layout: {
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        height: 39
      },
      
      hasHorizontalScroller: NO,
      canScrollHorizontal: function() {
        return YES;
      }.property().cacheable(),
      horizontalScrollOffsetBinding: '.table.horizontalScrollOffset',
      
      borderStyle: SC.BORDER_NONE,
      contentView: SC.TableHeaderView.extend({
        layout:{top:0,left:0,right:0,bottom:0},
        table: this,
        columnsBinding: '.table.columns',
        sortDescriptorBinding: '.table.sortDescriptor'
       })
    }));
    
    childViews.push(childView);
    
    this._tableHeaderView=childView;
    
    if (this.get('isFoldered'))
    {
      
      childView = this.createChildView(this.get('exampleScrollView').design({
        autohidesVerticalScroller: NO,
        layout: { left: 6, right: 0, top: this.get('headerHeight')+3 || 38, bottom: 0 },
        verticalScrollOffset:0,
        contentView: this.get('exampleFolderedListView').design({
          layout:{top:0,left:0,right:0,bottom:0},
          exampleView: this.get('exampleView'),
          keys: [],
          columnWidths: [],
          rowHeight: this.get('rowHeight'),
          table: this,
          contentBinding: '.table.content.arrangedObjects',
          selectionBinding: '.table.selection',
          targetBinding: '.table.target',
          actionBinding: '.table.action',
          contentValueKey: 'name',
          hasContentIcon: this.get('hasContentIcon'),
          contentIconKey: 'icon',
          newTarget: this.get('delegate'),
          newAction: this.get('newAction'),
          canReorderContent: YES,
          canEditContent: this.get('canEditContent'),
          canDeleteContent: this.get('canDeleteContent'),
          allowDeselectAll: this.get('allowDeselectAll'),
          delegate: this.get('delegate'),
          beginEditingSelectionBinding: this.get('beginEditingSelectionPath') || SC.binding('.beginEditingSelection',this.get('delegate')),
          folderedListViewDelegate: this.get('delegate'),
          isDropTarget: YES,
          allowActionOnFolder: this.get('allowActionOnFolder'),
          needsContextMenu: this.get('needsContextMenu')
        })
      }));
    }
    
    else
    {
      childView = this.createChildView(this.get('exampleScrollView').design({
        isVisible: YES,
        layout: {
          left:   0,
          right:  0,
          bottom: 0,
          top:    this.get('useHeaders')?(this.get('headerHeight')+3 || 38):0
        },

        borderStyle: SC.BORDER_NONE,
        contentView: SC.DataView.design({

          classNames: ['sc-table-data-view'],

          table: this,

          rowHeight: this.get('rowHeight'),

          isEditableBinding: '.table.isEditable',
          canEditContentBinding: '.table.canEditContent',

          targetBinding: '.table.target',
          actionBinding: '.table.action',
          
          canReorderContentBinding: '.table.canReorderContent',

          selectionBinding: '.table.selection',

          sortDescriptorBinding: '.table.sortDescriptor',
          columnsBinding: '.table.columns',
          contentBinding: '.table.content',

          exampleView: this.get('exampleView'),
          useViewPooling: this.get('useViewPooling')
        }),


        autohidesVerticalScroller: NO,
        horizontalScrollOffsetBinding: '.parentView.horizontalScrollOffset'
      }));
    }
    
    childViews.push(childView);
    
    this._dataView=childView;
    
    this.set('childViews',childViews);
    
    if (this.get('isFoldered')){
      this._updateFolderedListViewProperties();
    }
    
    if(!this.columnsBinding)
    {
      this.notifyPropertyChange('columns');
    }
  },

  /** @private */
  contentDidChange: function() {
    this._dataView.get('contentView').reload(null);
  }.observes('*content.[]'),
  
  /** @private */
  _sctv_columnsDidChange: function() {
    var columns = this.get('columns');
    if(SC.none(columns) || columns.get('length') < 1 || columns === this._columns)
    {
      return this;
    }
      
    var observer = this._sctv_columnsRangeObserver;
    var func = this.columnsRangeDidChange;
      
    if(this._columns)
    {
      this._columns.removeRangeObserver(observer);
    }

    observer = columns.addRangeObserver(SC.IndexSet.create(0,columns.length), this, func, null);      
    this._sctv_columnsRangeObserver = observer ;

    this.resetRules();
    
    this._columns = columns;
    
    if (this.get('isFoldered')){
      this._updateFolderedListViewProperties();
    }
    
  }.observes('columns'),
  
  /**
     Called when order or size of columns changes

     @private
   */
  resetRules: function() {
    this._offsets = [];
    this._widths = [];
    
    var columns = this.get('columns'),
      stylesheet = this._stylesheet,
      left = 6,
      offsets = this._offsets,
      widths = this._widths,
      width;
    
    if(stylesheet)
    {
      stylesheet.destroy();
    }
      
    stylesheet = this._stylesheet = SC.CSSStyleSheet.create();

    columns.forEach(function(column, i) {
      offsets[i] = left;
      stylesheet.insertRule(this.ruleForColumn(i), i);
      left += widths[i] + 1;
    }, this);
    
    this._dataView.get('contentView').set('calculatedWidth', left);
  },
  
  /**
     Generates a CSS class for the given column

     @private
   */
  ruleForColumn: function(column) {
    var columns = this.get('columns'),
      col = columns.objectAt(column),
      width = col.get('width') - 1;
    this._widths[column] = width ;
    return ['div.column-' + column + ' {',
        'width: ' + width + 'px !important;',
        'left: ' + this._offsets[column] + 'px !important;',
      '}'].join("");
  },
  
  /** @private */
  columnsRangeDidChange: function(columns, object, key, indexes) {
    if(this._ghost)
    {
      return;
    }
      
    columns = this.get('columns');
    
    var  len = columns.get('length');

    if(indexes !== 0)
    {
      indexes = indexes.firstObject();
    }
    
    var diff = columns.objectAt(indexes).get('width') - this._widths[indexes] - 1;
    var css = this._stylesheet;
    
    if (this.get('isFoldered')){
      this._updateFolderedListViewProperties();
    }
    
    if(Math.abs(diff) > 0) {
      for(var i = indexes; i < len; i++) {
        css.deleteRule(i);
        if(i > indexes)
        {
          this._offsets[i] += diff;
        }
        css.insertRule(this.ruleForColumn(i), i);
      }
      
      this._dataView.get('contentView').calculatedWidth += diff;
      this._dataView.get('contentView').adjust(this._dataView.get('contentView').computeLayout());
    }
    
  },
  
  /**
    Changes the sort descriptor based on the column that is passed and the current sort state
  
    @private 
  */
  sortByColumn: function(column, sortState) {
    if(sortState !== "ASC")
    {
      sortState = "ASC";
    }
    else
    {
      sortState = "DESC";
    }
    this.set('sortDescriptor', sortState + " " + column.get('key'));
  },
  
  // reordering
  
  /**
    Returns a ghost view for a given column 
  */
  ghostForColumn: function(column) {
    var columns = this.get('columns'),
      idx = columns.indexOf(column),
      el = this._dataView.get('contentView').ghostForColumn(idx);
      
    this._ghostLeft = this._tableHeaderView.get('contentView').offsetForView(idx) + 1;
    this._ghost = el;
    SC.$(el).css({left: this._ghostLeft, top: 40});
    this.get('layer').appendChild(el);
  },

  /** @private */
  draggingColumn: function(column) {
    this.$().addClass('reordering-columns');
    this.ghostForColumn(column);
    this._dragging = column;
  },
  
  /** @private */
  columnDragged: function(offset) {
    this._ghostLeft += offset;
    SC.$(this._ghost).css('left', this._ghostLeft + "px !important");
  },
  
  /** @private */
  endColumnDrag: function() {
    this.$().removeClass('reordering-columns');
    if (!SC.none(this._ghost))
    {
      this.get('layer').removeChild(this._ghost);
    }
    this._ghost = this._blocker = null;
    this._ghostLeft = null;
    this.resetRules();
    if (this.get('isFoldered')){
      this._updateFolderedListViewProperties();
    }
    this._dataView.get('contentView').reload(null);
  },
  
  /** @private */
  _updateFolderedListViewProperties: function () {
   var dataView = this._dataView.get('contentView');
   if (dataView && dataView.set){
     var columns = this.get('columns'),
         columnKeys = [], columnWidths = [];
         
     for (var i=0;i<columns.length;i++){
       columnKeys.push(columns[i].get('key'));
       columnWidths.push(columns[i].get('width'));
     }
     dataView.set('keys',columnKeys);
     dataView.set('columnWidths',columnWidths);
   }

  }

});
