// ==UserScript==
// @name         Chat Download as Markdown - Combined Functionality
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  Download the complete chat including explicit headers as Markdown with improved handling
// @author       ben7sys
// @match        https://chatgpt.com/c/*
// @icon         https://chat.openai.com/favicon-32x32.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function addDownloadButton() {
    const button = document.createElement('button');
    button.innerHTML = '&#x21E9; MD'; // Unicode für das Download-Symbol
    button.style.cssText = `
        position: fixed;
        top: 90%;
        left: 65%;
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

    function getCurrentDateTime() {
        const now = new Date();
        return now.toISOString().replace(/:/g, '-').slice(0, 19);
    }

    function htmlToMarkdown(htmlElement) {
        // Spezielle Behandlung für ausgewählte Klassen
        if (htmlElement.classList.contains('font-semibold') && htmlElement.classList.contains('select-none')) {
            return `\n\n### ${htmlElement.textContent.trim()}\n\n`;
        }

        const nodeName = htmlElement.nodeName.toUpperCase();
        const innerText = htmlElement.innerText || "";

        switch(nodeName) {
            case 'H1': case 'H2': case 'H3': case 'H4': case 'H5': case 'H6':
                return `${'#'.repeat(parseInt(nodeName.charAt(1)))} ${innerText.trim()}\n\n`;
            case 'P':
                return `${innerText.trim()}\n\n`;
            case 'BR':
                return '\n';
            case 'STRONG':
                return `**${innerText.trim()}**`;
            case 'EM':
                return `*${innerText.trim()}*`;
            case 'UL':
                return htmlElement.innerHTML.split('</li>').slice(0, -1).map(item => `- ${item.replace(/<.*?>/g, '').trim()}`).join('\n') + '\n\n';
            case 'OL':
                return htmlElement.innerHTML.split('</li>').slice(0, -1).map((item, index) => `${index + 1}. ${item.replace(/<.*?>/g, '').trim()}`).join('\n') + '\n\n';
            case 'LI':
                return `- ${innerText.trim()}\n`;
            case 'A':
                return `[${innerText.trim()}](${htmlElement.getAttribute('href')})`;
            case 'CODE':
                return `\n${innerText.trim()}\n`;
            default:
                return `${innerText.trim()}\n`;
        }
    }

    function downloadCompleteChatAsMarkdown() {
        const elements = document.querySelectorAll('div, h1, h2, h3, h4, h5, h6, p, br, strong, em, ul, ol, li, a, code');
        const markdownContent = Array.from(elements).map(el => htmlToMarkdown(el)).join('');

        const blob = new Blob([markdownContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GPTCHAT_${getCurrentDateTime()}.md`;
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    window.addEventListener('load', addDownloadButton);
})();
