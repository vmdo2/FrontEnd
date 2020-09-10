import _ from 'lodash';
import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { CTModal, CTUploadButton, CTFormHelp, CTCheckbox, CTFragment } from 'layout';
import { useCheckbox } from 'hooks';
import { links } from 'utils';
import { mediaControl } from '../../controllers';
import UploadTable from './UploadTable';
import UploadActions from './UploadActions';
import './index.scss';

export function UploadFiles() {
  const history = useHistory();
  const { id } = useParams();

  const [videos, setVideos] = useState([]);
  const [uploadIndex, setUploadingIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [failedVideos, setFailedVideos] = useState([]);
  const canUploadTwoVideo = useCheckbox(false);

  const uploading = uploadIndex >= 0;

  const handleAddVideo = (files) => {
    if (canUploadTwoVideo.checked) {
      let [video1, video2] = files;
      setVideos([ ...videos, { video1, video2 }]);
    } else {
      setVideos([ ...videos, ..._.map(files, (vfile) => ({ video1: vfile }))]);
    }
  };
  
  const handleClose = () => {
    if (!uploading) {
      history.push(links.playlist(id));
    } else {
      // refresh the page to cancel the upload process
      window.location = links.playlist(id)
    }
  };

  const onUploadProgress = (progressEvent) => {
    const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 100);
    setProgress(percentCompleted);
  };

  const handleUpload = async () => {
    let successedVideos = await mediaControl.handleUpload(
      id,
      videos,
      setUploadingIndex,
      setProgress,
      onUploadProgress,
      setFailedVideos
    );

    if (successedVideos.length === videos.length) {
      // go back once finished
      history.push(links.playlist(id));
    } else {
      setVideos(videos.filter((vi, index) => !successedVideos.includes(index)));
      setUploadingIndex(-1);
      setProgress(0);
      setFailedVideos([]);
    }
  };

  const actionProps = {
    noFileUploaded: videos.length === 0,
    uploading,
    handleClose,
    handleUpload
  };

  const modalProps = {
    open: true,
    responsive: true,
    size: 'md',
    title: 'Upload Videos',
    action: <UploadActions {...actionProps} />,
    onClose: handleClose
  };

  const tableProps = {
    progress,
    uploadIndex,
    videos,
    failedVideos,
    can2Video: canUploadTwoVideo.checked,
    setVideos
  };

  return (
    <CTModal {...modalProps}>
      <CTFormHelp title="upload instruction">
        <b>You can either upload one video or a pair of videos for each media. </b> <br />
        The pair of videos will be presented to viewers with synchronized playbacks.
      </CTFormHelp>
      <CTFragment margin={[-15,0,0,10]}>
        <CTCheckbox 
          label="Upload 2 videos for each media"
          checked={canUploadTwoVideo.checked}
          onChange={canUploadTwoVideo.onChange}
        />
      </CTFragment>
      {
        canUploadTwoVideo.checked 
        &&
        <CTFormHelp fadeIn>
          Choose 2 video files at a time when browse files.
        </CTFormHelp>
      }

      <CTUploadButton 
        fluid 
        accept="video/mp4,video/x-m4v,video/*" 
        onFileChange={handleAddVideo}
      >
        Browse videos
      </CTUploadButton>

      <UploadTable {...tableProps} />
    </CTModal>
  );
}
