SC.PoolableMixin = {
  /**
Poolable objects are only destroyed if they cannot be added to the pool.
*/
  destroy: function() {
    // remove from parent if found
    if (!this.disableRemoveOnDestroy) this.removeFromParent() ;
    this.destroyLayer();
  
    // unregister for drags
    if (this.get('isDropTarget')) SC.Drag.removeDropTarget(this) ;
  
    // unregister for autoscroll during drags
    if (this.get('isScrollable')) SC.Drag.removeScrollableView(this) ;
  
    if (this.poolManager) if (this.poolManager.returnToPool(this)) return;
    return this._no_pool_destroy();
  },

  wakeFromPool: function(args) {
    this.beginPropertyChanges();
    var concat = this.concatenatedProperties;
    for (var idx = 0; idx < args.length; idx++) {
      var o = args[idx];
      for (var i in o) {
        var v = o[i];
        
        // handle concatenated
        if (concat.indexOf(i) >= 0) {
          if (!(v instanceof Array)) v = SC.$A(v);
          v = SC.$A(this.get(i, o[i])).concat(v);
        }
        
        // and now set
        this.set(i, v);
      }
    }
    this.endPropertyChanges();
  }
};