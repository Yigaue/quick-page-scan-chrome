import { aiPromptText } from "./prompt.js";
import { CONFIG } from '../config.js';

let latestAnalysisResults = [];
const port = chrome.runtime.connect({ name: "sidePanel" });

port.onMessage.addListener((message) => {
  const issueCountElement = document.getElementById("issue-count");
  const pageUrlElement = document.getElementById("page-url");
  
  const issueCount = message.issues ? message.issues.length : 0;
  issueCountElement.textContent = `Total issues found: ${issueCount}`;
  setScore(message.score.toFixed(2))
  const issues = message.issues;
  const issuesContainer = document.getElementById("issues");
  issuesContainer.innerHTML = "";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const pageUrl = tabs[0].url;
      pageUrlElement.textContent = `For ${pageUrl}`;
    } else {
      pageUrlElement.textContent = "Page URL: Not available";
    }
  });

  if (issueCount > 0) {
    issues.forEach((issue, index) => {
      latestAnalysisResults.push(issue)
      //TODO: console.log("ISSUE:", issue)
      let resObj = createPageElement(issue, index)
      issuesContainer.appendChild(resObj.issueItem);
    });
  } else {
    issuesContainer.textContent = "No issues found.";
  }
});


function highlightElement(issueId) {
  //TODO: console.log("ISSUE ID IN HIGLIT: ", issueId)
  const element = document.querySelector(`[data-issue-id="${issueId}"]`);
  if (element) {
    element.style.transition = "background-color 0.3s ease, border 0.3s ease";
    element.style.backgroundColor = "yellow";
    element.style.border = "3px solid red";

    element.scrollIntoView({ behavior: "smooth", block: "center" });

    setTimeout(() => {
      element.style.backgroundColor = "";
      element.style.border = "";
    }, 2000);
  } else {
    // TODO: console.log("CAN'T HIGHLIGHT ELEMENT")
  }
}

