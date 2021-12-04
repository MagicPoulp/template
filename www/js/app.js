
const { createElement, Component } = React;
const e = createElement;

class ImageFetcherComponent extends Component{

  // a local URL does not need a service worker but an external one does
  imagesApiPath = "/images/";
  testImage1 = null;
  isImageLoaded = false;

  render() {
    return [
      e('button', {
        className: 'test-button',
        id: 'test-button',
        key: 'f1',
        onClick: () => { this.clickTestButton(); }
      }, 'Get image'),
      e('img', {
       className: this.isImageLoaded ? 'test-image1' : 'hidden',
       id: 'test-image1',
       key: 'f2',
       ref: (node) => { this.testImage1 = node; } ,
       alt: 'exists'
     }, null),
    ];
  };

  clickTestButton() {
      if (this.isImageLoaded) {
        return;
      }
      fetch(this.imagesApiPath + 'wemap-logo.png')
      .then(response => {
        if (response.status !== 200) {
          throw new Error('image not found, response.status = ' + response.status)
        }
        return response.blob()
      })
      .then((blob) => {
        var image = this.testImage1;
        this.blobToBase64(blob)
          .then((dataUrl) => {
            console.log(dataUrl)
          image.src = dataUrl;
          this.isImageLoaded = true;
          this.setState({
            isImageLoaded: true
          });
        });
      })
      .catch(function(error) {
        console.error(error);
      });
  }

  // https://stackoverflow.com/questions/18650168/convert-blob-to-base64
  blobToBase64(blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
}

class ReactApp extends Component{
  render() {
    return e('div', { className: 'top-container'},
      e(ImageFetcherComponent, {}, null)
    );
  };
}

ReactDOM.render(
  e(ReactApp),
  document.getElementById('react-app'),
);

// https://developers.google.com/web/ilt/pwa/introduction-to-service-worker
function setUpServiceWorker() {
  if ('serviceWorker' in navigator) {
    // for the scope to be above /js, the service worker cannot lie inside /js
    navigator.serviceWorker.register('/service-worker.js', {
      // no scope to cache more files
      // scope: '/images/'
    })
      .then(function(registration) {
        console.log('Registration successful, scope is:', registration.scope);
      })
      .catch(function(error) {
        console.log('Service worker registration failed, error:', error);
      });
  }
}

setUpServiceWorker();
