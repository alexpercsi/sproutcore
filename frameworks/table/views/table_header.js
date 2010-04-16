
require('views/table_header_cell')
SC.TableHeaderView = SC.DividerView.extend({
	
	classNames: ['endash-table-header'],
	thicknessKey: 'width',
	dividerSpacing: 0,
	
	columnsDidChange: function() {
		var columns = this.get('columns')
		if (SC.none(columns) || columns === this._columns) return this; // nothing to do
		this.set('thicknesses', columns)
		
		var headers = columns.map(function(column, idx) {
			return this.createChildView(SC.TableHeaderCellView.extend({
				column: column,
				columnIdx: idx,
				delegate: this
			}))
		}, this)
		
		headers.push(this.createChildView(SC.TableHeaderCellView.extend({
			spacer: YES
		})))
		
		this.set('headers', headers.slice())
				
		this.beginPropertyChanges();
		this.destroyLayer().removeAllChildren();
		this.set('childViews', headers); // quick swap
		this.replaceLayer();
		this.endPropertyChanges();

	}.observes('columns'),
	
	_div_reload: function(indexes) {
		if(SC.none(this.get('columns')))
			return
		sc_super()
	},
	
	thumbViewDidBeginDrag: function() {
		this.get('table').beginResize()
		sc_super()
	},
	
	thumbViewDidEndDrag: function() {
		this.get('table').endResize()
		sc_super()
	},
	
	anchorViewDidBeginDrag: function(view, evt) {
		this.get('table').draggingColumn(view.columnIdx)
		this.get('table').columnDragged(sc_super())
	},
	
	anchorViewWasDragged: function(view, evt) {
		var ret = sc_super()
		this.get('table').columnDragged(ret)
	},

	anchorViewDidEndDrag: function(view, evt) {
		this.get('table').endColumnDrag()
		sc_super()
	},
	
	swapViews: function(view1, view2) {
		view1i = view1.columnIdx
		view2i = view2.columnIdx
		view1.columnIdx = view2i
		view2.columnIdx = view1i
		sc_super()
		this.get('table').swapColumns(view1i, view2i)

	},
})