// This script runs inside the MasterSoft ERP page
function init() {
  console.log("Assignment क्रिया Companion: Deep Scanning...");

  // 1. Target all potential containers (Tables, Divs, Lists)
  const targets = document.querySelectorAll('tr, td, div, span, a');

  targets.forEach(el => {
    const text = el.innerText || "";

    // We search for common patterns: Date (dd/mm/yyyy) or Keywords
    const hasDate = /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(text);
    const hasKeyword = /Due|Deadline|Submission|Assignment/i.test(text);

    // Only inject if it looks like a row/cell and doesn't already have our button
    if ((hasDate || hasKeyword) &&
        el.children.length < 10 && // Avoid injecting into huge containers
        !el.querySelector('.kriya-btn') &&
        el.innerText.length < 200) { // Ensure it's a specific task, not the whole page

      const btn = document.createElement('button');
      btn.innerText = '➕ Add to Kriya';
      btn.className = 'kriya-btn';

      // Force styles to ensure visibility over ERP styles
      btn.style.zIndex = "2147483647";
      btn.style.position = "relative";
      btn.style.display = "inline-block";
      btn.style.marginLeft = "10px";
      btn.style.cursor = "pointer";

      btn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Try to extract the best title and date
        const title = text.split('\n')[0].trim() || "New Assignment";
        const dateMatch = text.match(/\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/);
        const deadline = dateMatch ? dateMatch[0] : new Date().toISOString();

        const assignmentData = {
          id: crypto.randomUUID(),
          title: title,
          deadline: deadline,
          subject: "ERP Import",
          priority: "Medium",
          completed: false
        };

        try {
          // Attempt the API sync first
          const response = await fetch('http://localhost:3000/api/external-add', {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, deadline })
          });

          if (response.ok) {
            btn.innerText = '✅ Added!';
            btn.style.backgroundColor = '#22c55e';
          } else {
            throw new Error('Server error');
          }
        } catch (err) {
          // FALLBACK: Use the clipboard bridge
          navigator.clipboard.writeText(JSON.stringify(assignmentData));
          btn.innerText = '📋 Copied!';
          btn.style.backgroundColor = '#f59e0b';
          alert('Direct sync blocked by browser security.\n\nAssignment copied to clipboard! Now go to Assignment क्रिया and click "Paste from ERP".');
        }

        setTimeout(() => {
          btn.innerText = '➕ Add to Kriya';
          btn.style.backgroundColor = '#4f46e5';
        }, 3000);
      };

      el.appendChild(btn);
    }
  });
}

// Run frequently to catch dynamically loaded content in popups
init();
setInterval(init, 2000);
