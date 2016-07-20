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
    // Get the list of all stored keys
    this.keyList = await this.get(this.keyListKey) || [];
    var queue = [];

    // Pull back the values of all stored objects
    var restoredObj = {};
    var restoredQueue = [];
    this.keyList.forEach( (key, index) => {
      delete defaults[key];  // don't take default of a restored value
      restoredQueue.push(
        this.get(this.keyPrefix + key)
          .then((value)=>{
            restoredObj[key] = value;
          })
      );
    });

    // Do a React-only setState on all restored values, they're already in storage
    if (restoredQueue.length > 0) {
      queue = [
        Promise.all(restoredQueue)
          .then(()=>{
            console.log("restore retrieves state for: ", Object.keys(restoredObj));
            super.setState(restoredObj);
          })
      ]
    }

    // Establish any new values from their defaults
    var defaultsObj = {};
    var defaultsQueue = [];
    var newKeys = Object.keys(defaults);
    newKeys.forEach((key, index) => {
      if (typeof defaults[key] === 'function') {
        defaultsQueue.push(
          defaults[key]()
            .then((value) => {
              defaultsObj[key] = value;
            }
          )
        );
      } else {
        defaultsObj[key] = defaults[key];
      }
    });

    // Do a mixin setState on all default values to get them into storage
    if (newKeys.length > 0) {
      console.log("adding to keyList: ", newKeys);
      this.keyList = this.keyList.concat(newKeys);
      queue.push(
        this.put(this.keyListKey, this.keyList)
      );
      queue.push(
        Promise.all(defaultsQueue)
          .then(()=>{
            console.log("restore saves state for: ", Object.keys(defaultsObj));
            this.setState(defaultsObj);
          })
      );
    }

    return Promise.all(queue);
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
          this.put(this.keyPrefix + key, JSON.stringify(obj[key]))
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
      return JSON.parse(value);
    } catch (error) {
      console.log("Retrieval Error: ", error);
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
