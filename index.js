document.addEventListener('DOMContentLoaded', () => {
    const loadPdfButton = document.getElementById('loadPdfButton');
    const pdfFileInput = document.getElementById('pdfFile');
    const pdfViewerContainer = document.getElementById('pdfViewerContainer');
    const messageArea = document.getElementById('messageArea');

    // Use worker from version 3.11.174
    const WORKER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'; 
    // ... (the rest of your index.js remains the same as previously provided) ...

    // Ensure pdfjsLib is defined (it should be if pdf.min.js loaded)
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_SRC;
    } else {
        console.error('CRITICAL: pdfjsLib is not loaded. Ensure pdf.min.js (v3.11.174) is included correctly and loads before this script.');
        showMessage('Error: PDF library core not loaded. Check CDN links.', 'error');
        return; 
    }
    
    let pdfViewer = null; 

    loadPdfButton.addEventListener('click', () => {
        pdfFileInput.click(); 
    });

    pdfFileInput.addEventListener('change', async (event) => {
        clearMessage(); 
        const file = event.target.files[0]; 

        if (!file) {
            showMessage('No file selected.', 'error');
            return;
        }
        if (file.type !== 'application/pdf') {
            showMessage('Please select a valid PDF file.', 'error');
            pdfFileInput.value = ''; 
            return;
        }

        showMessage('Loading PDF, please wait...', 'loading');

        try {
            const fileReader = new FileReader();
            fileReader.onload = async function() {
                const typedarray = new Uint8Array(this.result);

                if (!pdfViewer) {
                    const eventBus = new pdfjsViewer.EventBus();
                    const linkService = new pdfjsViewer.PDFLinkService({
                        eventBus: eventBus,
                        externalLinkTarget: pdfjsViewer.LinkTarget.BLANK, 
                    });
                   
                    pdfViewer = new pdfjsViewer.PDFViewer({
                        container: pdfViewerContainer, 
                        eventBus: eventBus,
                        linkService: linkService,
                    });
                    linkService.setViewer(pdfViewer); 
                }
                
                showMessage('Processing PDF...', 'loading');
                const pdfDocument = await pdfjsLib.getDocument({ data: typedarray }).promise;
                
                pdfViewer.setDocument(pdfDocument);
                
                pdfViewer.firstPagePromise.then(() => {
                    if (pdfViewer.linkService) {
                         pdfViewer.linkService.setDocument(pdfDocument, null);
                    }
                    showMessage('PDF loaded successfully. You can scroll to view all pages.', 'success');
                }).catch(pageError => {
                    console.error('Error rendering first page:', pageError);
                    showMessage(`Error rendering PDF: ${pageError.message}`, 'error');
                });
                pdfFileInput.value = ''; 
            };

            fileReader.onerror = function() {
                console.error('Error reading file.');
                showMessage('Error reading the selected file.', 'error');
                pdfViewerContainer.innerHTML = ''; 
                pdfFileInput.value = ''; 
            };
            fileReader.readAsArrayBuffer(file);

        } catch (error) {
            console.error('Error loading PDF:', error);
            showMessage(`Error loading PDF: ${error.message || 'Unknown error'}`, 'error');
            pdfViewerContainer.innerHTML = ''; 
            pdfFileInput.value = ''; 
        }
    });

    function showMessage(text, type = 'info') { 
        messageArea.textContent = text;
        messageArea.className = 'messageArea'; // Clear existing styling classes by resetting
        if (type === 'success') {
            messageArea.classList.add('message-success');
        } else if (type === 'error') {
            messageArea.classList.add('message-error');
        } else if (type === 'loading') {
            messageArea.classList.add('message-loading');
        }
    }

    function clearMessage() {
        messageArea.textContent = '';
        messageArea.className = 'messageArea';
    }
});
