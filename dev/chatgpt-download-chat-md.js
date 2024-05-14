// ==UserScript==
// @name         Chat Download as Markdown - Stylish Button
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Download the complete chat including explicit headers as Markdown
// @author       ben7sys
// @match        https://chatgpt.com/c/*
// @icon         https://chat.openai.com/favicon-32x32.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function addDownloadButton() {
        const button = document.createElement('button');
        button.textContent = 'Download Markdown';
        button.style.cssText = `
            position: fixed;
            top: 100px;
            left: 350px;
            transform: translate(-50%, -50%);
            padding: 8px 16px;
            font-size: 12px;
            color: #fff;
            background-color: #007BFF;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            z-index: 1000;
        `;
        button.addEventListener('click', downloadCompleteChatAsMarkdown);
        document.body.appendChild(button);
    }

function htmlToMarkdown(htmlElement) {
    if (htmlElement.classList.contains('font-semibold') && htmlElement.classList.contains('select-none')) {
        return `\n\n### ${htmlElement.textContent}\n\n`; // Treat headers as markdown headers
    }

    const textContent = htmlElement.textContent.trim();

    if (!textContent) {
        return ''; // Ignore empty elements
    }

    return '\n\n' + textContent
        .replace(/<h([1-6])>(.*?)<\/h\1>/gi, (_, level, content) => `${'#'.repeat(parseInt(level))} ${content}\n\n`) // Headings
        .replace(/<p>(.*?)<\/p>/gi, '$1\n\n') // Paragraphs
        .replace(/<br\s*\/?>/gi, '\n') // Line breaks
        .replace(/<strong>(.*?)<\/strong>/gi, '**$1**') // Bold
        .replace(/<em>(.*?)<\/em>/gi, '*$1*') // Italics
        .replace(/<ul>\s*/gi, '') // Unordered lists
        .replace(/<\/ul>\s*/gi, '') // Unordered lists
        .replace(/<ol>\s*/gi, '') // Ordered lists
        .replace(/<\/ol>\s*/gi, '') // Ordered lists
        .replace(/<li>(.*?)<\/li>/gi, '- $1\n') // List items
        .replace(/<a href="(.*?)">(.*?)<\/a>/gi, '[$2]($1)') // Links
        .replace(/<code.*?>([\s\S]*?)<\/code>/gi, '```$1```') // Code blocks
        .replace(/\s*\n\s*/g, '\n'); // Trim whitespace around newlines
}


    function downloadCompleteChatAsMarkdown() {
        const elements = document.querySelectorAll('div.font-semibold.select-none, div.whitespace-pre,  [data-message-author-role="assistant"], [data-message-author-role="user"]');

        const sortedElements = Array.from(elements).sort((a, b) => {
            // Sort elements by their appearance in the document to maintain chat order
            return a.compareDocumentPosition(b) & 2 ? 1 : -1;
        });

        const markdownContent = sortedElements.map(el => htmlToMarkdown(el)).join('');

        const blob = new Blob([markdownContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'GPTCHAT_${getCurrentDateTime()}.md';
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    window.addEventListener('load', addDownloadButton);
})();
