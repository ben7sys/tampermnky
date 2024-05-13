// ==UserScript==
// @name         Chat Download as Markdown - Combined Conversion Logic
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  Download the complete chat including explicit headers as Markdown with comprehensive HTML handling
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
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 8px 16px;
            font-size: 12px;
            color: #fff;
            background-color: #007BFF;  // Consistent color usage
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
        if (htmlElement.nodeType === Node.TEXT_NODE) {
            return htmlElement.data.trim() ? `${htmlElement.data.trim()}\n` : '';
        }
        if (htmlElement.nodeType !== Node.ELEMENT_NODE) {
            return '';
        }

        const nodeName = htmlElement.nodeName.toUpperCase();
        let innerHTML = htmlElement.innerHTML || "";
        let innerText = htmlElement.innerText || "";

        // First, process using switch for direct nodeName handling
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
            case 'OL':
                // Handle lists more accurately
                return convertListToMarkdown(innerHTML);
            case 'LI':
                return `- ${innerText.trim()}\n`;
            case 'A':
                return `[${innerText.trim()}](${htmlElement.getAttribute('href')})`;
            case 'CODE':
                return `\`\`\`\n${innerText.trim()}\n\`\`\``;
            default:
                // Apply regex replacements for any missed conversions
                return convertHTMLtoMarkdown(innerHTML);
        }
    }

    function convertListToMarkdown(html) {
        return html.replace(/<li>(.*?)<\/li>/gi, (_, item) => `- ${item.trim()}\n`);
    }

    function convertHTMLtoMarkdown(html) {
        return html
            .replace(/<h([1-6])>(.*?)<\/h\1>/gi, (_, level, content) => `${'#'.repeat(parseInt(level))} ${content.trim()}\n\n`)
            .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
            .replace(/<em>(.*?)<\/em>/gi, '*$1*')
            .replace(/<ul>(.*?)<\/ul>/gi, '$1')
            .replace(/<ol>(.*?)<\/ol>/gi, '$1')
            .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
            .replace(/<a href="(.*?)">(.*?)<\/a>/gi, '[$2]($1)')
            .replace(/<code>([\s\S]*?)<\/code>/gi, '```$1```')
            .replace(/\s*\n\s*/g, '\n');
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
