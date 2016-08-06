// @flow

import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';

export default StoredComponentMixin = (superclass) => class extends superclass {
  constructor(props) {
    super(props);
    this.keyPrefix = props.storedName || this.constructor.name;
    this.keyPrefix = '@' + this.keyPrefix + ":";
    this.keyListKey = this.keyPrefix + "keyList";
    this.keyList = [];
  }

  async reset(list) {
    if (!list) {
      list = await this.get(this.keyListKey) || [];
    }

    console.log("Resetting Storage for: ", list);
    var queue = [];
    list.forEach((key) => {
      queue.push(AsyncStorage.removeItem(this.keyPrefix + key), (error)=>{ console.log("reset error", error); });
    });

    key = this.keyListKey;
    queue.push(AsyncStorage.removeItem(key));

    await Promise.all(queue);
  }

  /* Use addKey if a storage backed state is needed but it's not practical to provide
     a default to restore() for it.  Case in point, dynamically allocated objects only
     known at run-time.  Once in the keyList, these objects will be stored just like 
     any others.  (see this.setState)
  */ 
  async addKey(key) {
    if (this.keyList.includes(key)) { return }

    this.keyList.push(key);
    return this.put(this.keyListKey, this.keyList);
  }

  /* restore() brings back the values of storage backed state.  Anything in
     storage will have precedence over the defaults.  Essentially, the default
     is the initializer only.  Adding new defaults will cause the storage to
     be added the next time restore() is executed on that Component.
  */
  async restore(defaults) {
    console.log("restore", defaults);
    this.keyList = await this.get(this.keyListKey) || [];
    var queue = [];
    var newState = {};
    var keysUpdated = false;
    var self = this;

    var restoreFromDefault = async function(key, def) {
      self.keyList.push(key);
      keysUpdated = true;

      if (typeof def === 'function') {
        return def()
          .then((value) => {
            queue.push(self.put(self.keyPrefix + key, value));
            newState[key] = value;
          });
      } else {
        queue.push(self.put(self.keyPrefix + key, def));
        newState[key] = def;
      }
    };

    var restoreFromStorage = async function(key, def) {
      return self.get(self.keyPrefix + key)
        .then((value)=>{
          if (value === null)
            return restoreFromDefault(key, def);

          newState[key] = value;
        });
    }

    this.keyList.forEach((key, index) => {
      queue.push(restoreFromStorage(key, defaults[key]));
      delete defaults[key];
    });

    var newKeys = Object.keys(defaults);
    newKeys.forEach((key, index) => {
      queue.push(restoreFromDefault(key, defaults[key]));
    });

    return Promise.all(queue)
      .then(() => {
        queue = [];
        if (keysUpdated)
          queue.push(this.put(this.keyListKey, this.keyList));
        if (newState !== {})
          queue.push(super.setState(newState));
        return Promise.all(queue);
      });
  }

  /* The mixin's setState implementation sits between the Component and the
     react implementation of setState.  The Component gets transparent support
     for storage backing once it's configured to use this mixin.  Only objects
     in this.keyList will be stored, all other state is simply forwarded to 
     the super.
  */
  async setState(obj) {
    var objKeys = Object.keys(obj);
    var queue = []
    objKeys.forEach((key, index) => {
      if (this.keyList.includes(key)) {
        queue.push(
          this.put(this.keyPrefix + key, obj[key])
        );
      }
    });

    queue.push(super.setState(obj));
    return Promise.all(queue);
  }

  /* helper function to get values out of AsyncStorage
  */
  async get(key) {
    try {
      let value = await AsyncStorage.getItem(key);
      try { 
        return JSON.parse(value) 
      } catch (error) { 
        return value 
      }
    } catch (error) {
      console.log("Retrieval Error: ", error, ' for ', key);
    }
    console.log("get failed for ", key);
    return null;
  }

  /* helper function to put values into AsyncStorage
  */
  async put(key, value) {
    try {
      if (typeof value !== 'string') {
        value = JSON.stringify(value);
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.log("Storage Error: ", error);
      return false;
    }
    return true;
  }

}
