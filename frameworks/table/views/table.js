// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple, Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('views/table_header');
sc_require('views/table_cell');

sc_require('mixins/table_delegate');
sc_require('views/table_head');

/** @class
  
  A table view renders a two-dimensional grid of data.
  
  TODO: More documentation.
  
  @extends SC.ListView
  @extends SC.TableDelegate
  @since SproutCore 1.1
*/

SC.TableView = SC.ListView.extend(SC.TableDelegate, {
  /** @scope SC.TableView.prototype */  
  
  // ..........................................................
  // PROPERTIES
  // 
  
  classNames: ['sc-table-view'],
  
  childViews: "tableHeaderView dataView".w(),
  
	columns: null,
	horizontalScrollOffset: 0,
	numColumns: null,
	content: null,
	dataSource: null,
	
	sortDescriptor: null,
	sortDescriptorBinding: '*dataSource.orderBy',
	
	init: function() {
		sc_super()
		if(!this.columnsBinding)
			this.notifyPropertyChange('columns')
	},

	content: function() {
		return this.get('dataSource')
	}.property('dataSource').cacheable(),

	contentDidChange: function() {
		this.notifyPropertyChange('dataSource')
		this.getPath('dataView.contentView').reload(null)
	}.observes('*content.[]'),
	
  dataView: SC.ScrollView.design({
    isVisible: YES,
    layout: {
      left:   0,
      right:  0,
      bottom: 0,
      top:    40
    },
    borderStyle: SC.BORDER_NONE,
    contentView: SC.DataView.design({
			rowHeight: 22,
			classNames: ['endash-table-data-view'],
 			tableBinding: '.parentView.parentView.parentView',
			sortDescriptorBinding: '*table.sortDescriptor',
 			columnsBinding: '*table.columns',
			dataSourceBinding: '*table.dataSource'
		}),
	  autohidesVerticalScroller: NO,
		horizontalScrollOffsetBinding: '.parentView.horizontalScrollOffset',
  }),

  tableHeaderView: SC.ScrollView.design({
    isVisible: YES,
    layout: {
      left:   0,
      right:  16,
      bottom: 0,
      top:    0,
 			height: 39
    },
 		hasHorizontalScroller: NO,
 	  canScrollHorizontal: function() {
 			return YES
 		}.property().cacheable(),
 		horizontalScrollOffsetBinding: '.parentView.horizontalScrollOffset',
    borderStyle: SC.BORDER_NONE,
    contentView: SC.TableHeaderView.extend({
 			tableBinding: '.parentView.parentView.parentView',
 			columnsBinding: '*table.columns',
			sortDescriptorBinding: '*table.sortDescriptor'
 		})
  }),
	
	_sctv_columnsDidChange: function() {
		var columns = this.get('columns')
		if(SC.none(columns) || columns.get('length') < 1 || columns == this._columns)
			return this
			
		var observer   = this._sctv_columnsRangeObserver
		var func = this.columnsRangeDidChange;
			
		if(this._columns)
			this._columns.removeRangeObserver(observer)

		observer = columns.addRangeObserver(null, this, func, null);      
		this._sctv_columnsRangeObserver = observer ;

		this.resetRules()
		
		this._columns = columns
	}.observes('columns'),
	
	resetRules: function() {
		var columns = this.get('columns'),
			stylesheet = this._stylesheet,
			left = 6,
			offsets = this._offsets = [],
			widths = this._widths = [],
			width
		
		if(stylesheet)
			stylesheet.destroy()
			
		stylesheet = this._stylesheet = SC.CSSStyleSheet.create()

		columns.forEach(function(column, i) {
			offsets[i] = left
			stylesheet.styleSheet.insertRule(this.ruleForColumn(i), i)
			left += widths[i]
		}, this)
		
    this.getPath('dataView.contentView').set('calculatedWidth', left);
	},
	
	ruleForColumn: function(column) {
		var columns = this.get('columns'),
			col = columns.objectAt(column),
			width = col.get('width')
		this._widths[column] = width
		return ['div.column-' + column + ' {',
				'width: ' + width + 'px !important;',
				'left: ' + this._offsets[column] + 'px !important;',
			'}'].join("")
	},
	
	columnsRangeDidChange: function(columns, object, key, indexes) {
		if(this._ghost)
			return
			
		var columns = this.get('columns'),
			len = columns.get('length')

		if(indexes !== 0)
			indexes = indexes.firstObject()
		
		var diff = columns.objectAt(indexes).get('width') - this._widths[indexes]
		var css = this._stylesheet.styleSheet
		
		for(var i = indexes; i < len; i++) {
			css.deleteRule(i)
			if(i > indexes)
				this._offsets[i] += diff
			css.insertRule(this.ruleForColumn(i), i)
		}
			
		this.getPath('dataView.contentView').calculatedWidth += diff
		this.getPath('dataView.contentView').adjust(this.getPath('dataView.contentView').computeLayout())
	},
	
	sortByColumn: function(column, sortState) {
		if(sortState != "ASC")
			sortState = "ASC"
		else
			sortState = "DESC"
		this.set('sortDescriptor', sortState + " " + column.get('key'))
	},
	
	// reordering
	
	ghostForColumn: function(column) {
		var columns = this.get('columns'),
			idx = columns.indexOf(column),
			el = this.getPath('dataView.contentView').ghostForColumn(idx)
			
		this._ghostLeft = this.getPath('tableHeaderView.contentView').offsetForView(idx) + 1
		this._ghost = el
		SC.$(el).css({left: this._ghostLeft, top: 40})
		this.get('layer').appendChild(el)
	},

	draggingColumn: function(column) {
		this.$().addClass('reordering-columns')
		this.ghostForColumn(column)
		this._dragging = column
	},
	
	columnDragged: function(offset) {
		this._ghostLeft += offset
		SC.$(this._ghost).css('left', this._ghostLeft + "px !important")
	},
	
	endColumnDrag: function() {
		this.$().removeClass('reordering-columns')
		this.get('layer').removeChild(this._ghost)
		this._ghost = this._blocker = null
		this._ghostLeft = null
		this.resetRules()
		this.getPath('dataView.contentView').reload(null)
	},
	
	swapColumns: function(col1, col2) {
	},
	
	sortByColumn: function(column, sortState) {
		if(sortState != "ASC")
			sortState = "ASC"
		else
			sortState = "DESC"
		this.set('sortDescriptor', sortState + " " + column.get('key'))
	}
		
})
