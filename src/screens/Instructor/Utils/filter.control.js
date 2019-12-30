import _ from 'lodash'
import { api } from 'utils'

export const filterControl = {

  reverse: function(results, setResults) {
    setResults(results.slice().reverse())
  },

  // Function used to get RegExp tests for provided value
  getRegExpTests: function(value='', keys=[], parser=item => item) {
    let tests = []
    // get test functions for each word
    value.split(' ').forEach(word => {
      let reg = new RegExp(_.escapeRegExp(word), 'gi')

      const testFunc = result => {
        let re = false
        _.forEach(keys, key => {
          re = re || reg.test(_.get(parser(result), key))
        })
        return re
      }
      tests.push({ word, testFunc, reg })
    })

    return tests
  },

  getMatchFunction: function(value='', keys=[], parser) {
    let tests = this.getRegExpTests(value, keys, parser)
    // combine the test result
    const isMatch = result => {
      let match = true
      tests.forEach( test => match = match && test.testFunc(result))
      return match
    }

    return isMatch
  },

  filterOfferings: function(value, offerings, setResult) {
    if (!value) return setResult(offerings)
    let isMatch = this.getMatchFunction(value, ['courseNumber', 'term.name', 'sectionName', 'depart.name'])

    let results = _.filter(offerings, isMatch)
    setResult(results)
  },

  filterPlaylists: function(value, playlists, setResult) {
    if (!value) return setResult(playlists)
    let isMatch = this.getMatchFunction(value, ['name'])

    let results = _.filter(playlists, isMatch)
    setResult(results)
  },

  filterMedias: function(value, medias, setResult) {
    if (!value) return setResult(medias)
    let isMatch = this.getMatchFunction(value, ['mediaName'], api.parseMedia)

    let results = _.filter(medias, isMatch)
    setResult(results)
  },
}