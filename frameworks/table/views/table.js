sc_require('views/table_header')
sc_require('views/table_cell')


SC.TableView = SC.View.extend({
	classNames: ['endash-table-view'],
  childViews: "tableHeaderView dataView".w(),
	horizontalScrollOffset: 0,
	numColumns: null,
	content: null,
	dataSource: null,
	
	cellPadding: 5,
	columnBorder: 1,
	
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
		var columns = this.get('columns')
		var stylesheet = this._stylesheet
		var left = 0
		var offsets = this._offsets = []
		var widths = this._widths = [],
			width
		
		if(stylesheet)
			stylesheet.destroy()
		stylesheet = this._stylesheet = SC.CSSStyleSheet.create()

		columns.forEach(function(column, i) {
			width = column.get('width')
			stylesheet.styleSheet.insertRule(['div.column-' + i + ' {',
					'width: ' + width + 'px !important;',
					'left: ' + left + 'px !important;',
				'}'].join(""), i)
			offsets[i] = left
			widths[i] = column.get('width')
			left += column.get('width')
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
		
		if(this.isResizing)
			len = indexes + 1

		for(var i = indexes; i < len; i++) {
			css.deleteRule(i)
			if(i > indexes)
				this._offsets[i] += diff
			css.insertRule(this.ruleForColumn(i), i)
		}
			
		this.getPath('dataView.contentView').calculatedWidth += diff
		this.getPath('dataView.contentView').adjust(this.getPath('dataView.contentView').computeLayout())
	},
	
	ghostForColumn: function(column) {
		var el = this.getPath('dataView.contentView').ghostForColumn(column)
		this._ghostLeft = this._offsets[column] - 1
		this._ghost = el
		SC.$(el).css({left: this._ghostLeft, top: 40})
		this.get('layer').appendChild(el)
	},
	
	beginResize: function() {
		this.$().addClass('resizing-columns')
		this.isResizing = YES
	},
	
	endResize: function() {
		this.$().removeClass('resizing-columns')
		this.isResizing = NO
		this.resetRules()
	},
	
	draggingColumn: function(column) {
		this.$().addClass('reordering-columns')
		this.ghostForColumn(column)
		this._dragging = column
		var css = this._stylesheet.styleSheet
		// css.insertRule('div.cell, div.blocker { -webkit-transition-property: width, left; -webkit-transition-duration: .3s, .3s; }')
		css.insertRule('div.sc-dataview-row div.cell.column-' + this._dragging + " {opacity: .1 !important}")
	},
	
	columnDragged: function(offset) {
		this._ghostLeft += offset
		SC.$(this._ghost).css('left', this._ghostLeft + "px !important")
	},
	
	endColumnDrag: function() {
		this.$().removeClass('reordering-columns')
		this.get('layer').removeChild(this._ghost)
		this._ghost = this._blocker = null
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