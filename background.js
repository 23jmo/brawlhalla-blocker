chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('BRAWLHALLA BLOCKER: Received message:', request);
    
    if (request.action === 'closeTab' && sender.tab) {
        console.log('BRAWLHALLA BLOCKER: Closing tab:', sender.tab.id);
        chrome.tabs.remove(sender.tab.id);
    }
    
    if (request.action === 'clearLogs') {
        console.log('BRAWLHALLA BLOCKER: Clearing blocked videos log');
        chrome.storage.local.set({ blockedVideos: [] }, () => {
            // Notify popup to refresh the display
            chrome.runtime.sendMessage({ action: 'updateBlockedList' });
        });
    }
    
    if (request.action === 'openLogsWindow') {
        chrome.windows.create({
            url: 'index.html',
            type: 'popup',
            width: 500,
            height: 600,
            focused: true
        });
    }
    
    // Forward updateBlockedList messages to the popup if it's open
    if (request.action === 'updateBlockedList') {
        chrome.runtime.sendMessage(request);
    }
}); 