# Quick Page Scan - SEO & Accessibility Analyzer Chrome Extension

**Smarter SEO and accessibility insights without opening your developer tool.**

## Description

The **Quick Page Scan** is a powerful Chrome extension designed to provide actionable insights for improving the SEO and accessibility of web pages. Whether you're a developer, content creator, or SEO specialist, this tool helps you identify issues and offers AI-powered suggestions for optimization.

## Features

### 🚀 **Static Analysis**

- Analyze meta tags, images, links, headings, and other HTML elements.
- Identify missing or improperly configured attributes (e.g., `alt`, `title`, `lang`).
- Receive detailed suggestions for improving on-page SEO and accessibility.

### 🤖 **AI-Powered Suggestions**

- Leverage AI to generate tailored recommendations for enhancing SEO and accessibility.
- Categorized insights:
  - **SEO Improvements**: Optimize tags, images, links, and headings.
  - **Accessibility Enhancements**: Improve ARIA roles, keyboard navigation, and color contrast.
  - **Performance Tips**: General best practices for a better user experience.

### 📊 **Intuitive Interface**

- Clean and user-friendly design with side-by-side analysis and suggestions.
- Easily toggle between **static analysis** and **AI suggestions**.
- Highlight specific issues with detailed context.

### 🖱️ **Seamless Integration**

- Open the extension directly from the Chrome side panel.
- Automatically close the side panel when navigating away.
- Clear suggestions or refresh the analysis with a single click.

### ⚡ **Additional Features**

- Horizontal scrolling for detailed analysis.
- Loading indicators while fetching AI suggestions.
- Customizable configurations for API endpoints and prompts.

---

## How It Works

1. **Install the Extension**:
   - Download the extension from the Chrome Web Store or load it as an unpacked extension during development.

2. **Analyze Any Web Page**:
   - Open the extension from the Chrome side panel.
   - Perform static analysis or fetch AI-powered suggestions.

3. **Optimize Your Content**:
   - Follow categorized insights to improve your SEO and accessibility scores.

---

## Installation (Development Setup)

1. Clone the repository:
   ```bash
   git clone https://github.com/Yigaue/quick-page-scan-chrome.git
   cd quick-page-scan-chrome

2. Load the extension into Chrome:

  Open Chrome and navigate to chrome://extensions/.
  Enable Developer mode (top-right corner).
  Click Load unpacked and select the project folder.

3. Set your API key:

  Open the `config.js` file and add your API key:

  ```javascript
   export const apiKey = "your-api-key-here"
  ```
  
  ;
  Start using the extension!


4. Start using the extension!


## Screenshots

  ![Quick Can Page Score](assets/images/screenshot.png)
  Static Analysis
  A detailed overview of HTML elements and their issues.

  ![Quick Can Page Score](assets/images/screenshot-1.png)
  AI-Powered Suggestions
  Tailored recommendations for SEO and accessibility improvements.

## Future Enhancements

  Advanced performance analysis.
  Integration with popular CMS platforms.
  Exportable PDF reports for analysis results.


## Contributing

  Contributions are welcome! If you have ideas or find bugs, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
