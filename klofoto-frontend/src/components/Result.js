import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Box } from "@material-ui/core";

import { getDownloadUrl } from "../api";

class Result extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true };
    this.timerID = setInterval(this.check.bind(this), 10000);
  }

  check() {
    const id = this.props.match.params.id;
    const url = getDownloadUrl("processed", id);
    fetch(url, {
      method: "HEAD",
    }).then((response) => {
      if (response.status === 200) {
        this.setState({ loading: false });
        window.location.href = url;
        clearInterval(this.timerID);
      }
    });
  }

  render() {
    const id = this.props.match.params.id;
    const url = getDownloadUrl("processed", id);
    if (this.state.loading) {
      return (
        <Box
          width="100vw"
          height="100vh"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <CircularProgress />
          <Box mt={5} style={{ fontWeight: "lighter" }}>
            Loading...
          </Box>
          <Box mt={2} px={4} style={{ fontWeight: "lighter" }}>
            The process might takes a few minutes if the photo is big.
          </Box>
        </Box>
      );
    } else {
      return "Redirecing to " + url;
    }
  }
}

export default Result;
