# react-native-stored-component-mixin
## Transparently add AsyncStorage to a React Native Component

There are several projects showing how to use AsyncStorage straight up, or to use a database interface to it.  This is a different concept where the goal is to hide the AsyncStorage details from the storage-backed component as much as possible so you can get on with building the component itself rather than worrying about storage details.

The key concept is to use a mixin approach to insert a new setState() method between the component and the React Native implementation.  The intermediary handles all the storage requirements while the component just does its normal setState() thing.  Credit to the awesome [MixWith project](https://www.npmjs.com/package/mixwith) for showing the best way to do mixins with React Native, it works a charm here!  

The mixin includes a handful of methods into the component's class:  restore(), setState(), addKey(), get(), and put().  The restore method is where things really start.  It's responsible for pulling state out of storage or adding new state into storage when the component mounts.  The setState method is responsible for saving to storage when state is changed and then forwarding those changes on to React Native.  The addKey method supports dynamically adding storage-backed state after the component has mounted.  The get and put methods are really internal to the implementation, but they are generic so you can use them for whatever you want.

# Installation 
I'm not sure about how to package this for actual use in someone else's project.  If anyone wants to help me get that straight please do!

Right now you can copy the file into your project and import it into whichever source files will be using it.  It exports one symbol: StoredComponentMixin.

# Usage
Follow the MixWith style like so:
```
import StoredComponentMixin from './storedComponent.js';
 
class AwesomeProject extends StoredComponentMixin(Component) {
  constructor(props) {
    props.storedName = "AwesomeProjectMixed";  // optionally override the Storage key's basename
    super(props);                              // StoredComponentMixin has a constructor
  }
  ...
}
```
Add a call to restore() in componentDidMount():
```
  componentDidMount() {
    /* The storage backing for state comes from the mixin declaration of the Component's class
       and this call to restore().  See the comments in storedComponent.js for details.
       These values are the initial defaults when the keys are not yet in Storage.
    */
    this.restore({
      state1: 'a value',
      state2: this.state2Init,
      state3: [ 1, 2, 3 ],
    })
    .then(()=> {
      /* Anything that depends on state being updated will have to wait
         on the promises from restore() before using it.
      */
      this.useNewState();
    });
  }
```
Optionally add an initializer method as the example above suggests:
```
  async state2Init() {
    return fetch("http://example.com/stuff.php")
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        return data;
      });
  }

```
Optionally add new keys at runtime as the example above suggests:
```
useNewState() {
  // fetch some stuff and generate a dynamic index for it
  let key = "stuff_" + index;
  this.addKey(key);  // It's critical to add the key before setting the state :-)
  let obj = {};
  obj[key] = value;
  this.setState(obj);
}
```
# Notes
It can be handy to override the storage key's basename rather than dealing with clearing keys every run.  I haven't provided any support for deleting keys out of AsyncStorage (yet).  Test things out by killing your app and restarting it, you should automagically resume from the prior state.  

Once the setup is handled, the remainder is just simple calls to `this.setState()`.  And **that's** what I meant by `transparent`!
