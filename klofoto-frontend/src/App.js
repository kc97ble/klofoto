import React from 'react';
import ReactDOM from 'react-dom';
import { AppBar, Button, Box,  Container, IconButton, Toolbar } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/styles';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import {DropzoneArea} from 'material-ui-dropzone'
// import AWS from 'aws-sdk';
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

// const albumBucketName = "kc97ble-test";
// const bucketRegion = "ap-southeast-1";
// const IdentityPoolId = "ap-southeast-1:0583531a-bf2a-4f41-addf-fb33bfef63d2";
// //
// AWS.config.update({
//   region: bucketRegion,
//   credentials: new AWS.CognitoIdentityCredentials({
//     IdentityPoolId: IdentityPoolId
//   })
// });
//
// const s3 = new AWS.S3({
//   apiVersion: "2006-03-01",
//   params: { Bucket: albumBucketName }
// });

class App extends React.Component {

  state = {
    files: []
  }

  dropzoneAreaChanged = (files) => {
    this.setState({files: files})
  }

  submit = (e) => {
    const file = this.state.files[0]
    uploadImage(file)

    // console.log(e);
    //
    // const photoKey = "test/" + "123.png"
    // const file = this.state.files[0]
    //
    // const params = {
    //     Bucket: "kc97ble-test",
    //     Key: 'test.txt', // File name you want to save as in S3
    //     Body: "123"
    // };
    //
    // s3.upload(params, function(err, data) {
    //     if (err) {
    //         throw err;
    //     }
    //     console.log(`File uploaded successfully. ${data.Location}`);
    // });

    //
    // s3.putObject({ Key: "album" }, function(err, data) {
    //   if (err) {
    //     return alert("There was an error creating your album: " + err.message);
    //   }
    //   alert("Successfully created album.");
    //
    //   const upload = new AWS.S3.ManagedUpload({
    //     params: {
    //       Bucket: albumBucketName,
    //       Key: photoKey,
    //       Body: file,
    //       ACL: "public-read"
    //     }
    //   });
    //
    //   const promise = upload.promise();
    //
    //   promise.then(
    //     function(data) {
    //       alert("Successfully uploaded photo.");
    //     },
    //     function(err) {
    //       return alert("There was an error uploading your photo: ", err.message);
    //     }
    //   );
    // });
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
          <DropzoneArea filesLimit={2} onChange={this.dropzoneAreaChanged}/>
          <Box my={5}>
            <Button variant="contained" color="primary" onClick={this.submit}>
              Upload
            </Button>
          </Box>
        </Container>
        </Box>
      </Box>
    );
  }

}

export default withStyles(useStyles)(App);
