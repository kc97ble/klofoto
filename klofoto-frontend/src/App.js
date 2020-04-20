import React from "react";
import Home from "./Home";
import Result from "./Result";
import About from "./About";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

class App extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/about" component={About} />
          <Route path="/result/:id" component={Result} />
          <Route path="*">
            <pre>Not Found</pre>
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default App;
