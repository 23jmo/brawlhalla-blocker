const keywords = ['brawlhalla', 'mordex', 'nix', 'bcx'];

async function checkAndBlockCurrentVideo() {
    // Only run on video pages
    if (!isVideoPage()) {
        console.log('BRAWLHALLA BLOCKER: Not a video page, skipping check');
        return;
    }

    const { title, description, duration } = getVideoInfo();

    const isBrawlhallaVideo = keywords.some(keyword => 
        title.toLowerCase().includes(keyword.toLowerCase()) || 
        description.toLowerCase().includes(keyword.toLowerCase())
    );

    console.log('Is Brawlhalla video?', isBrawlhallaVideo);

    if (isBrawlhallaVideo) {
        
        console.log('BRAWLHALLA BLOCKER: Blocking video:', title);
        logBlockedVideo(title, 'Brawlhalla content detected in video/description', duration);
        window.location.href = 'https://www.example.com';
        chrome.runtime.sendMessage({ action: 'closeTab' });
    }
}

function logBlockedVideo(title, reason, duration) {
    if (!title) return;
    
    // Check if chrome.storage is available
    if (!chrome?.storage?.local) {
        console.error('BRAWLHALLA BLOCKER: Chrome storage API not available');
        return;
    }
    
    try {
        // Store in chrome storage
        chrome.storage.local.get(['blockedVideos'], function(result) {
            let storedVideos = result.blockedVideos || [];

            storedVideos.push({ 
                title, 
                reason, 
                duration, 
                timestamp: new Date().toISOString() 
            });
            
            // Save the updated list
            chrome.storage.local.set({ blockedVideos: storedVideos }, () => {
                if (chrome.runtime.lastError) {
                    console.error('BRAWLHALLA BLOCKER: Error saving to storage:', chrome.runtime.lastError);
                    return;
                }
                console.log('BRAWLHALLA BLOCKER: Successfully logged blocked video to storage:', title);
                
                // Update the popup if it's open
                chrome.runtime.sendMessage({ 
                    action: 'updateBlockedList',
                    video: { title, reason, timestamp: new Date().toISOString(), duration }
                });
            });
        });
    } catch (error) {
        console.error('BRAWLHALLA BLOCKER: Error in logBlockedVideo:', error);
    }
}

function isVideoPage() {
    console.log('BRAWLHALLA BLOCKER: ' + window.location.pathname);
    return window.location.pathname === '/watch';
}

function getVideoInfo() {
    if (!isVideoPage()) return { title: '', description: '', duration: 0};
    


    const title = document.querySelector('h1.style-scope.ytd-watch-metadata')?.textContent?.trim() || '';
    

    let duration = 0;
    const videoElement = document.querySelector("video");


    if (videoElement) {
        // Get the duration in seconds
        duration = videoElement.duration;
    }

    // Initialize description variable
    let description = '';
    
    // Updated description selector
    const descriptionElement = document.querySelector("#description .content");

    // Check if the element exists
    if (descriptionElement) {
        // Select all <span> elements within the parent
        const spans = descriptionElement.querySelectorAll("span");

        // Combine the text content from all spans
        description = Array.from(spans)
            .map(span => span.textContent.trim()) // Extract and trim text from each <span>
            .join(" "); // Join all texts with a space

        console.log("BRAWLHALLA BLOCKER: Synthesized Description:", description);
    } else {
        console.log("BRAWLHALLA BLOCKER: Description element not found");
    }
    
    console.log('BRAWLHALLA BLOCKER: Got video info:', { title, description, duration });
    
    return { title, description, duration };
}

// Check when the page loads
checkAndBlockCurrentVideo();

// Check when navigation happens (for YouTube's SPA navigation)
const observer = new MutationObserver(() => {
    if (isVideoPage()) {
        checkAndBlockCurrentVideo();
    }
});

observer.observe(document.body, { childList: true, subtree: true });