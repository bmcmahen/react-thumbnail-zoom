import React from "react";
import classnames from "classnames";
import viewport from "viewport-size";
import Portal from "react-portal";

class ImageZoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      showClone: false,
      zoomedIn: false
    };
  }

  static propTypes = {
    zoomedIn: React.PropTypes.bool,
    onZoomToggle: React.PropTypes.func,
    zoomedInURL: React.PropTypes.string,
    padding: React.PropTypes.number,
    duration: React.PropTypes.number,
    loader: React.PropTypes.node,
    overlay: React.PropTypes.bool,
    closeButton: React.PropTypes.bool
  };

  static defaultProps = {
    padding: 0,
    duration: 300,
    loader: null,
    overlay: true,
    closeButton: false
  };

  getZoomedInState = (props, state) => {
    return props.onZoomToggle ? props.zoomedIn : state.zoomedIn;
  };

  setZoomedInState = zoomedIn => {
    this.props.onZoomToggle
      ? this.props.onZoomToggle(zoomedIn)
      : this.setState({ zoomedIn });
  };

  componentWillUpdate(nextProps, nextState) {
    const isZoomingIn = this.getZoomedInState(nextProps, nextState);
    const isZoomedIn = this.getZoomedInState(this.props, this.state);

    // Bind event listeners if zooming in
    if (isZoomingIn && !isZoomedIn) {
      this.bindDocumentListeners();

      // Unbind event listeners if zooming out
    } else if (!isZoomingIn && isZoomedIn) {
      this.unbindDocumentListeners();
    }
  }

  bindDocumentListeners() {
    document.addEventListener("click", this.hide);
  }

  unbindDocumentListeners() {
    document.removeEventListener("click", this.hide);
  }

  hide = () => {
    this.zoomOut();
    this.hideTimer = setTimeout(
      () => {
        this.setState({ showClone: false });
      },
      this.props.duration
    );
  };

  render() {
    const child = React.Children.only(this.props.children);
    const original = React.cloneElement(child, {
      ref: image => this.thumb = image,
      onClick: this.onClickThumbnail,
      className: classnames(
        child.className,
        this.state.loading && "image-zoom-loading"
      ),
      style: {
        ...child.props.style,
        opacity: this.state.showClone ? 0 : 1,
        cursor: "zoom-in"
      }
    });

    const zoomedIn = this.getZoomedInState(this.props, this.state);
    const { loading } = this.state;

    const clonedDimensions = !loading ? this.getClonedDimensions() : {};

    const clone = React.cloneElement(child, {
      style: {
        position: "fixed",
        cursor: "zoom-out",
        transition: `all ${this.props.duration}ms ease`,
        ...clonedDimensions
      }
    });

    return (
      <span style={{ position: "relative" }}>
        <Portal isOpened={this.state.showClone}>
          <div>
            {this.props.overlay &&
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(255,255,255,0.95)",
                  opacity: zoomedIn ? 1 : 0,
                  transition: `opacity ${this.props.duration}ms ease`
                }}
              >
                {this.props.closeButton &&
                  <button
                    onClick={this.hide}
                    style={{
                      padding: 0,
                      position: "fixed",
                      top: "15px",
                      right: "15px",
                      cursor: "pointer",
                      background: "transparent",
                      border: 0,
                      webkitAppearance: "none"
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        fontSize: "20px",
                        fontWeight: 300,
                        color: "black",
                        fontFamily: "sans-serif"
                      }}
                    >
                      x
                    </span>
                  </button>}
              </div>}

            {clone}
          </div>
        </Portal>
        {loading && this.props.loader}
        {original}
      </span>
    );
  }

  onClickThumbnail = e => {
    e.preventDefault();
    this.zoomIn();
  };

  loadImage = (src, fn) => {
    if (this.image) {
      return fn(this.image);
    }
    this.setState({ loading: true, error: false });
    const img = (this.image = new Image());
    img.onload = () => {
      this.setState({ loading: false, error: false });
      return fn(this.image);
    };
    img.onerror = err => {
      console.log("Error loading full-size image: ", err);
      this.setState({ error: true });
    };
    img.src = src;
  };

  zoomIn = () => {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
    const child = React.Children.only(this.props.children);
    const fullSizeURL = this.props.zoomedInURL || child.props.src;
    if (!fullSizeURL) {
      throw new Error("No full size image URL provided.");
    }
    this.loadImage(fullSizeURL, img => {
      this.setState({ showClone: true }, () => {
        this.setZoomedInState(true);
      });
    });
  };

  getClonedDimensions = () => {
    if (!this.image) return {};
    const o = this.determineOriginDimensions();
    const t = this.determineTargetDimensions(this.image);
    const zoomedIn = this.getZoomedInState(this.props, this.state);
    const { showClone } = this.state;

    const clonedPosition = {
      left: t.x + "px",
      top: t.y + "px",
      width: t.w + "px",
      height: t.h + "px"
    };

    // replica state
    if (!this.state.showClone || !zoomedIn) {
      const scale = o.w / t.w;
      const translateX = o.x + o.w / 2 - (t.x + t.w / 2);
      const translateY = o.y + o.h / 2 - (t.y + t.h / 2);
      return {
        ...clonedPosition,
        transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`
      };
    }

    // final zoomed in state
    return {
      ...clonedPosition,
      transform: `translateX(0) translateY(0) scale(1)`
    };
  };

  zoomOut = () => {
    this.setZoomedInState(false);
  };

  determineOriginDimensions = () => {
    const pos = this.thumb.getBoundingClientRect();
    const origin = {
      x: pos.left,
      y: pos.top,
      w: this.thumb.clientWidth,
      h: this.thumb.clientHeight
    };
    return origin;
  };

  determineTargetDimensions = image => {
    const iw = image.width;
    const ih = image.height;
    const vph = viewport.getHeight();
    const vpw = viewport.getWidth();

    // zoomed image max size
    const target = scaleToBounds(
      iw,
      ih,
      vpw - this.props.padding,
      vph - this.props.padding
    );

    // determine left and top position of zoomed image
    const left = vpw / 2 - target.width / 2;
    const top = vph / 2 - target.height / 2;

    return {
      x: left,
      y: top,
      w: target.width,
      h: target.height
    };
  };
}

export default ImageZoom;

/**
 * Return the maximum size given a set of bounds
 * while maintaining the original aspect ratio.
 * @param  {Number} ow original width
 * @param  {Number} oh original height
 * @param  {Number} mw max width
 * @param  {Number} mh max height
 * @return {Object}
 */

function scaleToBounds(ow, oh, mw, mh) {
  let scale = Math.min(mw / ow, mh / oh);
  if (scale > 1) scale = 1;
  return {
    width: ow * scale,
    height: oh * scale
  };
}
