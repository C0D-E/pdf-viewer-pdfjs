document.addEventListener('DOMContentLoaded', () => {
    const loadPdfButton = document.getElementById('loadPdfButton');
    const pdfFileInput = document.getElementById('pdfFile');
    const pdfViewerContainer = document.getElementById('pdfViewerContainer');
    const messageArea = document.getElementById('messageArea');

    // Ensure this version matches the scripts in your index.html
    const PDFJS_VERSION = '3.11.174';
    const WORKER_SRC = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
    
    console.log(`[DEBUG] DOMContentLoaded. PDF.js Library version target: ${PDFJS_VERSION}`);
    console.log(`[DEBUG] Worker SRC: ${WORKER_SRC}`);

    if (typeof pdfjsLib === 'undefined') {
        console.error('[DEBUG] CRITICAL: pdfjsLib is not loaded. Ensure pdf.min.js is included correctly in index.html before this script.');
        showMessage('Error: PDF library core (pdfjsLib) not loaded. Check HTML script tags.', 'error');
        return;
    }
    console.log('[DEBUG] pdfjsLib is defined.');
    pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_SRC;

    if (typeof pdfjsViewer === 'undefined') {
        console.error('[DEBUG] CRITICAL: pdfjsViewer is not loaded. Ensure pdf_viewer.min.js is included correctly in index.html before this script.');
        showMessage('Error: PDF viewer components (pdfjsViewer) not loaded. Check HTML script tags.', 'error');
        return;
    }
    console.log('[DEBUG] pdfjsViewer is defined.');
    
    let pdfViewer = null; // To hold the PDFViewer instance

    loadPdfButton.addEventListener('click', () => {
        console.log('[DEBUG] loadPdfButton clicked.');
        pdfFileInput.click(); // Trigger hidden file input
    });

    pdfFileInput.addEventListener('change', async (event) => {
        console.log('[DEBUG] pdfFileInput change event triggered.');
        clearMessage();
        const file = event.target.files[0];

        if (!file) {
            showMessage('No file selected.', 'error');
            console.log('[DEBUG] No file selected.');
            return;
        }
        console.log('[DEBUG] File selected:', file.name, 'Type:', file.type, 'Size (bytes):', file
