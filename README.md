# 📄 PDF WebView Viewer (Android & iOS)

A lightweight solution for displaying and interacting with PDFs in Android and iOS apps using **PDF.js** inside a **WebView**.

Supports:
- Text fields
- Checkboxes
- Radio buttons
- Other interactive form elements

---

## 📦 Features

- Renders PDFs using [PDF.js](https://github.com/mozilla/pdf.js)
- Fully interactive forms
- Works online only (for now) with local assets
- Runs inside WebView on both Android and iOS

---

## 🚀 How to Use

1. Using a WebView, point to https://c0d-e.github.io/pdf-viewer-pdfjs/web/viewer.html:
   - Example:
     ```
     <WebView
          ref={webviewRef}
          originWhitelist={['*']}
          source={{ uri: 'https://c0d-e.github.io/pdf-viewer-pdfjs/' }}
          javaScriptEnabled
          startInLoadingState
          injectedJavaScript={injectedJS}
          renderError={() => <Text>Error loading PDF</Text>}
          allowFileAccess
          allowFileAccessFromFileURLs
          allowUniversalAccessFromFileURLs
        />
     ```
2. Use the interface provided by [PDF.js](https://github.com/mozilla/pdf.js) to navigate and interact with the PDF file.

---

## 📱 Platform Notes

- **Android**: Enable JavaScript and file access in `WebView`.
- **iOS**: Use `WKWebView` and load from local bundle path.
  
  ### Dependencies used and extra code added:
  - For Android in AndroidManifest.xml file:
    ```
      <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28"/>
      <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    ```
   - Dependency used for WebView:
     ```
     yarn add react-native-webview
     ```

---

## 📁 Example Structure
```text
/assets/pdfjs/
├── build/
├── web/
└── index.html
```

---

## 📝 License

Uses [PDF.js](https://github.com/mozilla/pdf.js) (MPL 2.0)


