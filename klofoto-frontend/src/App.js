import React from 'react';
import ReactDOM from 'react-dom';
import { AppBar, Button, Box,  Container, IconButton, Toolbar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import {DropzoneArea} from 'material-ui-dropzone'

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

function App() {
  const classes = useStyles();

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
        <DropzoneArea/>
        <Box my={5}>
          <Button variant="contained" color="primary">
            Upload
          </Button>
        </Box>
      </Container>
      </Box>
    </Box>
  );
}

export default App;
