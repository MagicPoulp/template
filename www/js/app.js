
const { createElement, Component } = React;
const e = createElement;

// we call a function in kotlin that will show an error page
function displayError(message) {
  console.error(message);
  try {
    interface.callfromJS(message);
  }
  catch (e) {
    launchReactApp();
  }
}

class ImageFetcherComponent extends Component{

  // a local URL does not need a service worker but an external one does
  imagesApiPath = "/images/";
  testImage1 = null;
  isImageLoaded = false;

  render() {
    return [
      e('button', {
        className: 'test-error-button',
        id: 'test-error-button',
        key: 'f1',
        onClick: () => { displayError('The button could trigger an error.'); }
      }, 'Test error page'),
      e('button', {
        className: 'test-button',
        id: 'test-button',
        key: 'f2',
        onClick: () => { this.clickTestButton(); }
      }, 'Get image'),
      e('img', {
       className: this.isImageLoaded ? 'test-image1' : 'hidden',
       id: 'test-image1',
       key: 'f3',
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
          displayError('image not found, response.status = ' + response.status);
          return;
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

function launchReactApp() {
  ReactDOM.render(
    e(ReactApp),
    document.getElementById('react-app'),
  );
}

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
        displayError('Service worker registration failed, error:');
      });
  }
}

setUpServiceWorker();

var workerReady = false;
navigator.serviceWorker.ready.then(function(registration) {
  workerReady = true;
  console.log('A service worker is active:', registration.active);
  launchReactApp();
});
setTimeout(
  function() {
    if (!workerReady) {
      displayError('Error, serviceWorker.ready did not happen after 2s');
    }
  }, 2000);
