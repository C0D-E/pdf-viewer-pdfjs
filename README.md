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
- Works offline with local assets
- Runs inside WebView on both Android and iOS

---

## 🚀 How to Use

1. Add PDF.js `dist` files (including `web/viewer.html`) to your project assets.
2. Load `viewer.html` in a WebView:
   - Example:
     ```
     file:///android_asset/pdfjs/web/viewer.html?file=yourfile.pdf
     ```

---

## 📱 Platform Notes

- **Android**: Enable JavaScript and file access in `WebView`.
- **iOS**: Use `WKWebView` and load from local bundle path.

---

## 📁 Example Structure
/assets/pdfjs/
├── build/
├── web/
└── index.html

---

## 📝 License

Uses [PDF.js](https://github.com/mozilla/pdf.js) (MPL 2.0)


