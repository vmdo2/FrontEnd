import React from 'react'
import { WatchHeader, WatchContent } from './Components'
import './index.css'
import { api } from 'utils'

export class Watch extends React.Component {
  constructor(props) {
    super(props)
    this.id = this.props.match.params.id
    this.courseNumber = this.props.match.params.courseNumber
    this.state = { 
      showPlaylist: false,
      media: api.parseMedia(),
      playlist: {},
    }
  }

  /**
   * GET media and playlist based on mediaId
   */
  componentDidMount() {
    api.getMediaById(this.id)
      .then( ({data}) => {
        console.log('media', data)
        this.setState({ media: api.parseMedia(data) })
        api.getPlaylistById(data.playlistId)
          .then(({data}) => {
            console.log('playlist', data)
            this.setState({ playlist: data })
            api.contentLoaded()
          })
      })
  }

  playlistTrigger = ()  => {
    this.setState({showPlaylist: !this.state.showPlaylist})
  }  

  render() { 
    const { media, playlist } = this.state
    const { courseNumber } = this
    return (
      <main className="watch-bg">
        <WatchHeader 
          media={media} 
          playlist={playlist} 
          courseNumber={courseNumber} 
        />
        <WatchContent 
          media={media} 
          playlist={playlist} 
          courseNumber={courseNumber} 
        />
      </main>
    )
  }
}
