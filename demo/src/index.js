import React from "react";
import { render } from "react-dom";

import Zoom from "../../src";

const Loader = () => (
  <div style={{ position: "absolute", top: 0, left: 0 }}>
    Loading...
  </div>
);

class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      zoomedIn: false
    };
  }

  render() {
    return (
      <div>
        <h1>react-image-zoom </h1>
        <Zoom>
          <img
            style={{ width: "100px", height: "auto" }}
            src="http://bmcmahen.github.io/image-zoom/inst6.jpg"
          />
        </Zoom>
      </div>
    );
  }

  onZoomToggle = zoomed => {
    console.log("on toggle zoom", zoomed);
    this.setState({ zoomedIn: zoomed });
  };
}

render(<Demo />, document.querySelector("#demo"));
