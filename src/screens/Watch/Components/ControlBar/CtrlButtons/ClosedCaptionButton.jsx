import React, {useEffect} from 'react';

import WatchCtrlButton from '../../WatchCtrlButton';
import { connect } from 'dva'

export function ClosedCaptionButtonWithRedux({ openCC = false, captions = [], dispatch, liveMode, englishTrack}) {
  const handleCCTrigger = () => {
    if (!liveMode) {
      dispatch({ type: 'playerpref/toggleOpenCC' })
    }else {
      dispatch({ type: 'playerpref/toggleOpenCC' })

      if (isOpen && englishTrack != undefined) {
        englishTrack.mode = 'hidden';
      } else {
        englishTrack.mode = "showing";
      }
    }

  };

  useEffect(() => {
    if (englishTrack != undefined) {
      if (isOpen) {
        englishTrack.mode = 'showing';
      } else {
        englishTrack.mode = "hidden";
      }
    }
  }, [englishTrack])

  useEffect(() => {
    if (englishTrack != undefined) {
      if (isOpen) {
        englishTrack.mode = 'showing';
      } else {
        englishTrack.mode = "hidden";
      }
    }

  }, [])

  let disabled = captions.length <= 0;
  if (liveMode) {
    disabled = false;
  }

  let isOpen = openCC && !disabled ;


  return (
    <WatchCtrlButton
      onClick={handleCCTrigger}
      label={disabled ? `No Closed Caption` : `Closed Caption: ${isOpen ? 'ON' : 'OFF'} (c)`}
      id="closed-caption-btn"
      colored={isOpen}
      disabled={disabled}
      ariaTags={{
        'aria-label': `${isOpen ? 'Open' : 'Close'} Closed Caption`,
        // 'aria-keyshortcuts': 'c',
        'aria-controls': 'watch-cc-container',
        'aria-expanded': openCC ? 'false' : 'true',
      }}
    >
      <span aria-hidden="true" className="watch-btn-content" tabIndex="-1">
        <i className="fas fa-closed-captioning" />
      </span>
    </WatchCtrlButton>
  );
}

export const ClosedCaptionButton = connect(({ watch : { captions, liveMode, englishTrack}, playerpref: { openCC }, loading }) => ({
  openCC, captions, liveMode, englishTrack
}))(ClosedCaptionButtonWithRedux)
