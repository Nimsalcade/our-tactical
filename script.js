document.addEventListener('DOMContentLoaded', () => {
    const mainImage = document.getElementById('mainImage');
    const tokens = document.querySelectorAll('.token');
    
    // Add a simple load event to ensure the image loads properly
    mainImage.addEventListener('load', () => {
        console.log('Image loaded successfully');
    });
    
    // Add error handling
    mainImage.addEventListener('error', () => {
        console.error('Error loading image');
        alert('Failed to load the image. Please check if the file exists and has the correct name.');
    });
    
    // Prevent default selection behavior
    document.addEventListener('selectstart', (e) => {
        if (e.target.classList.contains('token') || 
            e.target.closest('.token') ||
            e.target.closest('.image-wrapper')) {
            e.preventDefault();
        }
    });
    
    // Make tokens and ball draggable
    tokens.forEach(token => {
        token.addEventListener('mousedown', startDrag);
        token.addEventListener('touchstart', startDrag, { passive: false });
    });
    
    function startDrag(e) {
        // Prevent default browser behaviors
        e.preventDefault();
        
        const token = e.target.closest('.token');
        if (!token) return;
        
        const tokenRect = token.getBoundingClientRect();
        const imageWrapper = document.querySelector('.image-wrapper');
        const imageWrapperRect = imageWrapper.getBoundingClientRect();
        
        // Calculate initial offsets
        const offsetX = (e.clientX || e.touches[0].clientX) - tokenRect.left;
        const offsetY = (e.clientY || e.touches[0].clientY) - tokenRect.top;
        
        // Add active class to dragged token
        token.classList.add('dragging');
        
        // Function to handle the dragging
        function dragToken(e) {
            e.preventDefault();
            
            // Get current mouse/touch position
            const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
            const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);
            
            // Calculate position relative to the image wrapper
            let left = clientX - offsetX - imageWrapperRect.left;
            let top = clientY - offsetY - imageWrapperRect.top;
            
            // Keep token within the image wrapper boundaries
            if (left < 0) left = 0;
            if (top < 0) top = 0;
            if (left > imageWrapperRect.width - tokenRect.width) {
                left = imageWrapperRect.width - tokenRect.width;
            }
            if (top > imageWrapperRect.height - tokenRect.height) {
                top = imageWrapperRect.height - tokenRect.height;
            }
            
            // Position the token
            token.style.position = 'absolute';
            token.style.left = `${left}px`;
            token.style.top = `${top}px`;
            token.style.zIndex = '100';
        }
        
        // Function to stop dragging
        function stopDrag(e) {
            e.preventDefault();
            token.classList.remove('dragging');
            document.removeEventListener('mousemove', dragToken);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchmove', dragToken);
            document.removeEventListener('touchend', stopDrag);
        }
        
        // Add event listeners for dragging
        document.addEventListener('mousemove', dragToken);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchmove', dragToken, { passive: false });
        document.addEventListener('touchend', stopDrag);
    }
}); 