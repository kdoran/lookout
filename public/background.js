chrome.app.runtime.onLaunched.addListener(function() {
  console.log('do i happen')
  chrome.app.window.create('index.html', {
    'outerBounds': {
      'width': 400,
      'height': 500
    }
  });
});
