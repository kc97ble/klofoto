import React from 'react';
import ReactDOM from 'react-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Redirect } from "react-router-dom";

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
    const url = getDownloadUrl("before", id);
    console.log(this.state.loading);
    fetch(url, {
      method: 'HEAD',
      // mode: 'no-cors'
    })
    .then(response => {
      if (response.status == 200) {
        this.setState({
          loading: false
        })
      }
    })
  }


  render() {
    const id = this.props.match.params.id;
    const url = getDownloadUrl("before", id);
    if (this.state.loading) {
      return (
        <CircularProgress />
      )
    } else {
      return (
        <Redirect to={url} />
      )
    }
  }
}

export default Result;
