import React from 'react'
import { Link } from 'react-router-dom'
import { Poster } from '../Poster'
import { Button, Popup } from 'semantic-ui-react'
import { util } from '../../utils'
import './VideoCard.css'

export function VideoCard({ 
  square=false,
  row=false,
  name='Loading...', 
  link=window.location.pathname,  
  ratio=0,
  timeStamp=0,
  description=null,
  posterSize="",
  // buttons
  dismissable=false,
  handleDismiss,
  dismissPrompt
}) {
  const fittedName = util.getFittedName(name, 56)
  if (square) return (
    <div className="video-card-container-square">
      <Link 
        className="video-card" 
        to={link} 
        aria-label={`Watch video ${name}`}
      >
        <Poster progress={ratio} width="220px" />
        <div className="video-info">
          <p className="video-name">{fittedName}</p>
          <p className="description text-muted">{description}</p>
        </div>
      </Link>
    </div>
  )

  if (row) return (
    <div className="video-card-container-row">
      <Link 
        className="video-card" 
        to={link} 
        aria-label={`Watch video ${name}`}
      >
        <Poster progress={ratio} width={posterSize} />
        <div className="media-info">
          <p className="media-name">{name}</p>
          <p className="description text-muted">{description}</p>
        </div>
      </Link>
      {dismissable && <DismissButton handleDismiss={handleDismiss} dismissPrompt={dismissPrompt} />}
    </div>
  )
}

function DismissButton({ handleDismiss, dismissPrompt }) {
  return (
    <Popup 
      content={dismissPrompt}
      position="left center"
      inverted
      openOnTriggerFocus
      closeOnTriggerBlur
      trigger={
        <Button type="dismiss" compact onClick={handleDismiss} aria-label={dismissPrompt}>
          <span tabIndex="-1">
            <i className="material-icons">close</i>
          </span>
        </Button>
      }
    />
  )
}