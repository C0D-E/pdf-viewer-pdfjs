window.addEventListener('DOMContentLoaded', function() {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js';

  function renderPDF(pdf) {
    const viewer = document.getElementById('pdf-viewer');
    viewer.innerHTML = '';
    function renderPage(pageNum) {
      if (pageNum > pdf.numPages) return;
      pdf.getPage(pageNum).then(function(page) {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        viewer.appendChild(canvas);
        page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport }).promise.then(function() {
          renderPage(pageNum + 1);
        });
      });
    }
    renderPage(1);
  }

  function loadPDFfromArrayBuffer(arrayBuffer) {
    pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise
      .then(renderPDF)
      .catch(err => alert('Error rendering PDF: ' + err.message));
  }

  function loadPDFfromURL(url) {
    pdfjsLib.getDocument(url).promise
      .then(renderPDF)
      .catch(err => alert('Error loading PDF: ' + err.message));
  }

  document.getElementById('file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      loadPDFfromArrayBuffer(ev.target.result);
    };
    reader.readAsArrayBuffer(file);
  });

  document.getElementById('load-url').addEventListener('click', function() {
    const url = document.getElementById('url-input').value.trim();
    if (url) loadPDFfromURL(url);
  });
});
