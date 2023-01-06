import React from 'react';
import cx from 'classnames';
import Button from '@material-ui/core/Button';
import { links } from 'utils';
import { useButtonStyles, CTText, CTUploadButton, CTPopoverLabel, CTFragment } from 'layout';
import IconButton from '@material-ui/core/IconButton';

function MediaItemActions({ mediaId, media, isUnavailable, dispatch, aslVideoId }) {
  const btn = useButtonStyles();
  const btnClassName = cx(btn.tealLink, 'media-item-button');

  const handleDelete = () => {
    const confirm = {
      text: 'Are you sure you want to delete this video? (This action cannot be undone)',
      onConfirm: () => dispatch({ type: 'instplaylist/deleteMedias', payload: [mediaId] }),
    };
    dispatch({ type: 'instplaylist/setConfirmation', payload: confirm });
  };

  const handleASLDelete = () => {
  };

  const setEpubErrorText = () => {
    if (!media.transReady && !media.sceneDetectReady)
      return 'epub creation waiting for transcription and scene analysis to complete.';
    if (!media.transReady) return 'epub creation waiting for transcription to complete.';
    if (!media.sceneDetectReady) return 'epub creation waiting for scene analysis to complete.';
  };

  const baseProps = {
    accept : "video/mp4,video/x-m4v,video/*",
  }
  const props = {
    icon : 'sign_language',
    style : btnClassName,
    ...baseProps,
  };

  return (
    <div>
      <div className="media-item-actions">
        <Button
          disabled={isUnavailable}
          className={btnClassName}
          startIcon={<i className="material-icons watch">play_circle_filled</i>}
          href={links.watch(mediaId)}
        >
          Watch
        </Button>
        {false ? (
          <Button
            className={btnClassName}
            startIcon={<i className="material-icons">text_snippet</i>}
            href={links.mspTransSettings(mediaId)}
          >
            Transcription
          </Button>
        ) : null}

        <Button
          disabled={!media.transReady || !media.sceneDetectReady}
          className={btnClassName}
          startIcon={<i className="material-icons">import_contacts</i>}
          href={links.mspEpubSettings(mediaId)}
        >
          I-Note
        </Button>

        <CTUploadButton {...props}
        >
          ASL
        </CTUploadButton>
        <CTPopoverLabel label="Delete ASL video">
              <IconButton 
                onClick={handleASLDelete}
                size="small"
                style={{ color: "red"}}
              >
                <i className="material-icons">close</i>
              </IconButton>
            </CTPopoverLabel>

        <Button
          className={btnClassName}
          startIcon={<i className="material-icons delete">delete</i>}
          onClick={handleDelete}
          style={{ right: "-10px"}}
        >
          delete
        </Button>
      </div>
      <div>
        {!media.transReady || !media.sceneDetectReady ? (
          <CTText muted padding={[0, 0, 5, 10]}>
            {setEpubErrorText()}
          </CTText>
        ) : null}
      </div>
    </div>
  );
}

export default MediaItemActions;
