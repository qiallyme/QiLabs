document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('.progress-check');

    // Load existing progress from localStorage
    const savedProgress = JSON.parse(localStorage.getItem('qially_checked_items')) || [];

    checkboxes.forEach(box => {
        if (savedProgress.includes(box.id)) {
            box.checked = true;
        }

        box.addEventListener('change', () => {
            const currentChecked = JSON.parse(localStorage.getItem('qially_checked_items')) || [];
            if (box.checked) {
                currentChecked.push(box.id);
            } else {
                const index = currentChecked.indexOf(box.id);
                currentChecked.splice(index, 1);
            }
            localStorage.setItem('qially_checked_items', JSON.stringify(currentChecked));
            calculatePercentage();
        });
    });

    calculatePercentage();
});

function calculatePercentage() {
    const totalItems = 10; // Update this to match your total number of facts/kits
    const checkedItems = JSON.parse(localStorage.getItem('qially_checked_items')) || [];
    const percent = Math.round((checkedItems.length / totalItems) * 100);

    const bar = document.getElementById('global-progress-bar');
    const text = document.getElementById('percent-text');

    if (bar) bar.style.width = percent + '%';
    if (text) text.innerText = percent + '%';
}