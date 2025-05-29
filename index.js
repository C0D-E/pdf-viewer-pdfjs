// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    // Get references to the HTML elements
    const loadPdfButton = document.getElementById('loadPdfButton');
    const pdfFileInput = document.getElementById('pdfFile');
    const pdfViewerContainer = document.getElementById('pdfViewerContainer');
    const messageArea = document.getElementById('messageArea');

    // Essential: Specify the path to the PDF.js worker script.
    // This worker handles heavy tasks like parsing the PDF, keeping the main thread responsive.
    // Ensure the version matches the pdf.js and pdf_viewer.js libraries.
    const WORKER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js';
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_SRC;
    } else {
        console.error('pdfjsLib is not loaded. Ensure pdf.min.js is included.');
        showMessage('Error: PDF library not loaded.', 'error');
        return; // Stop execution if PDF.js core is not available
    }
    
    let pdfViewer = null; // Variable to store the PDFViewer instance

    // Event listener for the "Load PDF" button
    loadPdfButton.addEventListener('click', () => {
        pdfFileInput.click(); // Programmatically click the hidden file input
    });

    // Event listener for file selection in the hidden input
    pdfFileInput.addEventListener('change', async (event) => {
        clearMessage(); // Clear any previous messages
        const file = event.target.files[0]; // Get the selected file

        // Validate if a file is selected and if it's a PDF
        if (!file) {
            showMessage('No file selected.', 'error');
            return;
        }
        if (file.type !== 'application/pdf') {
            showMessage('Please select a valid PDF file.', 'error');
            // Clear the file input value to allow re-selection of the same file if needed after an error
            pdfFileInput.value = ''; 
            return;
        }

        showMessage('Loading PDF, please wait...', 'loading');

        try {
            // Read the file content as an ArrayBuffer
            const fileReader = new FileReader();
            fileReader.onload = async function() {
                // The `this.result` contains the ArrayBuffer of the file
                const typedarray = new Uint8Array(this.result);

                // Initialize the PDFViewer if it hasn't been already
                // This setup is done once. Subsequent PDFs will reuse this viewer instance.
                if (!pdfViewer) {
                    // EventBus is used for communication within PDF.js components
                    const eventBus = new pdfjsViewer.EventBus();

                    // PDFLinkService handles navigation within PDF documents (e.g., internal links)
                    const linkService = new pdfjsViewer.PDFLinkService({
                        eventBus: eventBus,
                        externalLinkTarget: pdfjsViewer.LinkTarget.BLANK, // Open external links in a new tab
                    });
                   
                    // Create the PDFViewer instance
                    pdfViewer = new pdfjsViewer.PDFViewer({
                        container: pdfViewerContainer, // The div where the PDF will be rendered
                        eventBus: eventBus,
                        linkService: linkService,
                        // Optional configurations:
                        // removePageBorders: true, // Removes borders around pages
                        // textLayerMode: 1, // 0: disable, 1: enable, 2: enable enhance (default is 1)
                        // annotationLayerMode: 2, // 0: disable, 1: enable, 2: enable storage (default is 2)
                        // printResolution: 300, // Resolution for printing
                    });
                    linkService.setViewer(pdfViewer); // Connect the linkService to the viewer
                }
                
                // Load the PDF document from the ArrayBuffer
                // `pdfjsLib.getDocument()` returns a promise that resolves with the PDFDocumentProxy object
                showMessage('Processing PDF...', 'loading');
                const pdfDocument = await pdfjsLib.getDocument({ data: typedarray }).promise;
                
                // Set the loaded PDF document to the viewer
                pdfViewer.setDocument(pdfDocument);
                
                // Ensure the linkService is updated with the new document.
                // It's good practice to do this after the viewer has started processing the document.
                // `firstPagePromise` is a good indicator that the viewer is ready for the document.
                pdfViewer.firstPagePromise.then(() => {
                    if (pdfViewer.linkService) {
                         pdfViewer.linkService.setDocument(pdfDocument, null);
                    }
                    showMessage('PDF loaded successfully. You can scroll to view all pages.', 'success');
                }).catch(pageError => {
                    console.error('Error rendering first page:', pageError);
                    showMessage(`Error rendering PDF: ${pageError.message}`, 'error');
                });

                // Clear the file input value to allow re-selection of the same file if needed
                pdfFileInput.value = ''; 
            };

            fileReader.onerror = function() {
                console.error('Error reading file.');
                showMessage('Error reading the selected file.', 'error');
                pdfViewerContainer.innerHTML = ''; // Clear viewer on error
                pdfFileInput.value = ''; 
            };

            // Start reading the file
            fileReader.readAsArrayBuffer(file);

        } catch (error) {
            console.error('Error loading PDF:', error);
            showMessage(`Error loading PDF: ${error.message || 'Unknown error'}`, 'error');
            pdfViewerContainer.innerHTML = ''; // Clear viewer on error
            pdfFileInput.value = ''; 
        }
    });

    // Helper function to display messages to the user
    function showMessage(text, type = 'info') { // type can be 'info', 'success', 'error', 'loading'
        messageArea.textContent = text;
        messageArea.className = ''; // Clear existing classes
        if (type === 'success') {
            messageArea.classList.add('message-success');
        } else if (type === 'error') {
            messageArea.classList.add('message-error');
        } else if (type === 'loading') {
            messageArea.classList.add('message-loading');
        } else {
            // Default or 'info' styling (can add a class if needed)
        }
    }

    // Helper function to clear messages
    function clearMessage() {
        messageArea.textContent = '';
        messageArea.className = '';
    }
});
