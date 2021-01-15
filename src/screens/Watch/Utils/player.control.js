/**
 * Functions for controlling video players
 */
import { isMobile } from 'react-device-detect';
import { api, user, links, uurl } from 'utils';
import { setup } from './setup.control';
import { transControl } from './trans.control';
import { preferControl } from './preference.control';
import { uEvent } from './UserEventController';
import {
  NORMAL_MODE,
  PS_MODE,
  NESTED_MODE /** THEATRE_MODE, */,
  CTP_PLAYING,
  CTP_LOADING,
  CTP_ENDED,
  CTP_UP_NEXT,
  CTP_ERROR,
  HIDE_TRANS,
} from './constants.util';

export const videoControl = {
  videoNode1: null,
  videoNode2: null,
  duration: 0,
  isFullscreen: false,
  timeRestored: false,

  // setVolume, setPause, setPlaybackrate, setTime, setMute, setTrans,
  // switchScreen, setMode, setCTPPriEvent, setCTPSecEvent,
  // changeVideo, timeUpdate
  externalFunctions: {},

  init(videoNode1, videoNode2, props) {
    this.videoNode1 = videoNode1;
    this.videoNode2 = videoNode2;
    this.dispatch = props.dispatch;
    this.addEventListenerForFullscreenChange();
    this.addEventListenerForMouseMove();

    // initialize default settings
    this.playbackrate(preferControl.defaultPlaybackRate());
    this.volume(preferControl.defaultVolume());
    this.mute(preferControl.muted());

    if (this.videoNode2) {
      this.SCREEN_MODE = PS_MODE;
    }
  },

  clear() {
    this.timeRestored = false;
    this.isSwitched = false;
    this.isFullscreen = false;
    this.SCREEN_MODE = NORMAL_MODE;

    this.video1CanPlay = false;
    this.video2CanPlay = false;
    this.canPlayDone = false;

    this.lastTime = 0;
    this.lastUpdateCaptionTime = 0;
    this.lastSendUATime = 0;
    this.lastBuffered = 0;
    this.ctpPriEvent = CTP_LOADING;
    this.ctpSecEvent = CTP_LOADING;
  },

  handleRestoreTime(media) {
    const search = uurl.useSearch();
    const begin = search.begin || media.watchHistory.timestamp;
    if (Boolean(begin) && !this.timeRestored) {
      this.currTime(Number(begin));
      this.timeRestored = true;
      window.history.replaceState(null, null, links.watch(media.id));
    }
  },

  isTwoScreen() {
    return Boolean(this.videoNode2);
  },

  isSwitched: false,
  switchVideo(bool) {
    if (!this.videoNode2) return;
    const toSet = bool === undefined ? !this.isSwitched : bool;
    const { switchScreen } = this.externalFunctions;
    if (switchScreen) switchScreen(toSet);
    this.isSwitched = toSet;
  },

  SCREEN_MODE: NORMAL_MODE,
  LAST_SCREEN_MODE: NORMAL_MODE,
  mode(mode, config = {}) {
    const { setMode } = this.externalFunctions;
    const { sendUserAction = true, restore = false } = config;
    if (setMode) {
      if (window.innerWidth <= 900 && mode === PS_MODE) {
        mode = NESTED_MODE;
      } else if (restore) {
        mode = this.LAST_SCREEN_MODE;
      }
      // if (mode === THEATRE_MODE) {
      //   transControl.transView(HIDE_TRANS)
      // }
      setMode(mode);
      this.LAST_SCREEN_MODE = this.SCREEN_MODE;
      this.SCREEN_MODE = mode;
      if (sendUserAction) uEvent.screenmodechange(this.currTime(), mode);
    }
  },
  addWindowEventListener() {
    const that = this;
    if (isMobile) {
      window.addEventListener('orientationchange', () => {
        // console.log('window.orientation', window.orientation)
        if ([90, -90].includes(window.orientation)) {
          if (that.currTime() > 0) {
            that.enterFullScreen();
          }
        }
      });
    } else {
      window.addEventListener('resize', () => {
        if (window.innerWidth < 900) {
          if (that.SCREEN_MODE === PS_MODE) {
            that.mode(NESTED_MODE, { sendUserAction: false });
          }
        }
      });
    }
  },

  PAUSED: true,
  paused() {
    if (!this.videoNode1) return;
    return this.videoNode1.paused;
  },
  seekToPercentage(p = 0) {
    console.log('SEEK TO PRECENTAGE')
    if (typeof p !== 'number' || p > 1 || p < 0) return;
    const seekTo = this.duration * p;
    this.currTime(seekTo);
  },
  playbackRateIncrement() {
    if (!this.videoNode1) return;
    const currPlaybackRate = this.videoNode1.playbackRate;
    if (currPlaybackRate + 0.25 <= 4) this.playbackrate(currPlaybackRate + 0.25);
  },
  playbackRateDecrease() {
    if (!this.videoNode1) return;
    const currPlaybackRate = this.videoNode1.playbackRate;
    if (currPlaybackRate - 0.25 >= 0.25) this.playbackrate(currPlaybackRate - 0.25);
  },

  /** Fullscreen */
  addEventListenerForFullscreenChange() {
    const { setFullscreen } = this.externalFunctions;
    if (setFullscreen && !isMobile) {
      document.removeEventListener('fullscreenchange', this.onFullScreenChange, true);
      document.addEventListener('fullscreenchange', this.onFullScreenChange, true);
    }
  },

  handleFullScreen() {
    if (!this.isFullscreen || isMobile) {
      this.enterFullScreen();
    } else {
      this.exitFullScreen();
    }
  },

  enterFullScreen() {
    if (!this.videoNode1) return;
    try {
      let elem = document.getElementById('watch-page') || {};
      if (isMobile) {
        elem = document.getElementById(this.isSwitched ? 'ct-video-2' : 'ct-video-1') || {};
      }
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.webkitEnterFullscreen) {
        /* Safari IOS Mobile */
        elem.webkitEnterFullscreen();
      } else if (elem.msRequestFullscreen) {
        /* IE/Edge */
        elem.msRequestFullscreen();
      }
      uEvent.fullscreenchange(this.currTime(), true);
    } catch (error) {
      console.error('Failed to enter fullscreen.');
    }
  },

  exitFullScreen() {
    try {
      if (isMobile) {
        const elem = document.getElementById(this.isSwitched ? 'ct-video-2' : 'ct-video-1') || {};
        // console.log(elem.webkitExitFullscreen)
      }
      if (!this.videoNode1) return;
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        /* IE/Edge */
        document.msExitFullscreen();
      }
      uEvent.fullscreenchange(this.currTime(), false);
    } catch (error) {
      console.error('Failed to exit fullscreen.');
    }
  },

  onDurationChange({ target: { duration } }) {
    const { setDuration } = this.externalFunctions;
    setDuration(duration);
    this.duration = duration;
  },

  lastBuffered: 0,

  /**
   * Helpers
   * ***********************************************************************************************
   */

  findUpNextMedia({ currMediaId = '', playlist }) {
    const { next } = setup.findNeighbors(currMediaId, playlist);
    return next;
  },

  async sendMediaHistories() {
    const { id } = setup.media();
    if (id && user.isLoggedIn) {
      await api.sendMediaWatchHistories(
        id,
        this.currTime(),
        (this.currTime() / this.duration) * 100,
      );
    }
  },

  timeOut: null,
  addEventListenerForMouseMove() {
    // let video = this
    // window.addEventListener('mousemove', function() {
    //   clearTimeout(this.timeOut);
    //   // only start the timer if the video is not paused
    //   if ( !video.paused() ) {
    //       $("#watch-ctrl-bar").show();
    //       this.timeOut = setTimeout(function () {
    //       $("#watch-ctrl-bar").fadeOut();
    //       }, 2500);
    //   }
    // })
  },
  showControlBar() {
    // $("#watch-ctrl-bar").show();
    // clearTimeout(this.timeOut);
  },

  onFullScreenChange(e) {
    const { setFullscreen } = videoControl.externalFunctions;
    if (videoControl.isFullscreen) {
      setFullscreen(false);
      transControl.transView(transControl.LAST_TRANS_VIEW, { updatePrefer: false });
      videoControl.isFullscreen = false;
      // videoControl.mode(videoControl.LAST_SCREEN_MODE)
    } else {
      setFullscreen(true);
      transControl.transView(HIDE_TRANS, { updatePrefer: false });
      videoControl.isFullscreen = true;
      // videoControl.mode(NORMAL_MODE)
    }
  },
};
