export const aiPromptText = `Analyze the provided HTML content and generate a detailed list of suggestions to improve its SEO and accessibility. Ensure that the suggestions are concise, actionable, and categorized as follows:

1. **SEO Improvements**: Include specific recommendations for:
   - Meta tags (e.g., 'title', 'description', 'keywords', 'canonical', etc.).
   - Images (e.g., 'alt' attributes, file names, sizes, and formats).
   - Headings and content structure (e.g., 'h1', 'h2', and 'h3' tags).
   - Links (e.g., anchor text relevance, broken links, and external links).

2. **Accessibility Improvements**: Include specific recommendations for:
   - ARIA roles and attributes.
   - Screen reader compatibility (e.g., language attribute, meaningful alt text).
   - Keyboard navigation and focus management.
   - Color contrast or visual accessibility issues.

3. **Additional Suggestions**: Provide general best practices for improving performance and user experience if applicable.

Format the output as a neatly structured list under each category. For example:

**SEO Improvements**
- Meta tags: Ensure the 'description' tag is under 160 characters and keyword-rich.
- Images: Add descriptive 'alt' text for all images and compress large image files.
- Headings: Ensure only one 'h1' tag is present on the page.

**Accessibility Improvements**
- Add the 'lang' attribute to the '<html>' tag.
- Use descriptive link text instead of "click here" or "read more."
- Improve color contrast on buttons and links.

**Additional Suggestions**
- Minimize DOM depth to enhance performance.
- Remove inline styles and use external CSS for better maintainability.

Here is the HTML content: `;
