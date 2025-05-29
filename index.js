fileReader.onload = async function() {
                console.log('[DEBUG] FileReader.onload triggered. Result length (bytes):', this.result.byteLength);
                showMessage('Converting file data...', 'loading'); 
                const typedarray = new Uint8Array(this.result);
                console.log('[DEBUG] Uint8Array created. Length (bytes):', typedarray.byteLength);

                try { // New try-catch block specifically for viewer setup and document loading
                    if (!pdfViewer) {
                        console.log('[DEBUG] PDFViewer instance does not exist. Creating new one.');
                        
                        // Explicitly check pdfViewerContainer before using it
                        console.log('[DEBUG] Checking pdfViewerContainer DOM element. Value:', pdfViewerContainer);
                        if (!pdfViewerContainer || !(pdfViewerContainer instanceof HTMLElement)) {
                            console.error('[DEBUG] CRITICAL: pdfViewerContainer element is null, undefined, or not a valid HTMLElement!');
                            if (pdfViewerContainer) {
                                console.error('[DEBUG] Type of pdfViewerContainer:', typeof pdfViewerContainer, 'Instance of HTMLElement:', pdfViewerContainer instanceof HTMLElement);
                            }
                            showMessage('Error: PDF display area (container) is invalid or not found in HTML. Check ID "pdfViewerContainer".', 'error');
                            return; // Stop if container is missing or invalid
                        }
                        console.log('[DEBUG] pdfViewerContainer seems valid.');

                        const eventBus = new pdfjsViewer.EventBus();
                        console.log('[DEBUG] EventBus created.');
                        const linkService = new pdfjsViewer.PDFLinkService({
                            eventBus: eventBus,
                            externalLinkTarget: pdfjsViewer.LinkTarget.BLANK,
                        });
                        console.log('[DEBUG] PDFLinkService created.');
                       
                        pdfViewer = new pdfjsViewer.PDFViewer({
                            container: pdfViewerContainer,
                            eventBus: eventBus,
                            linkService: linkService,
                        });
                        console.log('[DEBUG] PDFViewer instance created.');
                        linkService.setViewer(pdfViewer);
                        console.log('[DEBUG] LinkService viewer set.');
                    } else {
                        console.log('[DEBUG] Reusing existing PDFViewer instance.');
                    }
                    
                    showMessage('Processing PDF with PDF.js...', 'loading');
                    console.log('[DEBUG] Calling pdfjsLib.getDocument(). Worker is set to:', pdfjsLib.GlobalWorkerOptions.workerSrc);
                    
                    const pdfDocument = await pdfjsLib.getDocument({ data: typedarray }).promise;
                    console.log('[DEBUG] pdfjsLib.getDocument() successful. PDF Document loaded. Number of pages:', pdfDocument.numPages);
                    
                    pdfViewer.setDocument(pdfDocument);
                    console.log('[DEBUG] pdfViewer.setDocument(pdfDocument) called.');
                    
                    pdfViewer.firstPagePromise.then(() => {
                        console.log('[DEBUG] pdfViewer.firstPagePromise resolved.');
                        if (pdfViewer.linkService) {
                            pdfViewer.linkService.setDocument(pdfDocument, null);
                            console.log('[DEBUG] pdfViewer.linkService.setDocument() called.');
                        }
                        showMessage('PDF loaded successfully. You can scroll to view all pages.', 'success');
                    }).catch(pageError => {
                        console.error('[DEBUG] Error during pdfViewer.firstPagePromise:', pageError);
                        showMessage(`Error rendering first page: ${pageError.message}`, 'error');
                    });

                } catch (processingError) { // Catches errors from viewer setup or getDocument
                    console.error('[DEBUG] Error during PDF processing or viewer setup:', processingError);
                    showMessage(`Error during PDF setup: ${processingError.message || 'Unknown error'}. Check console.`, 'error');
                }

                pdfFileInput.value = ''; // Clear file input
            };
