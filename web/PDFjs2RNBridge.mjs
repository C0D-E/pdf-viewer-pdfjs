/**
 * PDF.js to React Native Bridge (MJS Module)
 *
 * This script intercepts the 'download' (save) and 'print' actions in the PDF.js viewer.
 * Instead of performing the default browser actions, it sends the PDF file as a
 * base64 encoded string back to a React Native WebView.
 *
 * How to use:
 * 1. Save this code as a file with an .mjs extension, e.g., `react-native-bridge.mjs`.
 * 2. Place this file in your PDF.js web directory (the same place as viewer.html).
 * 3. In `viewer.html`, add a script tag to include this file as a module, AFTER the `viewer.js` script.
 * <script src="viewer.js"></script>
 * <script type="module" src="react-native-bridge.mjs"></script>
 */

document.addEventListener('webviewerloaded', () => {
  // First, check if the ReactNativeWebView postMessage function is available
  if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
    console.log('React Native WebView environment detected. Overriding PDF.js UI actions.');

    /**
     * Helper function to convert a Uint8Array to a base64 string.
     * @param {Uint8Array} uint8Array The raw byte array of the PDF.
     * @returns {string} The base64 encoded string.
     */
    function uint8ArrayToBase64(uint8Array) {
      let binary = '';
      const len = uint8Array.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8Array[i]);
      }
      return window.btoa(binary);
    }

    // The PDFViewerApplication is the main object for controlling the viewer
    const App = window.PDFViewerApplication;

    // --- Override the Download/Save button functionality ---
    App.download = async function pdfViewDownloadOverridden() {
      console.log('Custom download action triggered.');
      try {
        // The saveDocument() method gets the PDF data with any annotations included.
        // It returns a Promise that resolves with a Uint8Array.
        const data = await App.pdfDocument.saveDocument();

        // Convert the data to base64
        const base64data = uint8ArrayToBase64(data);

        // Get the original filename or create a new one
        const filename = App.url.split('/').pop() || 'document.pdf';

        // Prepare the message for React Native
        const message = {
          action: 'save',
          data: base64data,
          filename: filename,
        };

        // Send the message to your React Native app
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
        console.log('Save message successfully posted to React Native.');

      } catch (error) {
        console.error('Error during custom save/download action:', error);
        // Here you could add a fallback to the original download method if you wish
        // PDFViewerApplication.prototype.download.call(this);
      }
    };

    // --- Override the Print button functionality ---
    App.print = async function pdfViewPrintOverridden() {
      console.log('Custom print action triggered.');
      try {
        // We get the most up-to-date document data, including any user changes.
        const data = await App.pdfDocument.saveDocument();

        // Convert the data to base64
        const base64data = uint8ArrayToBase64(data);

        // Prepare the message for React Native
        const message = {
          action: 'print',
          data: base64data,
        };

        // Send the message to your React Native app
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
        console.log('Print message successfully posted to React Native.');

      } catch (error) {
        console.error('Error during custom print action:', error);
        // Fallback to the original print method in case of an error
        // PDFViewerApplication.prototype.print.call(this);
      }
    };

    console.log('PDF.js print and download actions have been successfully overridden.');

  } else {
    console.warn('React Native WebView environment not detected. PDF.js will use default actions.');
  }
});
