function startPDFViewer() {
  const pdfjsLib = window.pdfjsLib;
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js';

  const fileInput = document.getElementById('fileInput');
  const canvas = document.getElementById('pdf-canvas');
  const ctx = canvas.getContext('2d');

  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      let base64 = ev.target.result;
      if (base64.startsWith('data:application/pdf;base64,')) {
        base64 = base64.replace(/^data:application\\/pdf;base64,/, '');
      } else if (base64.startsWith('data:text/plain;base64,')) {
        base64 = base64.replace(/^data:text\\/plain;base64,/, '');
      } else {
        base64 = base64.split(',')[1] || base64;
      }
      const raw = atob(base64);
      const uint8Array = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) {
        uint8Array[i] = raw.charCodeAt(i);
      }
      renderPDF(uint8Array);
    };
    reader.readAsDataURL(file);
  });

  async function renderPDF(uint8Array) {
    try {
      const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
    } catch (e) {
      alert('Failed to render PDF: ' + e);
      console.error(e);
    }
  }
}

if (window.pdfjsLib) {
  startPDFViewer();
} else {
  const interval = setInterval(() => {
    if (window.pdfjsLib) {
      clearInterval(interval);
      startPDFViewer();
    }
  }, 50);
}
