import React, { useState } from "react";
import {
  AppBar,
  Button,
  IconButton,
  Toolbar,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core";
import { Box, Paper, Container } from "@material-ui/core";
import { Checkbox, FormControl, FormControlLabel } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import MenuIcon from "@material-ui/icons/Menu";
import { makeStyles } from "@material-ui/core/styles";
import { withStyles } from "@material-ui/styles";
import { DropzoneArea } from "material-ui-dropzone";

import { uploadImage } from "../api";
import {
  STYLE_LIST,
  QUALITY_LIST,
  DEFAULT_STYLE,
  DEFAULT_QUALITY,
} from "../config";

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
  formControl: {
    margin: "2em 0",
  },
}));

const DEFAULT_FORM = {
  style: DEFAULT_STYLE,
  iterations: DEFAULT_QUALITY,
  useEmail: false,
  email: "",
  usePhone: false,
  phone: "",
};

function Options(props) {
  const classes = useStyles();
  const defaultFormHook = useState(DEFAULT_FORM);
  const [form, setForm] = props.formHook || defaultFormHook;
  const setField = (name, value) => setForm({ ...form, [name]: value });
  return (
    <>
      <FormControl className={classes.formControl}>
        <InputLabel id="style-label">Style</InputLabel>
        <Select
          labelId="style-label"
          value={form.style}
          onChange={(event) => setField("style", event.target.value)}
        >
          {STYLE_LIST.map((item) => (
            <MenuItem value={item.value}>{item.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl className={classes.formControl}>
        <InputLabel id="iterations-label">Quality</InputLabel>
        <Select
          labelId="iterations-label"
          value={form.iterations}
          onChange={(event) => setField("iterations", event.target.value)}
        >
          {QUALITY_LIST.map((item) => (
            <MenuItem value={item.value}>{item.label}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl className={classes.formControl}>
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
      </FormControl>
      <FormControl className={classes.formControl}>
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
      </FormControl>
    </>
  );
}

function Dropzone(props) {
  const { setFile } = props;
  const classes = useStyles();

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

function submit(file, options) {
  uploadImage(file, options).then((result) => {
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
          submit(file, {
            email: form.useEmail ? form.email : null,
            phone: form.usePhone ? form.phone : null,
            style: form.style || null,
            iterations: form.iterations || null,
          })
        }
      >
        Upload
      </Button>
    </Box>
  );
}

function UploadForm(props) {
  const classes = useStyles();
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
