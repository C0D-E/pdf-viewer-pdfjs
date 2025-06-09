/**
 * PDF.js to React Native Bridge (MJS Module) - Improved Version
 *
 * This script intercepts the 'download' (save) and 'print' commands in the PDF.js viewer.
 * Instead of performing the default browser commands, it sends the PDF file as a
 * base64 encoded string back to a React Native WebView.
 *
 * How to use:
 * 1. Save this code as `react-native-bridge.mjs`.
 * 2. Place this file in your PDF.js web directory (same place as viewer.html).
 * 3. In `viewer.html`, add the script tag AFTER the viewer.js script:
 *    <script type="module" src="react-native-bridge.mjs"></script>
 */

(function() {
  'use strict';

  // Helper function to convert Uint8Array to base64
  function uint8ArrayToBase64(uint8Array) {
    const chunks = [];
    const chunkSize = 0x8000; // 32KB chunks to avoid call stack limits
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      chunks.push(String.fromCharCode.apply(null, chunk));
    }
    
    return btoa(chunks.join(''));
  }

  // Helper function to send message to React Native
  function sendToReactNative(message) {
    try {
      if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
        console.log('Message sent to React Native:', message.command);
        return true;
      } else if (window.parent && window.parent.postMessage) {
        // Fallback for testing in browser
        window.parent.postMessage(JSON.stringify(message), '*');
        console.log('Message sent to parent window:', message.command);
        return true;
      }
    } catch (error) {
      console.error('Error sending message to React Native:', error);
    }
    return false;
  }

  // Function to get PDF data as base64
  async function getPDFDataAsBase64() {
    const app = window.PDFViewerApplication;
    
    if (!app || !app.pdfDocument) {
      throw new Error('PDF document not available');
    }

    try {
      // Try to get the modified document data first
      let data;
      
      // Method 1: Try saveDocument() for PDFs with annotations/form changes
      if (app.pdfDocument.saveDocument && typeof app.pdfDocument.saveDocument === 'function') {
        console.log('Using saveDocument() method');
        data = await app.pdfDocument.saveDocument();
      } else if (app.pdfDocument.getData && typeof app.pdfDocument.getData === 'function') {
        // Method 2: Try getData() for original document data
        console.log('Using getData() method');
        data = await app.pdfDocument.getData();
      } else if (app.pdfDocument._transport && app.pdfDocument._transport.data) {
        // Method 3: Fallback to pdfDocument data
        // eslint-disable-next-line no-underscore-dangle
        console.log('Using transport data fallback');
        // eslint-disable-next-line no-underscore-dangle
        data = app.pdfDocument._transport.data;
      } else {
        throw new Error('No method available to extract PDF data');
      }

      if (!data || !(data instanceof Uint8Array)) {
        throw new Error('Invalid PDF data format');
      }

      return uint8ArrayToBase64(data);
    } catch (error) {
      console.error('Error extracting PDF data:', error);
      throw error;
    }
  }

  // Function to get filename
  function getFilename() {
    const app = window.PDFViewerApplication;
    
    // Try to get filename from various sources
    let filename = 'document.pdf';
    
    if (app.url) {
      const urlParts = app.url.split('/');
      const urlFilename = urlParts[urlParts.length - 1];
      if (urlFilename && urlFilename.includes('.pdf')) {
        filename = urlFilename;
      }
    }
    
    if (app.pdfDocumentProperties && app.pdfDocumentProperties.title) {
      filename = app.pdfDocumentProperties.title + '.pdf';
    }
    
    return filename;
  }

  // Override download functionality
  async function overrideDownload() {
    console.log('Custom download command triggered');
    
    try {
      const base64Data = await getPDFDataAsBase64();
      const filename = getFilename();
      
      const message = {
        command: 'save',
        base64: base64Data,
        filename: filename
      };
      
      if (sendToReactNative(message)) {
        return; // Successfully sent to React Native
      }
    } catch (error) {
      console.error('Error during custom download:', error);
    }
    
    // Fallback to original download if React Native communication fails
    console.log('Falling back to original download method');
    if (window.PDFViewerApplication.originalDownload) {
      window.PDFViewerApplication.originalDownload.call(window.PDFViewerApplication);
    }
  }

  // Override print functionality
  async function overridePrint() {
    console.log('Custom print command triggered');
    
    try {
      const base64Data = await getPDFDataAsBase64();
      const filename = getFilename();
      
      const message = {
        command: 'print',
        base64: base64Data,
        filename: filename
      };
      
      if (sendToReactNative(message)) {
        return; // Successfully sent to React Native
      }
    } catch (error) {
      console.error('Error during custom print:', error);
    }
    
    // Fallback to original print if React Native communication fails
    console.log('Falling back to original print method');
    if (window.PDFViewerApplication.originalPrint) {
      window.PDFViewerApplication.originalPrint.call(window.PDFViewerApplication);
    }
  }

  // Function to setup overrides
  function setupOverrides() {
    const app = window.PDFViewerApplication;
    
    if (!app) {
      console.warn('PDFViewerApplication not found');
      return false;
    }

    // Check if React Native WebView is available
    const isReactNative = window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function';
    const hasParent = window.parent && window.parent.postMessage;
    
    if (!isReactNative && !hasParent) {
      console.log('Neither React Native WebView nor parent window detected. Using default PDF.js behavior.');
      return false;
    }

    console.log('Setting up PDF.js method overrides for React Native communication');

    // Store original methods
    if (app.download && typeof app.download === 'function') {
      app.originalDownload = app.download;
      app.download = overrideDownload;
      console.log('Download method overridden');
    }

    if (app.print && typeof app.print === 'function') {
      app.originalPrint = app.print;
      app.print = overridePrint;
      console.log('Print method overridden');
    }

    // Also override toolbar button clicks directly
    setupToolbarOverrides();
    
    return true;
  }

  // Function to setup toolbar button overrides
  function setupToolbarOverrides() {
    // Override download button
    const downloadButton = document.getElementById('download');
    if (downloadButton) {
      downloadButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        overrideDownload();
      }, true); // Use capture phase
      console.log('Download button override set');
    }

    // Override print button
    const printButton = document.getElementById('print');
    if (printButton) {
      printButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        overridePrint();
      }, true); // Use capture phase
      console.log('Print button override set');
    }

    // Also check for secondary toolbar buttons
    const secondaryDownload = document.getElementById('secondaryDownload');
    if (secondaryDownload) {
      secondaryDownload.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        overrideDownload();
      }, true);
    }

    const secondaryPrint = document.getElementById('secondaryPrint');
    if (secondaryPrint) {
      secondaryPrint.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        overridePrint();
      }, true);
    }
  }

  // Multiple initialization strategies
  function initializeBridge() {
    // Strategy 1: Wait for webviewerloaded event
    document.addEventListener('webviewerloaded', () => {
      console.log('webviewerloaded event fired');
      setTimeout(setupOverrides, 100); // Small delay to ensure everything is ready
    });

    // Strategy 2: Wait for DOMContentLoaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded event fired');
        setTimeout(() => {
          if (!setupOverrides()) {
            // Try again after a delay
            setTimeout(setupOverrides, 1000);
          }
        }, 500);
      });
    } else {
      // Document already loaded
      setTimeout(() => {
        if (!setupOverrides()) {
          // Try again after a delay
          setTimeout(setupOverrides, 1000);
        }
      }, 100);
    }

    // Strategy 3: Polling fallback
    let attempts = 0;
    const maxAttempts = 20;
    const pollInterval = setInterval(() => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(pollInterval);
        console.warn('Failed to initialize PDF.js overrides after maximum attempts');
        return;
      }

      if (window.PDFViewerApplication && window.PDFViewerApplication.initialized) {
        clearInterval(pollInterval);
        setupOverrides();
      }
    }, 500);
  }

  // Start initialization
  initializeBridge();

  // Also send ready message to React Native
  window.addEventListener('load', () => {
    setTimeout(() => {
      sendToReactNative({ command: 'ready' });
    }, 1000);
  });

})();
