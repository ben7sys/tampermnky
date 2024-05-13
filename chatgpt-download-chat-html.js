// ==UserScript==
// @name         Simple ChatGPT Download
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Add button to download current chat, including branches. Add buttons to embed code snippets in floating frames.
// @author       ben7sys
// @match        https://chatgpt.com/c/*
// @icon         https://chat.openai.com/favicon-32x32.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Funktion zum Hinzufügen des Download-Buttons
    function addDownloadButton() {
        const button = document.createElement('button');
        button.textContent = 'Download Chat';
        button.style.position = 'fixed';
        button.style.top = '20px';
        button.style.right = '20px';
        button.style.zIndex = 1000;
        button.onclick = downloadChat;

        document.body.appendChild(button);
    }

    // Funktion zum Herunterladen des Chats
    function downloadChat() {
        const chatContent = document.querySelector('.chat-content') || document.body; // Selector anpassen
        const blob = new Blob([chatContent.innerHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chat.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Fügt den Button hinzu, wenn die Seite geladen ist
    window.addEventListener('load', addDownloadButton);
})();
