import React, { useState } from "react";
import { AppBar, Button, IconButton, Toolbar } from "@material-ui/core";
import { Box, Paper, Container } from "@material-ui/core";
import { Checkbox, FormControl, FormControlLabel } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import MenuIcon from "@material-ui/icons/Menu";
import { makeStyles } from "@material-ui/core/styles";
import { withStyles } from "@material-ui/styles";
import { DropzoneArea } from "material-ui-dropzone";

import { uploadImage } from "./api";

const useStyles = makeStyles((theme) => ({
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

const DEFAULT_FORM = {
  useEmail: false,
  email: "",
  usePhone: false,
  phone: "",
};

function Options(props) {
  const defaultFormHook = useState(DEFAULT_FORM);
  const [form, setForm] = props.formHook || defaultFormHook;
  const setField = (name, value) => setForm({ ...form, [name]: value });
  return (
    <>
      <FormControlLabel
        control={<Checkbox checked={form.useEmail} />}
        label="Send the resulted photo to my email"
        onChange={(event) => setField("useEmail", event.target.checked)}
      />
      <TextField
        placeholder="Email"
        value={form.email}
        onChange={(event) => setField("email", event.target.value)}
        disabled={!form.useEmail}
      />
      <FormControlLabel
        control={<Checkbox checked={form.usePhone} />}
        label="Send me an SMS when the photo is processed"
        onChange={(event) => setField("usePhone", event.target.checked)}
      />
      <TextField
        placeholder="Phone number"
        value={form.phone}
        onChange={(event) => setField("phone", event.target.value)}
        disabled={!form.usePhone}
      />
    </>
  );
}

const useUploadFormStyles = makeStyles({
  paper: {
    padding: "2em",
    margin: "1em 0",
  },
  dropzone: {
    width: "100%",
  },
  fieldset: {
    width: "100%",
  },
});

function Dropzone(props) {
  const { setFile } = props;
  const classes = useUploadFormStyles();

  return (
    <Box marginBottom="2em">
      <DropzoneArea
        className={classes.dropzone}
        filesLimit={1}
        onChange={(files) => {
          const result = files[0] || null;
          console.log(result);
          setFile(result);
        }}
      />
    </Box>
  );
}

function submit(file, email, phone) {
  uploadImage(file, email, phone).then((result) => {
    const { id } = result;
    window.location.href = window.location.href + "result/" + id;
  });
}

function SubmitButton(props) {
  const { form, file } = props;
  return (
    <Box marginTop="2em" width="100%">
      <Button
        variant="contained"
        color="primary"
        fullWidth={true}
        disabled={!file}
        onClick={() =>
          submit(
            file,
            form.useEmail ? form.email : null,
            form.usePhone ? form.phone : null
          )
        }
      >
        Upload
      </Button>
    </Box>
  );
}

function UploadForm(props) {
  const classes = useUploadFormStyles();
  const defaultFormHook = useState(DEFAULT_FORM);
  const [form, setForm] = props.formHook || defaultFormHook;
  const [file, setFile] = useState(null);
  return (
    <Paper className={classes.paper}>
      <form>
        <FormControl className={classes.fieldset} component="fieldset">
          <Dropzone setFile={setFile} />
          <Options formHook={[form, setForm]} />
          <SubmitButton form={form} file={file} />
        </FormControl>
      </form>
    </Paper>
  );
}

class Home extends React.Component {
  state = {
    files: [],
  };

  dropzoneAreaChanged = (files) => {
    this.setState({ files: files });
  };

  submit = (e) => {
    const file = this.state.files[0];
    uploadImage(file).then((result) => {
      const { /* before, after, */ id } = result;
      window.location.href = window.location.href + "result/" + id;
    });
  };

  render() {
    const { classes } = this.props;

    return (
      <Box>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Cloud Photo Stylizer
            </Typography>
          </Toolbar>
        </AppBar>
        <Box my={5}>
          <Container maxWidth="md">
            <Box my={5}>
              Cloud Photo Stylizer is a free application which converts your
              photos into cool photos!
            </Box>
            <UploadForm />
          </Container>
        </Box>
      </Box>
    );
  }
}

export default withStyles(useStyles)(Home);
