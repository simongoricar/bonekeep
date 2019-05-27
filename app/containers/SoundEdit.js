// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Modal, Label, Grid } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ipcRenderer } from 'electron';
import FontAwesomeIcon from '../components/FontAwesomeIcon';
import {
  setSoundFile,
  setSoundKeybind,
  setSoundName,
  SOUND_STRUCTURE
} from '../redux/actions/sounds';

import { setKeybind, removeKeybind } from '../core/Keybinds';

import { mapSound } from '../redux/connect/stateToPropsCommon';
import { stripToLength } from '../core/Utilities';

class SoundEdit extends Component {
  constructor(props) {
    super(props);

    ipcRenderer.on('fileDialog-chosen', (_, args) => {
      // If no file was chosen, return
      if (args === null || args.length === 0) {
        return;
      }

      const { DSetSoundFile } = this.props;
      DSetSoundFile(this.soundId, args[0]);
    });

    this.soundId = props.soundId;
    this.keybindInputRef = React.createRef();
    this.nameInputRef = React.createRef();
  }

  openFileDialog = () => {
    ipcRenderer.send('showOpenFileDialog', {});
  };

  setPlayKeybind = () => {
    const { DSetSoundKeybind } = this.props;
    const newKey = this.keybindInputRef.current.inputRef.current.value;
    // TODO transform to Logger, along with other log calls here
    console.log(`Keybind registered: ${newKey}`);

    const {
      sound: { keybind },
      playerPlay
    } = this.props;
    if (keybind) {
      // Unbind the previous bind
      removeKeybind(keybind);
    }

    // Bind the (new?) key
    setKeybind(newKey, playerPlay);
    DSetSoundKeybind(this.soundId, newKey);
  };

  setSoundName = () => {
    const { DSetSoundName } = this.props;
    const newName = this.nameInputRef.current.inputRef.current.value;

    DSetSoundName(this.soundId, newName);
  };

  render() {
    const {
      soundId,
      sound,
      DSetSoundFile,
      DSetSoundKeybind,
      DSetSoundName,
      // Modal-related
      open,
      onClose,
      ...other
    } = this.props;

    return (
      <Modal size="large" open={open} onClose={onClose} {...other}>
        <Modal.Header>Editing sound with id: &#39;{soundId}&#39;</Modal.Header>
        <Modal.Content>
          <Grid centered verticalAlign="middle">
            {/* Sound name */}
            <Grid.Row>
              <Grid.Column width={5}>
                <Label pointing="right" size="huge">
                  Sound Name
                </Label>
              </Grid.Column>
              <Grid.Column width={11}>
                <Input
                  action={
                    <Button
                      className="no-border left"
                      onClick={this.setSoundName}
                    >
                      Update
                    </Button>
                  }
                  placeholder={sound.name || 'Sound name'}
                  ref={this.nameInputRef}
                />
              </Grid.Column>
            </Grid.Row>

            {/* Audio file */}
            <Grid.Row>
              <Grid.Column width={5}>
                <Label pointing="right" size="huge">
                  Audio file
                </Label>
              </Grid.Column>
              <Grid.Column width={11}>
                <Button onClick={this.openFileDialog}>
                  <FontAwesomeIcon
                    iconName="file-import"
                    color="c-transparent-dark"
                  />
                  <span className="ml-8">Load file</span>
                </Button>
                <Label pointing="left" size="medium">
                  {sound.filename
                    ? stripToLength(sound.filename, 50, '...')
                    : 'No file'}
                </Label>
              </Grid.Column>
            </Grid.Row>

            {/* Play keybind */}
            <Grid.Row>
              <Grid.Column width={5}>
                <Label pointing="right" size="huge">
                  Play keybind
                </Label>
              </Grid.Column>
              <Grid.Column width={11}>
                <Input placeholder="Keybind" ref={this.keybindInputRef}>
                  <input className="no-border right" />
                  <Button
                    className="no-border left"
                    onClick={this.setPlayKeybind}
                  >
                    <FontAwesomeIcon
                      iconName="check"
                      color="c-transparent-dark"
                    />
                  </Button>
                </Input>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Content>
      </Modal>
    );
  }
}

SoundEdit.propTypes = {
  // Modal-specific
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  playerPlay: PropTypes.func,
  // Redux and other props
  soundId: PropTypes.node.isRequired,
  sound: PropTypes.shape(SOUND_STRUCTURE),
  // Redux actions
  DSetSoundFile: PropTypes.func.isRequired,
  DSetSoundKeybind: PropTypes.func.isRequired,
  DSetSoundName: PropTypes.func.isRequired
};
SoundEdit.defaultProps = {
  sound: {},
  onClose: null,
  playerPlay: null
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    {
      DSetSoundFile: setSoundFile,
      DSetSoundKeybind: setSoundKeybind,
      DSetSoundName: setSoundName
    },
    dispatch
  );
};

export default connect(
  mapSound,
  mapDispatchToProps
)(SoundEdit);