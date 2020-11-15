import React from 'react';
import { CTFragment } from 'layout';
import { epub, connectWithRedux } from '../../controllers';
import { MDPreviewer, ChapterImage } from '../../components';

function EPubPreview(props) {
  const epubData = props.epub;
  const epubMD = epub.data.data.toMD();

  return (
    <CTFragment padding={[20]} shadowed>
      <CTFragment padding={[10,10,100,10]} dFlexCol alignItCenter>
        <ChapterImage
          image={epubData.cover}
          disableDescription
          disableImagePicker
        />

        <h1 className="text-center">{epubData.title}</h1>
        <p>{epubData.author}</p>
      </CTFragment>

      <MDPreviewer value={epubMD} />
    </CTFragment>
  )
}

export default connectWithRedux(
  EPubPreview,
  ['epub']
);
