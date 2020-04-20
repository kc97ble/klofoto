import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Box } from '@material-ui/core';

import { getDownloadUrl } from './api';

class Result extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    }
    setInterval(this.check.bind(this), 10000);
  }

  check() {
    const id = this.props.match.params.id;
    const url = getDownloadUrl("processed", id);
    console.log(this.state.loading);
    fetch(url, {
      method: 'HEAD',
      // mode: 'no-cors'
    })
    .then(response => {
      if (response.status === 200) {
        this.setState({
          loading: false
        })
      }
    })
  }


  render() {
    const id = this.props.match.params.id;
    const url = getDownloadUrl("processed", id);
    if (this.state.loading) {
      return (
        <Box width="100vw" height="100vh" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
          }}
        >
          <CircularProgress />
          <Box mt={5} style={{ fontWeight: 'lighter' }}>
          Loading...
          </Box>
          <Box mt={2} px={4} style={{ fontWeight: 'lighter' }}>
          The process might takes a few minutes if the photo is big.
          </Box>
        </Box>
      )
    } else {
      window.location.href = url;
      return "Redirecing to "+url;
    }
  }
}

export default Result;
