// Initialize Lucide Icons
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

// Real-time Clock
function updateClock() {
    const clockElement = document.getElementById('clock');
    if (clockElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        clockElement.textContent = timeString;
    }
}

// Lightweight Connectivity Check
async function checkConnectivity() {
    // We try to fetch the local dashboard on the Tailscale FQDN
    // Using 'no-cors' mode so we don't need a CORS header on the target
    const LOCAL_FQDN = 'qiserver-1.cerberus-sirius.ts.net';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    try {
        const response = await fetch(`https://${LOCAL_FQDN}/favicon.ico`, {
            mode: 'no-cors',
            signal: controller.signal
        });
        
        // If we get here, the server is reachable
        updateStatusIndicators('online');
    } catch (error) {
        if (error.name === 'AbortError') {
            updateStatusIndicators('timeout');
        } else {
            updateStatusIndicators('offline');
        }
    } finally {
        clearTimeout(timeoutId);
    }
}

function updateStatusIndicators(state) {
    const badges = document.querySelectorAll('.badge-local');
    const statusText = document.querySelectorAll('.local-status-text');

    const headerIndicator = document.querySelector('.status-indicator');

    if (headerIndicator) {
        if (state === 'online') {
            headerIndicator.style.background = '#22c55e'; // green
            headerIndicator.style.boxShadow = '0 0 12px #22c55e';
        } else if (state === 'timeout') {
            headerIndicator.style.background = '#f59e0b'; // amber
            headerIndicator.style.boxShadow = '0 0 12px #f59e0b';
        } else {
            headerIndicator.style.background = '#ef4444'; // red
            headerIndicator.style.boxShadow = '0 0 12px #ef4444';
        }
    }

    badges.forEach(badge => {
        if (state === 'online') {
            badge.innerHTML = '<i data-lucide="check-circle" class="w-3 h-3"></i> House Connected';
            badge.className = 'badge badge-web';
        } else if (state === 'timeout') {
            badge.innerHTML = '<i data-lucide="clock" class="w-3 h-3"></i> Check Tailscale';
            badge.className = 'badge';
            badge.style.color = '#f59e0b';
            badge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
        } else {
            badge.innerHTML = '<i data-lucide="x-circle" class="w-3 h-3"></i> Server Unreachable';
            badge.className = 'badge';
            badge.style.color = '#ef4444';
            badge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        }
    });
    
    // Refresh icons after innerHTML change
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setInterval(updateClock, 1000);
    updateClock();
    
    // Check connectivity on load and every 30 seconds
    checkConnectivity();
    setInterval(checkConnectivity, 30000);
});
