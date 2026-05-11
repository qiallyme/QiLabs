// Simple localStorage tracker
const progressChecks = document.querySelectorAll('.progress-check');

function updateProgress() {
    const total = progressChecks.length;
    const completed = document.querySelectorAll('.progress-check:checked').length;
    const percent = Math.round((completed / total) * 100);

    // Save to device
    localStorage.setItem('qially_progress', percent);

    // Update UI bar
    document.getElementById('global-progress-bar').style.width = percent + '%';
    document.getElementById('percent-text').innerText = percent + '%';
}