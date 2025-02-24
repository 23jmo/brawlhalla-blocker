function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

function displayBlockedVideos() {
    const blockedList = document.getElementById('blocked-videos-list');
    
    chrome.storage.local.get(['blockedVideos'], function(result) {
        const videos = result.blockedVideos || [];
        
        if (videos.length === 0) {
            blockedList.innerHTML = '<p>No videos have been blocked yet.</p>';
            return;
        }
        
        // Clear existing content
        blockedList.innerHTML = '';
        
        // Sort videos by timestamp, most recent first
        videos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        let totalSavedTime = 0;

        videos.forEach(video => {
            const videoElement = document.createElement('div');
            videoElement.className = 'blocked-video';
            videoElement.innerHTML = `
                <div class="title">${video.title}</div>
                <div class="reason">Reason: ${video.reason}</div>
                <div class="duration">Duration: ${formatDuration(video.duration || 0)}</div>
                <div class="timestamp">Blocked on: ${new Date(video.timestamp).toLocaleString()}</div>
            `;
            blockedList.appendChild(videoElement);
            totalSavedTime += video.duration || 0;
        });

        document.getElementById('total-saved-time').textContent = `Total time saved: ${formatDuration(totalSavedTime)}`;
    });
}

// Listen for updates from content script and background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateBlockedList') {
        displayBlockedVideos();
    }
});

// Add this function to reset the total time display
function resetTotalTime() {
    document.getElementById('total-saved-time').textContent = 'Total time saved: 0h 0m';
}

// Initial display when popup opens
document.addEventListener('DOMContentLoaded', () => {
    displayBlockedVideos();
    
    const modal = document.getElementById('confirmModal');
    const clearLogsBtn = document.getElementById('clearLogs');
    const confirmBtn = document.getElementById('confirmClear');
    const cancelBtn = document.getElementById('cancelClear');
    
    // Show modal when Clear Logs is clicked
    clearLogsBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });
    
    // Handle confirm button click
    confirmBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'clearLogs' });
        modal.style.display = 'none';
        resetTotalTime();
    });
    
    // Handle cancel button click
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Close modal if clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}); 