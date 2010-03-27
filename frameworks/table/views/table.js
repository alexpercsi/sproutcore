sc_require('views/table_header')
sc_require('views/table_cell')


SC.TableView = SC.ListView.extend({
	classNames: ['endash-table-view'],
  childViews: "tableHeaderView dataView".w(),
  childViews: "dataView".w(),
	columns: null,
	horizontalScrollOffset: 0,
	
	// orderBy: '',
	// orderByBinding: '*content.orderBy',
	// sortColumn: null,
	// sortDirection: null,
	
	exampleView: SC.TableCellView.extend({
		useFactory: YES
	}),
	
		
	// init: function() {
		// sc_super()
		// this.columnsDidChange()
	// },
	  
  dataView: SC.ScrollView.design({
    isVisible: YES,
    layout: {
      left:   -1,
      right:  0,
      bottom: 0,
      top:    17
    },
    borderStyle: SC.BORDER_NONE,
    contentView: SC.View.design({
			// classNames: ['endash-table-data-view'],
			// thicknessesBinding: '.parentView.parentView.parentView.columns',
			// thicknessKey: 'width',
			// computedWidthBinding: '.parentView.parentView.parentView.totalThickness',
			// showDividers: NO,
			// _div_reload: function(indexes) {
				// if(SC.none(this.get('thicknesses')))
					// return
				// sc_super()
			// },
		}),
	  autohidesVerticalScroller: NO,
		horizontalScrollOffsetBinding: '.parentView.horizontalScrollOffset',

    // FIXME: Hack.
    _sv_offsetDidChange: function() {
      this.get('parentView')._sctv_scrollOffsetDidChange();
    }.observes('verticalScrollOffset', 'horizontalScrollOffset')
  }),

  // tableHeaderView: SC.ScrollView.design({
  //   isVisible: YES,
  //   layout: {
  //     left:   -1,
  //     right:  16,
  //     bottom: 0,
  //     top:    0,
  // 			height: 17
  //   },
  // 		hasHorizontalScroller: NO,
  // 	  canScrollHorizontal: function() {
  // 			return YES
  // 		}.property().cacheable(),
  // 		horizontalScrollOffsetBinding: '.parentView.horizontalScrollOffset',
  //   borderStyle: SC.BORDER_NONE,
  //   contentView: SC.TableHeaderView.extend({
  // 			tableBinding: '.parentView.parentView.parentView',
  // 			columnsBinding: '*table.columns',
  // 		})
  // }),
	
	
	/* taken almost verbatim from SC.TableView */
	

	containerView: function() {
    var scrollView = this.get('dataView');
    return (scrollView && scrollView.get) ? scrollView.get('contentView') : null;
  }.property('scrollView'),
	


	clippingFrame: function() {
    var cv = this.get('containerView'),
        sv = this.get('dataView'),
        f  = this.get('frame');
        
    if (!sv.get) {
      return f;
    }

    return {
      height: f.height,
      width:  f.width,
      x:      sv.get('horizontalScrollOffset'),
      y:      sv.get('verticalScrollOffset')
    };
    
  }.property('frame', 'content').cacheable(),
	
	_sctv_scrollOffsetDidChange: function() {
    this.notifyPropertyChange('clippingFrame');
  },
  

  computeLayout: function() {
    var layout = sc_super(),
        containerView = this.get('containerView'),
        frame = this.get('frame');
        
    var minHeight = layout.minHeight;
    delete layout.minHeight;
        
    containerView.adjust('minHeight', minHeight);
    containerView.layoutDidChange();
    
    this.notifyPropertyChange('clippingFrame');    
    return layout;
  },


	/* end code from sc.tableview */
	
		// 
		// 
		//   columnViews: function() {
		// 	var columns = this.get('columns')
		// 	if(SC.none(columns))
		// 		return null
		// 
		// 	var views = this._columnViews
		// 	var viewsHash = this._columnViewsHash
		// 	var newViews = [], view
		// 	if(!views) {
		// 		views = this._columnViews = []
		// 		viewsHash = this._columnViewsHash = {}
		// 		containersHash = this._containersHash = {}
		// 	}
		// 
		// 	columns.forEach(function(column) {
		// 		view = views[viewsHash[SC.guidFor(column)]]
		// 		if(!view) {
		// 			view = this.get('containerView').createChildView(SC.View.extend({
		// 				column: column,
		// 		  	contentValueKey: column.get('key'),
		// 				exampleView: column.get('exampleView')
		// 			}))
		// 			views.push(view)
		// 			viewsHash[SC.guidFor(column)] = view
		// 			containersHash[view.get('layerId')] = view
		// 		}
		// 		newViews.push(view)
		// 	}, this)
		// 	
		// 	view = this.get('containerView').createChildView(SC.View.extend({
		// 		spacer: YES,
		// 		// exampleView: SC.TableCellSpacerView
		// 	}))
		// 	newViews.push(view)
		// 	
		// 	var containerView = this.get('containerView')
		// 
		// 	containerView.beginPropertyChanges();
		// 	containerView.destroyLayer()
		//     containerView.set('childViews', newViews.slice()); // quick swap
		//     containerView.createLayer();
		//     containerView.endPropertyChanges();
		// 
		// 	this.get('dataView').get('containerView').replaceContent(containerView)
		// 	
		// 	return newViews
		// }.property('columns').cacheable(),
	
	
	// columnsDidChange: function() {
	// 	var columns = this.get('columns')
	// 	if (SC.none(columns) || columns === this._columns) return this; // nothing to do
	// 	var observer   = this._sctv_columnsRangeObserver
	// 	var func = this.columnsRangeDidChange;
	// 	if(this._columns)
	// 		this._columns.removeRangeObserver(observer)
	// 	observer = columns.addRangeObserver(null, this, func, null);      
	// 	this._sctv_columnsRangeObserver = observer ;
	// 	this._columns = columns
	// }.observes('columns'),
	
	// columnsRangeDidChange: function(content, object, key, indexes) {
	// 	if(key == "[]")
	// 		this.notifyPropertyChange('columns')
	// },
	// 
	reloadSelectionIndexesIfNeeded: function() {
		var invalid = this._invalidSelection;
		if (!invalid || !this.get('isVisibleInWindow')) return this ; 

		var nowShowing = this.get('nowShowing'),
				reload     = this._invalidIndexes,
				content    = this.get('content'),
				sel        = this.get('selection');

		this._invalidSelection = NO; // reset invalid

		// fast path.  if we are going to reload everything anyway, just forget
		// about it.  Also if we don't have a nowShowing, nothing to do.
		if (reload === YES || !nowShowing) return this ;

		// if invalid is YES instead of index set, just reload everything 
		if (invalid === YES) invalid = nowShowing;

		// if we will reload some items anyway, don't bother
		if (reload && reload.isIndexSet) invalid = invalid.without(reload);

		this.reload(invalid)

		return this ;
	 },
	
	sortByColumn: function(column) {
		var sortColumn = this.get('sortColumn')
		if(sortColumn && sortColumn != column)
			sortColumn.set('sortState', null)
			
		this.set('sortColumn', column)
		column.toggleSortState()
		this.set('sortDirection', column.get('sortState'))
	},
	
	orderBy: function() {
		var sortDirection = this.get('sortDirection')
		var sortColumn = this.get('sortColumn')
		if(SC.none(sortColumn))
			return null
		return sortColumn.get('key') + " " + sortDirection
	}.property('sortDirection', 'sortColumn').cacheable(),
	
	reloadIfNeeded: function() {
		if(SC.none(this.get('columns')))
			return
		
		sc_super()
	},
	
	layoutForCell: function(row, column) {
		var ret = this.layoutForContentIndex(row),
			columns = this.get('columns'),

			
		
		
		if(SC.none(column))
			return ret

		ret.left = this.offsetForColumn(column)
		
		if(column >= this.get('columns').get('length'))
			return ret
			
		ret.width = this.widthForColumn(column)
		delete ret.right
		// ret.top = 0
		
		return ret
	},
	
	offsetForColumn: function(column) {
		var offsets = this.columnOffsets
		
		if(!offsets)
			offsets = this.columnOffsets = []
			
		if(column <= 0)  
			return 0
		
		if(!offsets[column])
			offsets[column]  = this.offsetForColumn(column - 1) + this.widthForColumn(column - 1)

		return offsets[column]
	},
	
	widthForColumn: function(column) {
		var columns = this.get('columns'),
		column = columns.objectAt(column)
		if(column)
			return column.get('width') || 120
	}
		
})