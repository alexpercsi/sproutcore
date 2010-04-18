require('views/table')

SC.SheetView = SC.TableView.extend({
	dataSource: function() {
		if(this._sourceController)
			return this._sourceController
			
		var source = this._sourceController = SC.ArrayController.create({
			content: [],
			
			numberOfRowsInTableView: function(tableView) {
				return Math.max(tableView.get('nowShowing').get('length'), this.get('length'))
			},
			
			valueForRowAndColumnInTableView: function(row, column, tableView) {
				
				var content = this.get('content'),
					rowArray = content.objectAt(row),
					length = this.get('length')
					
				if(SC.none(rowArray)) {
					rowArray = []
					this.replace(row, 1, rowArray)
				}
				
				// if(row >= length)
					// this.set('length', row + 1)
				
				value = rowArray.objectAt(column)
				return value
			}
		})
		
		return source
	}.property().cacheable(),
	
	columns: function() {
		if(this._columnsController)
			return this._columnsController
			
		var columns = this._columnsController = SC.ArrayController.create({
			content: [],
			
			length: function(tableView) {
				return Math.max(tableView.get('nowShowingColumns').get('length'), this.get('length'))
			},
			
			objectAt: function(index) {
				var content = this.get('content'),
					item = this.get('content').objectAt(index)

				if(!item) {
					item = SC.TableView.create({width: 100})
					item.replace(index, 1, item)
				}
				
				return item
			}
		})
		
		return columns
	}.property().cacheable(),
	
	length: function() {
		this.get('dataSource').numberOfRowsInTableView(this)
	}.property()
})