async function downloadAsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const logoBase64 = await loadLogoBase64();

  const logoWidth = 15;
  const logoHeight = 15;
  doc.addImage(logoBase64, 'PNG', 170, 10, logoWidth, logoHeight);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Quick Page Scan - SEO and Accessibility Report", 10, 20);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const date = new Date().toLocaleDateString();
  doc.text(`Report generated on: ${date}`, 10, 30);

  doc.setLineWidth(0.2);
  doc.line(10, 35, 200, 35);

  doc.setFontSize(10);
  doc.setLineWidth(0.2);
  doc.line(10, 35, 200, 35);

  doc.setFontSize(10);
  const pageWidth = 200;
  const marginLeft = 15;
  const marginRight = 8;
  const contentWidth = pageWidth - marginLeft - marginRight;
  let yPosition = 45;

  latestAnalysisResults.forEach((issue, index) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}. ${issue.message}`, 10, yPosition);
    yPosition += 10;

    if (issue.el) {
      doc.setFont("courier", "normal");
      const wrappedText = doc.splitTextToSize(issue.el, contentWidth);
      const lineHeight = 7;
      const bgPadding = 4;
      wrappedText.forEach((line) => {
        const rectWidth = contentWidth + bgPadding * 2;
        const rectHeight = lineHeight + bgPadding * 2;
        doc.setFillColor(240, 240, 255);
        doc.rect(marginLeft - bgPadding, yPosition - lineHeight + 2, rectWidth, rectHeight, "F");
        doc.text(line, 15, yPosition);
        yPosition += 7;

        if (yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
      });
    }

    yPosition += 10;
    if (yPosition > 280) {
      doc.addPage();
      yPosition = 20; // Reset y position for new page
    }
  });

  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("End of Report", 10, yPosition + 10);

  doc.save("SEO_Accessibility_Report.pdf");
}


document.addEventListener("DOMContentLoaded", () => {
  const downloadPdfBtn = document.getElementById("downloadPdfBtn");

  if(downloadPdfBtn) {
    downloadPdfBtn.addEventListener("click", async () => {
      try {
        await downloadAsPDF();
      } catch (error) {
        console.error("Error generating PDF:", error);
      }
    });
  }
});

function loadLogoBase64() {
  return fetch(chrome.runtime.getURL('/assets/logo.js'))
    .then(response => response.text())
    .then(text => {
      return text.match(/const logoBase64 = '(.*)';/)[1];
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleMode = document.getElementById("toggleMode");

  if (toggleMode) {
    toggleMode.addEventListener("change", () => {
      if (toggleMode.checked) {
        renderIssues(true);
      } else {
        renderIssues(false);
      }
    });
  }
});

function renderIssues(isDetailMode) {
  const issuesContainer = document.getElementById("issues");
  issuesContainer.innerHTML = "";

  if (latestAnalysisResults.length > 0) {
    latestAnalysisResults.forEach((issue, index) => {
      let resObj = createPageElement(issue, index)

      if (isDetailMode && issue.el) {
        const elementDiv = document.createElement("pre");
        elementDiv.textContent = issue.el ? issue.el : "No element available";
        elementDiv.style.fontFamily = "monospace";
        elementDiv.style.backgroundColor = "#eef";
        elementDiv.style.padding = "10px";
        elementDiv.style.borderRadius = "5px";
        elementDiv.style.whiteSpace = "pre-wrap";
        resObj.issueItem.appendChild(elementDiv)
      }

      issuesContainer.appendChild(resObj.issueItem);
    });
  } else {
    issuesContainer.textContent = "No issues found.";
  }
}

function createPageElement(issue, index) {
  const issueItem = document.createElement("div");
  issueItem.classList.add("issue-item");
  issueItem.style.marginBottom = "20px";
  issueItem.style.padding = "10px";
  issueItem.style.border = "1px solid #ddd";
  issueItem.style.borderRadius = "5px";
  issueItem.style.backgroundColor = "#f9f9f9";

  const issueText = document.createElement("div");
  issueText.textContent = `${index + 1}. ${issue.message}`;
  issueText.style.fontWeight = "bold";
  issueText.style.color = "#333";
  issueText.style.marginBottom = "10px";
  issueItem.appendChild(issueText);

  if (issue.id) {
    //TODO: console.log("ISSUE ID RECEIVED: ", issue.id)
    const link = document.createElement("a");
    link.href = "#";
    link.innerText = "View";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: highlightElement,
          args: [issue.id],
        });
      });
    });
    issueItem.appendChild(link);
  } 
  return {
    issueItem,
    issueText
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const aiButton = document.getElementById("ai-suggestions-btn");

  aiButton.addEventListener("click", async (event) => {
    event.preventDefault();

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs.length === 0) {
        console.error("No active tab found.");
        return;
      }

      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: getPageContent,
          args: [],
        });

        const pageContent = results[0]?.result;
        if (!pageContent) {
          console.error("Failed to retrieve page content.");
          return;
        }
        await handleGetAISuggestions(pageContent);
      } catch (error) {
        console.error("Error executing script or fetching suggestions:", error);
      }
    });
  });

  const aiResetButton = document.getElementById("reset-ai-btn");
  const aiSuggestionsList = document.getElementById("ai-suggestions-list");
  const aiSuggestionsContainer = document.getElementById("aiSuggestionsContainer");
  const toggleAISuggestionsButton = document.getElementById("ai-suggestions-btn");

  aiResetButton.addEventListener("click", (event) => {
    event.preventDefault();
    aiSuggestionsList.innerHTML = "";
    toggleAISuggestionsButton.textContent = "AI Suggestions";
    chrome.storage.local.remove("aiSuggestions", () => {
      console.log("Stored AI suggestions cleared.");
    });
  });

  toggleAISuggestionsButton.addEventListener("click", () => {
    const isHidden = aiSuggestionsContainer.classList.contains("hidden");

    if (isHidden) {
      aiSuggestionsContainer.classList.remove("hidden");
      toggleAISuggestionsButton.textContent = "Hide AI";
    } else {
      aiSuggestionsContainer.classList.add("hidden");
      toggleAISuggestionsButton.textContent = "AI Suggestions";
    }
  });
});

async function fetchAISuggestions(htmlContent) {
  try {
    const apiKey = await getApiKey();
    const response = await fetch(`${CONFIG.apiURL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "contents": [
          {
            "parts": [
              {
                "text": `${aiPromptText}${htmlContent}`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`AI API responded with status ${response.status}`);
    }
    const data = await response.json();
    const suggestions = data.candidates.map((candidate) => {
      const text = candidate.content?.parts?.[0]?.text || "No content available";
      const citations = candidate.citationMetadata?.citationSources || [];
    
      return { text, citations };
    });

    chrome.storage.local.set({ aiSuggestions: suggestions }, () => {
      console.log("AI suggestions stored in local storage.");
    });

    return suggestions
  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
    return [];
  }
}

function displayAISuggestions(suggestions) {
  const suggestionsList = document.getElementById("ai-suggestions-list");
  suggestionsList.innerHTML = "";

  if (suggestions.length === 0) {
    suggestionsList.innerHTML = "<li>No suggestions available.</li>";
    return;
  }

  suggestions.forEach((suggestion) => {
    const { text, citations } = suggestion;
    const sections = text.split("**").filter((section) => section.trim());
    sections.forEach((section) => {
      const [header, ...contentLines] = section.split("\n").filter((line) => line.trim());
      const sectionContainer = document.createElement("div");
      sectionContainer.classList.add("suggestion-section");

      const headerElement = document.createElement("h2");
      headerElement.textContent = header.trim();
      sectionContainer.appendChild(headerElement);

      const contentList = document.createElement("ul");
      contentLines
      .filter((line) => line.trim().replace(/^-$/, "").trim().length > 0)
      .forEach((line) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = line.trim().replace(/^\*/, "").trim();
        contentList.appendChild(listItem);
      });

      sectionContainer.appendChild(contentList);
      suggestionsList.appendChild(sectionContainer);
    });
  });
}

async function getPageContent() {
  const htmlContent = document.documentElement.outerHTML;
  let content = htmlContent.length > 50000 ? htmlContent.slice(0, 50000) : htmlContent;
  return content
}

function getApiKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("aiApiKey", (result) => {
      if (chrome.runtime.lastError || !result.aiApiKey) {
        reject("API key not found or failed to retrieve.");
      } else {
        resolve(result.aiApiKey);
      }
    });
  });
}

async function getStoredSuggestions() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("aiSuggestions", (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error retrieving stored suggestions:", chrome.runtime.lastError);
        reject("Failed to retrieve stored suggestions.");
      } else {
        resolve(result.aiSuggestions || null);
      }
    });
  });
}

async function handleGetAISuggestions(htmlContent) {
  const aiLoader = document.getElementById("aiLoader");
  const storedSuggestions = await getStoredSuggestions();

   try {
    aiLoader.classList.remove("hide");
    if (storedSuggestions) {
      console.log("Retrieved stored suggestions:", storedSuggestions);
      displayAISuggestions(storedSuggestions);
      return;
    }

    console.log("No stored suggestions found. Fetching new suggestions...");
    const newSuggestions = await fetchAISuggestions(htmlContent);
    displayAISuggestions(newSuggestions);
  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
  } finally {
    aiLoader.classList.add("hide");
  }
}

