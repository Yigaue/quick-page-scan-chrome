import { CONFIG } from '../config.js';

let latestAnalysisResults = [];
let uniqID = null;
let latestScore = 100;

chrome.runtime.onInstalled.addListener(() => {
  const apiKey = CONFIG.apiKey
  
  chrome.storage.local.set({ aiApiKey: apiKey }, () => {
    console.log("API key stored securely during installation.");
  });

  chrome.contextMenus.create({
    id: "analyzePageYigaue",
    title: "Quick Page Scan",
    type: 'normal',
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyzePageYigaue') {
    performanceAnalysis(tab)
  }
});

function performanceAnalysis(tab) {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: analyzePageContent,
  });

  chrome.sidePanel.open({ windowId: tab.windowId });
}

chrome.action.onClicked.addListener((tab) => {
  performanceAnalysis(tab)
});

// When the side panel opens, provide the latest results
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "sidePanel") {
    port.postMessage({ 
      issues: latestAnalysisResults, 
      score: latestScore
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analysisComplete") {
    latestAnalysisResults = request.issues || [];
    latestScore = request.score !== undefined ? request.score : 0;
  }

  if (request.action === "getPageContent") {
    const htmlContent = document.documentElement.outerHTML;
    sendResponse(htmlContent);
  }
});

function analyzePageContent() {
  const issues = [];
  let totalChecks = 0; 

  function generateUniqueId() {
    return 'issue-' + Math.random().toString(36).substr(2, 9);
  }

  function logIssueWithLocation(message, id, el) {
    const error = new Error();
    const stackLine = error.stack.split("\n")[2];
    const lineNumber = stackLine.match(/:(\d+):\d+\)$/);
    const location = lineNumber ? ` (Line ${lineNumber[1]})` : "";
    //TODO: console.log("ISSUE ID SENT: ", { message, id, el: el?.outerHTML});

    issues.push({
      message: `${message}${location}`,
      id: id,
      el: el ? el.outerHTML : null,
    });
  }

  const title = document.querySelector("title");
  totalChecks++;
  if (!title) {
    logIssueWithLocation("Missing <title> tag.", null, "");
  } else if (title.innerText.length > 60) {
    logIssueWithLocation("The <title> tag is too long (over 60 characters).", null, title);
  }

  const metaDescription = document.querySelector("meta[name='description']");
  totalChecks++;
  const mdId = generateUniqueId();
  if (!metaDescription) {
    metaDescription.setAttribute("data-issue-id", mdId);
    logIssueWithLocation("Missing <meta> description.", null, metaDescription);
  } else if (metaDescription.content.length > 160) {
    logIssueWithLocation("The <meta> description is too long (over 160 characters).", null, metaDescription);
  }

  const images = document.querySelectorAll("img");
  totalChecks += images.length;
  images.forEach((img, index) => {
    uniqID = generateUniqueId();
    if (img && !img.alt) {
      img.setAttribute("data-issue-id", uniqID);
      //TODO: console.log("IMAGE && ID: ", { outerHTML: img.outerHTML }, uniqID);
      logIssueWithLocation(`Image ${index + 1} is missing an alt attribute.`, uniqID, img);
    }
  });

  const h1Tags = document.querySelectorAll("h1");
  totalChecks += h1Tags.length;
  if (h1Tags.length === 0) {
    logIssueWithLocation("Missing <h1> tag.");
  } else if (h1Tags.length > 1) {
    h1Tags.forEach((h1tag) => {
      let h1Id = generateUniqueId();
      if (h1tag) {
        h1tag.setAttribute("data-issue-id", h1Id);
      }
    });
    logIssueWithLocation("Multiple <h1> tags found; only one <h1> tag is recommended.", null, h1Tags);
  }

  const htmlTag = document.querySelector("html");
  totalChecks++;
  if (!htmlTag || !htmlTag.hasAttribute("lang")) {
    logIssueWithLocation("Missing lang attribute on <html> tag.");
  }

  const links = document.querySelectorAll("a");
  totalChecks += links.length;
  links.forEach((link, index) => {
    const linkText = link.textContent.trim().toLowerCase();
    uniqID = generateUniqueId();
    if (["click here", "more", "read more", "here"].includes(linkText)) {
      link.setAttribute("data-issue-id", uniqID);
      logIssueWithLocation(`Link ${index + 1} uses non-descriptive text ("${linkText}").`, uniqID, link);
    }
  });

  links.forEach((link, index) => {
    uniqID = generateUniqueId();
    if (link.textContent.trim() === "") {
      link.setAttribute("data-issue-id", uniqID);
      logIssueWithLocation(`Link ${index + 1} is empty and should contain descriptive text.`, uniqID, link);
    }
  });

  const paragraphs = document.querySelectorAll("p");
  totalChecks += paragraphs.length;
  paragraphs.forEach((p, index) => {
    if (p.textContent.length > 1000) {
      uniqID = generateUniqueId();
      p.setAttribute("data-issue-id", uniqID);
      logIssueWithLocation(`Paragraph ${index + 1} is too long (over 1000 characters), which may reduce readability.`, uniqID, p);
    }
  });

  const elementsWithStyle = document.querySelectorAll("[style]");
  totalChecks += elementsWithStyle.length;
  elementsWithStyle.forEach((el, index) => {
    uniqID = generateUniqueId();
    el.setAttribute("data-issue-id", uniqID);
    logIssueWithLocation(`Element ${index + 1} has inline styles, which may impact SEO and accessibility.`, uniqID, el);
  });

  const headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  totalChecks += headers.length;
  let lastHeaderLevel = 1;
  headers.forEach((header) => {
    const currentLevel = parseInt(header.tagName.toLowerCase().substring(1));
    if (currentLevel - lastHeaderLevel > 1) {
      logIssueWithLocation(`Improper heading structure: found <${header.tagName}> after <h${lastHeaderLevel}>.`, null, header);
    }
    lastHeaderLevel = currentLevel;
  });

  const landmarks = document.querySelectorAll("header, nav, main, footer");
  totalChecks += landmarks.length;
  landmarks.forEach((landmark) => {
    uniqID = generateUniqueId();
    if (!landmark.hasAttribute("role")) {
      landmark.setAttribute("data-issue-id", uniqID);
      logIssueWithLocation(`Landmark element <${landmark.tagName.toLowerCase()}> is missing an ARIA role.`, uniqID, landmark);
    }
  });

  const italicBoldTags = document.querySelectorAll("i, b");
  totalChecks += italicBoldTags.length;
  italicBoldTags.forEach((tag, index) => {
    if (!tag.hasAttribute("aria-label") && !tag.hasAttribute("role")) {
      logIssueWithLocation(`<${tag.tagName.toLowerCase()}> tag ${index + 1} missing role or aria-label.`, null, tag);
    }
  });

  function getMaxDOMDepth(node) {
    if (!node.children || node.children.length === 0) return 1;
    let maxDepth = 0;
    for (let child of node.children) {
      maxDepth = Math.max(maxDepth, getMaxDOMDepth(child));
    }
    return maxDepth + 1;
  }
  const maxDOMDepth = getMaxDOMDepth(document.body);
  totalChecks++
  if (maxDOMDepth > 10) {
    logIssueWithLocation(`Excessive DOM depth: ${maxDOMDepth} levels deep. Consider simplifying the DOM structure.`);
  }

  const score = ((totalChecks - issues.length) / totalChecks) * 100;
  latestAnalysisResults = issues;
  chrome.runtime.sendMessage({ action: "analysisComplete", issues: latestAnalysisResults, score });
}