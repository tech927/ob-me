document.addEventListener('DOMContentLoaded', function() {
  // File upload display
  const fileInput = document.getElementById('jsFile');
  const fileNameDisplay = document.getElementById('fileName');
  
  fileInput.addEventListener('change', function() {
    if (this.files.length > 0) {
      fileNameDisplay.textContent = this.files[0].name;
    } else {
      fileNameDisplay.textContent = 'No file chosen';
    }
  });
  
  // Obfuscation form submission
  const obfuscateForm = document.getElementById('obfuscateForm');
  obfuscateForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!fileInput.files.length) {
      alert('Please select a JavaScript file first');
      return;
    }
    
    const formData = new FormData(this);
    
    fetch('/obfuscate', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) throw new Error('Obfuscation failed');
      return response.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'obfuscated.js';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error during obfuscation: ' + error.message);
    });
  });
  
  // Comment form submission
  const commentForm = document.getElementById('commentForm');
  const commentsContainer = document.getElementById('commentsContainer');
  
  commentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const devName = document.getElementById('devName').value;
    const contact = document.getElementById('contact').value;
    const message = document.getElementById('message').value;
    
    fetch('/comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ devName, contact, message })
    })
    .then(response => response.json())
    .then(comment => {
      // Add new comment to the top
      const commentElement = createCommentElement(comment);
      commentsContainer.insertBefore(commentElement, commentsContainer.firstChild);
      
      // Clear form
      commentForm.reset();
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Error posting comment');
    });
  });
  
  // Create comment element
  function createCommentElement(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'comment-header';
    
    const devNameSpan = document.createElement('span');
    devNameSpan.className = 'dev-name';
    devNameSpan.textContent = comment.devName;
    
    const contactSpan = document.createElement('span');
    contactSpan.className = 'contact';
    contactSpan.textContent = comment.contact;
    
    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'timestamp';
    timestampSpan.textContent = new Date(comment.timestamp).toLocaleString();
    
    headerDiv.appendChild(devNameSpan);
    headerDiv.appendChild(contactSpan);
    headerDiv.appendChild(timestampSpan);
    
    const bodyDiv = document.createElement('div');
    bodyDiv.className = 'comment-body';
    bodyDiv.textContent = comment.message;
    
    commentDiv.appendChild(headerDiv);
    commentDiv.appendChild(bodyDiv);
    
    return commentDiv;
  }
  
  // Real-time comments update (polling every 5 seconds)
  function updateComments() {
    fetch('/')
      .then(response => response.text())
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newCommentsContainer = doc.getElementById('commentsContainer');
        
        if (newCommentsContainer) {
          // Only update if there are new comments
          if (newCommentsContainer.children.length !== commentsContainer.children.length) {
            commentsContainer.innerHTML = newCommentsContainer.innerHTML;
          }
        }
      })
      .catch(error => console.error('Error updating comments:', error));
  }
  
  // Initial comments load
  updateComments();
  
  // Set up periodic updates
  setInterval(updateComments, 5000);
  
  // Add futuristic hover effects to all sections
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    section.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.boxShadow = '0 10px 30px rgba(188, 19, 254, 0.2)';
    });
    
    section.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
    });
  });
});
