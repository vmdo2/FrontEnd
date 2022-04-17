import _ from 'lodash';
import Papa from 'papaparse';
import { api } from 'utils';

const fileDownload = require('js-file-download');

const A_VERY_OLD_DATE_ISO_STR = '2010-04-03T11:11:11.111Z';

export class VideoTimeLogsHandler {
  constructor() {
    this.logs = [];
  }

  init({ offeringId, setParsedData, setTotal, setEditTransCount }) {
    this.offeringId = offeringId;
    this.setParsedData = setParsedData;
    this.setTotal = setTotal;
    this.setEditTransCount = setEditTransCount;
  }

  download() {
    const csvList = this.logs.map((elem) => ({ ...elem, totalVideoTime: elem.count }));
    _.forEach(csvList, (log) => delete log.count);
    const csvStr = Papa.unparse(csvList);
    fileDownload(csvStr, 'video-time.csv');
  }

  downloadEditTransCount(editTransCount) {
    const csvList = editTransCount.map((elem) => ({ email: elem.email, count: elem.count }));
    const csvStr = Papa.unparse(csvList);
    fileDownload(csvStr, 'edit-trans-count.csv');
  }

  async setup() {
    const recentTimeupdates = await this.getRecentTimeUpdateLogs();
    // console.log('recentTimeupdates', recentTimeupdates)
    const editTransLogs = await this.getEditTransLogs();
    if (this.setEditTransCount) {
      this.setEditTransCount(_.reverse(_.sortBy(editTransLogs, 'count')));
    }

    const totalTimeupdates = await this.getTotalTimeUpdateLogs();
    // console.log('totalTimeupdates', totalTimeupdates)
    const logs = this.combineLogs(totalTimeupdates, recentTimeupdates, editTransLogs);
    const playListLogs = await this.getPlayListsByCourseId();
    const allLogs = await this.getAllCourseLogs();

    this.logs = [...logs];
    this.setTotal(logs);
  }

  parseLogs(data) {
    console.log('data', data);
    return _.map(data, (elem) => ({
      email: elem.user ? elem.user.email : 'unknown',
      ..._.reduce(
        elem.medias,
        (total, media) => {
          Object.keys(total).forEach((key) => {
            total[key] += media[key] || 0;
          });
          return total;
        },
        { lastHr: 0, last3days: 0, lastWeek: 0, lastMonth: 0, count: 0, editTransCount: 0 },
      ),
    }));
  }

  parseMedia(media, playListId) {
    var media_array = [];
    for (var i = 0; i < media.length; i++) {
      var el = media[i];
      media_array.push({
        id: el.id,
        playlistId: playListId,
        name: el.name,
      });
    }
    return media_array;
  }
  parsePlaylists(data) {
    console.log('playlist data', data);
    var playlists = [];
    for (var i = 0; i < data.length; i++) {
      var playlist = {
        id: data[i].id,
        name: data[i].name,
        media: this.parseMedia(data[i].medias, data[i].id),
      };
      playlists.push(playlist);
    }
    console.log('Playlists: ', playlists);
    return playlists;
  }
  parseAllLogs(data) {
    var logs = [];
    for (var i = 0; i < data.length; i++) {
      logs.push({
        media: data[i].medias,
        email: data[i].user.email,
        firstName: data[i].user.firstName,
        lastName: data[i].user.lastName,
        id: data[i].id,
      });
    }
    console.log('All Logs:', logs);
    return logs;
  }

  async getRecentTimeUpdateLogs() {
    try {
      const { data } = await api.getCourseLogs('timeupdate', this.offeringId);
      return this.parseLogs(data);
    } catch (error) {
      console.error('Failed to get recent timeupdate logs.');
      return [];
    }
  }

  async getEditTransLogs() {
    try {
      const { data } = await api.getCourseLogs(
        'edittrans',
        this.offeringId,
        A_VERY_OLD_DATE_ISO_STR,
        new Date().toISOString(),
      );

      return this.parseLogs(data);
    } catch (error) {
      console.error('Failed to get recent timeupdate logs.');
      return [];
    }
  }

  async getTotalTimeUpdateLogs() {
    try {
      const { data } = await api.getCourseLogs(
        'timeupdate',
        this.offeringId,
        A_VERY_OLD_DATE_ISO_STR,
        new Date().toISOString(),
      );

      return this.parseLogs(data);
    } catch (error) {
      console.error('Failed to get total timeupdate logs.');
      return [];
    }
  }

  async getPlayListsByCourseId() {
    try {
      const { data } = await api.getPlayListsByCourseId(this.offeringId);

      return this.parsePlaylists(data);
    } catch (error) {
      console.error('Failed to get recent timeupdate logs.');
      return [];
    }
  }
  async getAllCourseLogs() {
    try {
      const { data } = await api.getAllCourseLogs(
        'edittrans',
        this.offeringId,
        A_VERY_OLD_DATE_ISO_STR,
        new Date().toISOString(),
      );

      return this.parseAllLogs(data);
    } catch (error) {
      console.error('Failed to get recent timeupdate logs.');
      return [];
    }
  }

  combineLogs(totalTimeupdates = [], recentTimeupdates = [], editTransLogs = []) {
    const logs = _.cloneDeep(totalTimeupdates);
    _.forEach(logs, (elem) => {
      const recentElem = _.find(recentTimeupdates, { email: elem.email });
      if (recentElem) {
        Object.keys(elem).forEach((key) => {
          if (typeof elem[key] === 'number') {
            elem[key] += recentElem[key];
          }
        });
      }
    });

    _.forEach(editTransLogs, (elem) => {
      const timeElem = _.find(logs, { email: elem.email });
      if (timeElem) {
        timeElem.editTransCount = elem.count;
      } else {
        logs.push({
          email: elem.email,
          lastHr: 0,
          last3days: 0,
          lastWeek: 0,
          lastMonth: 0,
          count: 0,
          editTransCount: elem.count,
        });
      }
    });

    return _.reverse(_.sortBy(logs, 'count'));

    // console.log('totalTimeupdates', logs)
  }
}

export const vtime = new VideoTimeLogsHandler();
