
require('views/table_header_cell')
SC.TableHeaderView = SC.View.extend(SC.SimpleLayout, {
	
	classNames: ['endash-table-header'],
	
	thicknessPath: 'column.width',
	startOffset: 6,
	offsetDelta: -1,
	widthDelta: 1,
	
	columnsDidChange: function() {
		var columns = this.get('columns')
		if (SC.none(columns) || columns === this._columns) return this; // nothing to do

		this.set('thicknesses', columns)
		
		var childViews = columns.map(function(column, idx) {
			return this.createChildView(SC.TableHeaderCellView.extend({
				// layout: {width: column.get('width')},
				column: column,
				delegate: this,
				calculatedWidth: column.get('width')
			}))
		}, this)
		
		this.beginPropertyChanges();
		this.destroyLayer().removeAllChildren();
		this.set('childViews', childViews); // quick swap
		this.replaceLayer();
		this.endPropertyChanges();
	}.observes('columns'),
	
	// thumbViewDidBeginDrag: function() {
	// 	this.get('table').beginResize()
	// 	sc_super()
	// },
	// 
	// thumbViewDidEndDrag: function() {
	// 	this.get('table').endResize()
	// 	sc_super()
	// },
	
	headerDidBeginDrag: function(view, evt) {
		this.get('table').draggingColumn(view.get('column'))
		// this.get('table').columnDragged(sc_super())
	},
	
	headerWasDragged: function(view, evt) {
		var ret = sc_super()
		this.get('table').columnDragged(ret)
	},

	headerDidEndDrag: function(view, evt) {
		this.get('table').endColumnDrag()
		sc_super()
	},
	
	swapViews: function(view1, view2) {
		var childViews = this.get('childViews')
		var columns = this.get('columns')

		var index1 = childViews.indexOf(view1)
		var index2 = childViews.indexOf(view2)
		var column1 = columns.objectAt(index1)
		var column2 = columns.objectAt(index2)

		childViews.beginPropertyChanges()
		childViews.replace(index1, 1, view2)
		childViews.replace(index2, 1, view1)
		childViews.endPropertyChanges()

		columns.beginPropertyChanges()
		columns.replace(index1, 1, column2)
		columns.replace(index2, 1, column1)
		columns.endPropertyChanges()		
	},
})