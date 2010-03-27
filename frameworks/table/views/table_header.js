
require('views/table_header_cell')
SC.TableHeaderView = SC.DividerView.extend({
	
	classNames: ['endash-table-header'],
	thicknessKey: 'width',
	dividerSpacing: 0,
	
	columnsDidChange: function() {
		var columns = this.get('columns')
		if (SC.none(columns) || columns === this._columns) return this; // nothing to do
		this.set('thicknesses', columns)
		
		var headers = columns.map(function(column) {
			return this.createChildView(SC.TableHeaderCellView.extend({
				column: column,
				delegate: this
			}))
		}, this)
		
		headers.push(this.createChildView(SC.TableHeaderCellView.extend({
			spacer: YES
		})))
		
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
	}
	
	
})