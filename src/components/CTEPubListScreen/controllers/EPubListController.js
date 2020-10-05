import SourceTypes from 'entities/SourceTypes';
import { api, prompt, NOT_FOUND_404 } from 'utils';
import { EPubData } from 'entities/EPubs/structs';
import { LanguageConstants } from '../../CTPlayer';
import { _parseRawEPubData } from './helpers';

class EPubListController {
  async setupEPubsData(sourceType, sourceId, source) {
    if (!source) {
      source = await this.getSource(sourceType, sourceId);
    }

    const languages = this.getLanguages(sourceType, source);
    const ePubs = await this.getEPubs(sourceType, sourceId);
    const rawEPubData = this.getRawEPubData(sourceType, sourceId, LanguageConstants.English);

    return { source, ePubs, languages, rawEPubData };
  }

  async createEPub(sourceType, sourceId, data) {
    const rawEPubData = await this.getRawEPubData(sourceType, sourceId, data.language);
    if (rawEPubData === NOT_FOUND_404) {
      prompt.error('Failed to create the ePub.');
      return false;
    }

    const ePubData = EPubData.create(rawEPubData, {
      sourceType, sourceId, ...data
    }).toObject();

    delete ePubData.id;
    ePubData.chapters = { data: ePubData.chapters };

    // console.log(ePubData);
    try {
      const resp = await api.createEPub(ePubData);
      // console.log(resp);
    } catch (error) {
      console.error(error);
      prompt.error('Failed to create the ePub.');
      return false;
    }
    return true;
  }

  async getRawEPubData(sourceType, sourceId, language) {
    let rawEPubData = null;
    if (sourceType === SourceTypes.Media) {
      rawEPubData = await this.getMediaRawEPubData(sourceId, language);
    }

    return rawEPubData;
  }

  async getMediaRawEPubData(mediaId, language) {
    try {
      let { data } = await api.getEpubData(mediaId, language);
      return _parseRawEPubData(data);
    } catch (error) {
      console.error(error, `Failed to get ePub data of media for ${mediaId}, ${language}`);
      return NOT_FOUND_404;
    }
  }

  getLanguages(sourceType, source) {
    if (sourceType === SourceTypes.Media) {
      if (!source || !source.transcriptions) {
        return [];
      }
      return source.transcriptions.map(trans => trans.language);
    }
  }

  async getSource(sourceType, sourceId) {
    let source = null
    if (sourceType === SourceTypes.Media) {
      source = await this.getMedia(sourceId);
    }

    return source;
  }

  async getMedia(mediaId) {
    try {
      const { data } = await api.getMediaById(mediaId);
      return api.parseMedia(data);
    } catch (error) {
      return NOT_FOUND_404;
    }
  }

  async getEPubs(sourceType, sourceId) {
    try {
      const { data } = await api.getEPubsBySource(sourceType, sourceId);
      return data;
    } catch (error) {
      return NOT_FOUND_404;
    }
  }

  async requestEPub(sourceType, sourceId) {
    if (sourceType === SourceTypes.Media) {
      await this.requestMediaEPub(sourceId)
    }

    prompt.addOne({
      text: 'Request sent.',
      status: 'success',
      timeout: 3000
    });
  }

  async requestMediaEPub(mediaId) {
    try {
      await api.requestEPubCreation(mediaId);
    } catch (error) {
      console.error(`Failed to request a epub for ${mediaId}`);
    }
  }
}

export default new EPubListController();