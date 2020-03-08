import React from 'react';
import ReactDOM from 'react-dom';
import { AppBar, Button, Box,  Container, IconButton, Toolbar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import {DropzoneArea} from 'material-ui-dropzone'

import { uploadImage } from './api';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

class Home extends React.Component {

  state = {
    files: []
  }

  dropzoneAreaChanged = (files) => {
    this.setState({files: files})
  }

  submit = (e) => {
    const file = this.state.files[0]
    uploadImage(file)
    .then(result => {
      const { before, after, id } = result;
      window.location.href = window.location.href + "result/" + id;
    })
  }

  render() {
    const { classes } = this.props;

    return (
      <Box>
        <AppBar position="static">
          <Toolbar>
            <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Cloud Photo Stylizer
            </Typography>
          </Toolbar>
        </AppBar>
        <Box my={5}>
        <Container maxWidth="sm">
          <Box my={5}>
            Cloud Photo Stylizer is a free application which converts your photos into cool photos!
          </Box>
          <DropzoneArea filesLimit={1} onChange={this.dropzoneAreaChanged}/>
          <Box my={5} width={1}>
            <Button variant="contained" color="primary" fullWidth={true} onClick={this.submit}>
              Upload
            </Button>
          </Box>
        </Container>
        </Box>
      </Box>
    );
  }

}

export default withStyles(useStyles)(Home);
