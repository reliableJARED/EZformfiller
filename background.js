chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('sheet2pdf.html', {
    'outerBounds': {
      'width': 600,
      'height': 600
    }
  });
});