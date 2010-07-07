SC.PoolableClass = {
  isPooled: YES,
  
  _objectPool: [],
  maxPoolSize: 100,
  
  _pool_default_concat_values: {}, // default values for concatenated properties
  
  create: function() {
    // first, check pool
    var object;
    if (this._objectPool.length > 0) {
      object = this._objectPool.pop();
      
      // wake from pool
      object.poolManager = this;
      object.mixin(this._pool_default_concat_values);
      if (object.wakeFromPool) object.wakeFromPool(arguments);
    } else {
      object = this._no_pool_create.apply(this, arguments);
      object.poolManager = this;
    }
    
    // and return
    return object;
  },
  
  returnToPool: function(object) {
    if (this._objectPool.length >= this.maxPoolSize) return NO;
    this._objectPool.push(object);
    if (object.returnToPool) object.returnToPool();
    return YES;
  }
};