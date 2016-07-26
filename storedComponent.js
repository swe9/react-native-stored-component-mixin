import React, { Component } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Button from 'react-native-button';
import Icon from 'react-native-vector-icons/Entypo';
import Logging from './logging.js';

class ModalHelp extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: false }
    this.actions = [{title: 'Done', show: 'always', iconName: 'cross', iconSize: 24}];
  }

  toggle() {
    this.setState({visible: !this.state.visible});
  }

  onActionSelected(position) {
    Logging.log("ModalHelp.onActionSelected", position);
    if (this.actions[position].title === 'Done') {
      this.toggle();
    }
  }

  render() {
    return (
      <Modal transparent={false} visible={this.state.visible} onRequestClose={this.toggle.bind(this)}>
        <Icon.ToolbarAndroid style={{backgroundColor: '#ddd', height: 56}}
          navIconName="chevron-thin-left"
          title="Help"
          actions={this.actions}
          onIconClicked={this.toggle.bind(this)}
          onActionSelected={this.onActionSelected.bind(this)}
        />
        <View style={{flex:1,margin:10}}>
          <Text>
            Each quote is divided into 4 rows and the letters in each column are then scrambled.
            Swap the letters up and down in each column until the quote appears.
            Words may be divided in the middle and continued on the next line, so look closely.
          </Text>
          <Text></Text>
          <Text>
            To swap letters, just click on them. The first click will highlight a letter. 
            The second click will swap them.
          </Text>
        </View>
        <View style={{flex:1,margin:10}}>
          <Text>
            Puzzle packs may be purchased and a set of puzzles will then be permanently available on 
            your device.  Restore purchases...
          </Text>
        </View>
      </Modal>
    );
  }
}

class ModalDebug extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: false }
    this.actions = [{title: 'Done', show: 'always', iconName: 'cross', iconSize: 24}];
  }

  toggle() {
    this.setState({visible: !this.state.visible});
  }

  onActionSelected(position) {
    Logging.log("ModalDebug.onActionSelected", position);
    if (this.actions[position].title === 'Done') {
      this.toggle();
    }
  }

  render() {
    return (
      <Modal transparent={false} visible={this.state.visible} onRequestClose={this.toggle.bind(this)}>
        <Icon.ToolbarAndroid style={{backgroundColor: '#ddd', height: 56}}
          navIconName="chevron-thin-left"
          title="Debug"
          actions={this.actions}
          onIconClicked={this.toggle.bind(this)}
          onActionSelected={this.onActionSelected.bind(this)}
        />
        <View style={{flex:1,margin:10}}>
          <Button 
            containerStyle={[styles.button,styles.buttonContainer]}
            style={styles.buttonText}
            onPress={this.props.resetStorage}
            >
            Reset Storage
          </Button>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    margin: 2,
    height:40
  },
  buttonContainer: {
    padding:5, 
    overflow:'hidden', 
    borderRadius:10, 
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 24, 
  },
});

export { ModalHelp, ModalDebug }
