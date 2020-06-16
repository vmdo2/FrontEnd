import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { initialState, CTPlayerController } from '../controllers';
import { getPlayerSize } from '../controllers/helpers';
import Video from '../Video';
import Wrapper from '../Wrapper';
import './index.scss';

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;
    this.setPlayerState = this.setPlayerState.bind(this);

    const { id } = props;
    this.player = new CTPlayerController(this.setPlayerState, id);
  }

  setPlayerState(key, value) {
    this.setState({ [key]: value }, () => {
      // console.info(`set ${key}`);
      // console.info(this.state);
    });
  }

  componentDidMount() {
    const {
      mediaId,
      media,
      beginAt,
      defaultOpenCC,
      allowRangePicker,
      defaultOpenRangePicker,
      range,
      defaultRange,
    } = this.props;

    if (media && media.id) {
      this.player.setMedia(media);
    } else {
      this.player.setupMedia(mediaId);
    }

    if (beginAt) {
      this.player.setBeginAt(beginAt);
    }

    if (defaultOpenCC) {
      this.player.toggleCC();
    }

    if (allowRangePicker && defaultOpenRangePicker) {
      this.player.toggleRange();
      if (range || defaultRange) {
        this.player.setRange(range || defaultRange);
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let { media, mediaId, triggerTime } = this.props;

    if (media !== prevProps.media && media.id) {
      this.player.setMedia(media);
    } else if (mediaId !== prevProps.mediaId) {
      this.player.setupMedia(mediaId);
    }

    media = this.state.media;
    if (prevState.media !== media && media.id) {
      const { videos, isTwoScreen, isUnavailable } = media;
      if (!isUnavailable) {
        this.setState({ src1: videos[0].srcPath1 });
        if (isTwoScreen) {
          this.setState({ src2: videos[0].srcPath2 });
        }

        this.player.setupTranscriptions(media);
      }
    }

    const { currTranscription } = this.state;
    if (prevState.currTranscription !== currTranscription) {
      this.player.setupCaptions(currTranscription);
    }

    if (prevProps.triggerTime !== triggerTime) {
      this.player.setCurrentTime(triggerTime);
    }
  }

  setRange = (range) => {
    const { onRangePicked } = this.props;

    this.player.setRange(range);
    if (typeof onRangePicked === 'function') {
      onRangePicked(range);
    }
  }

  render() {
    let {
      fill = false,
      width,
      height,
      hideWrapperOnMouseLeave = false,
      //
      allowTwoScreen = false,
      // Range picker
      allowRangePicker = false,
    } = this.props;

    const {
      size,
      src1,
      event,
      videoReady,
      userReady,
      isEnded,
      isPaused,
      isFullscreen,
      isSwitchedScreen,
      duration,
      time,
      bufferedTime,
      muted,
      volume,
      playbackRate,
      openCC,
      ccFontSize,
      ccFontColor,
      ccOpacity,
      ccBackgroundColor,
      language,
      currCaption,
      openRange,
      range
    } = this.state;

    const id = this.player.id;
    const playerSize = getPlayerSize({ width, height, fill, isFullscreen });

    const containerProps = {
      id,
      className: 'ctp ct-player-con',
      style: {
        width: playerSize.width,
        height: 'max-content'
      },
    };

    const playerProps = {
      id: `ct-player-${id}`,
      ref: this.player.registerPlayer,
      style: {
        width: playerSize.width,
        height: playerSize.height
      },
      className: cx('ctp', 'ct-player', size, { fill }),
      tabIndex: '0'
    };

    const video1Props = {
      id: id ? `v1-${id}` : null,
      src: src1,
      className: isSwitchedScreen ? 'secondary' : 'primary',
      player: this.player,
      getVideoNode: this.player.registerVideo1
    };

    const wrapperProps = {
      media: this.state.media,
      player: this.player,
      event,
      videoReady,
      userReady,
      isEnded,
      isPaused,
      isFullscreen,
      duration,
      time,
      bufferedTime,
      muted,
      volume,
      playbackRate,
      openCC,
      ccFontSize,
      ccFontColor,
      ccOpacity,
      ccBackgroundColor,
      language,
      currCaption,
      hideWrapperOnMouseLeave,
      allowRangePicker,
      openRange,
      range,
      onRangeChange: this.setRange,
    };
  
    return (
      <div {...containerProps}>
        <div {...playerProps}>
          <Video {...video1Props} />
          <Wrapper {...wrapperProps} />
        </div>
      </div>
    );
  }
}

const numOrStr = PropTypes.oneOfType(PropTypes.string, PropTypes.number);
Player.propTypes = {
  id: PropTypes.string,
  mediaId: PropTypes.string,
  media: PropTypes.object,
  fill: PropTypes.bool,
  width: numOrStr,
  height: numOrStr,
  allowTwoScreen: PropTypes.bool,
  beginAt: PropTypes.number,
  triggerTime: PropTypes.number,
  defaultOpenCC: PropTypes.bool,
  hideWrapperOnMouseLeave: PropTypes.bool,
  // Range picker
  allowRangePicker: PropTypes.bool,
  defaultOpenRangePicker: PropTypes.bool,
  defaultRange: PropTypes.arrayOf(numOrStr),
  range: PropTypes.arrayOf(numOrStr),
  onRangePicked: PropTypes.func,
};

export default Player;