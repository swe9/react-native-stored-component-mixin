# react-native-stored-component-mixin
Transparently add AsyncStorage to a React Native Component

There are several projects showing how to use AsyncStorage straight up, or to use a database interface to it.  This is a different concept where the goal is to hide the AsyncStorage details from the storage backed component as much as possible so you can get on with building the component itself rather than worrying about storage details.

The key concept is to use a mixin approach to insert a new setState() method between the component and the React Native implementation.  The intermediary handles all the storage requirements while the component just does its normal setState() thing.  Credit to the awesome MixWith project for showing the best way to do mixins with React Native, it works a charm here!  (https://www.npmjs.com/package/mixwith)

The mixin includes a handful of methods into the component's class:  restore(), setState(), addKey(), get(), and put().  The restore method is where things really start.  It's responsible for pulling state out of storage or adding new state into storage when the component mounts.  The setState method is responsible for saving to storage when state is changed and then forwarding those changes on to React Native.  The addKey method supports dynamically adding storage backed state after the component has mounted.  The get and put methods are really internal to the implementation, but they are generic so you can use them for whatever you want.

# Installation 
I'm not sure about how to package this for actual use in someone else's project.  If anyone wants to help me get that straight please do!

Right now you can copy the file into your project and require('./storedComponent.js') into whichever source files will be using it.  It exports one symbol: StoredComponentMixin.

# Usage
Follow the MixWith style like so:

class AwesomeProject extends StoredComponentMixin(Component) {
  constructor(props) {
    props.storedName = "AwesomeProjectMixed";  // optionally override the key's basename
    super(props);
  }
}

Add a call to restore() in componentDidMount():

  componentDidMount() {
    /* The storage backing for state comes from the mixin declaration of the class
       and this call to restore().  See the comments in component.js for details.
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
