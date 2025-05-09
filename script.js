document.addEventListener('DOMContentLoaded', () => {
    const mainImage = document.getElementById('mainImage');
    const tokens = document.querySelectorAll('.token');
    const downloadBtn = document.getElementById('downloadBtn');
    const imageWrapper = document.querySelector('.image-wrapper');
    
    // Add a simple load event to ensure the image loads properly
    mainImage.addEventListener('load', () => {
        console.log('Image loaded successfully');
    });
    
    // Add error handling
    mainImage.addEventListener('error', () => {
        console.error('Error loading image');
        alert('Failed to load the image. Please check if the file exists and has the correct name.');
    });
    
    // Lock screen orientation to portrait if possible (mobile only)
    const lockOrientation = () => {
        try {
            // Force portrait orientation
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('portrait').catch(() => {
                    // If locking fails, try to force refresh
                    if (Math.abs(window.orientation) === 90) {
                        window.scrollTo(0, 0);
                    }
                });
            }
            
            // iOS specific handling
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                if (window.orientation === 90 || window.orientation === -90) {
                    window.scrollTo(0, 0);
                    document.body.style.minHeight = '100vh';
                    setTimeout(() => {
                        window.scrollTo(0, 0);
                        document.documentElement.style.height = '100%';
                        document.body.style.height = '100%';
                    }, 50);
                }
            }
        } catch (e) {
            console.log('Orientation control error:', e);
        }
    };
    
    // Try to lock orientation on mobile
    if (/Android|iPhone|iPad|iPod|Mobile|Tablet|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        lockOrientation();
        
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            // Force immediate scroll reset
            window.scrollTo(0, 0);
            
            // Apply orientation lock with delay for iOS
            setTimeout(lockOrientation, 100);
            
            // Additional handling for iOS devices
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                setTimeout(() => {
                    window.scrollTo(0, 0);
                    // Force layout recalculation
                    document.body.style.minHeight = '100vh';
                    document.documentElement.style.height = '100%';
                    document.body.style.height = '100%';
                    // Adjust tokens after orientation change
                    adjustTokensForScreenSize();
                }, 200);
            }
        });
        
        // Additional event listeners for iOS
        window.addEventListener('resize', () => {
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                window.scrollTo(0, 0);
            }
        });
    }
    
    // Prevent default selection behavior
    document.addEventListener('selectstart', (e) => {
        if (e.target.classList.contains('token') || 
            e.target.closest('.token') ||
            e.target.closest('.image-wrapper')) {
            e.preventDefault();
        }
    });
    
    // Convert any inline styles from pixels to percentages
    function convertTokenPositionsToPercentages() {
        tokens.forEach(token => {
            if (token.style.left && token.style.top) {
                // Skip if already using percentage values
                if (token.style.left.includes('%') && token.style.top.includes('%')) {
                    return;
                }
                
                const tokenRect = token.getBoundingClientRect();
                const wrapperRect = imageWrapper.getBoundingClientRect();
                
                // Calculate token position as percentages of the wrapper
                const leftPercent = ((tokenRect.left - wrapperRect.left + tokenRect.width / 2) / wrapperRect.width) * 100;
                const topPercent = ((tokenRect.top - wrapperRect.top + tokenRect.height / 2) / wrapperRect.height) * 100;
                
                // Set the positions as percentages
                token.style.left = `${leftPercent}%`;
                token.style.top = `${topPercent}%`;
            }
        });
    }
    
    // Adjust token layout for mobile screens
    function adjustTokensForScreenSize() {
        const isMobile = window.innerWidth <= 480;
        
        // Allow CSS media queries to handle most of the layout changes
        // This function can be extended for more complex rearrangements if needed
        if (isMobile) {
            // Force update of percentage positions after media queries apply
            setTimeout(convertTokenPositionsToPercentages, 100);
        }
    }
    
    // Run conversion on load
    window.addEventListener('load', () => {
        convertTokenPositionsToPercentages();
        adjustTokensForScreenSize();
    });
    
    // Run conversion on resize and orientation change
    window.addEventListener('resize', () => {
        convertTokenPositionsToPercentages();
        adjustTokensForScreenSize();
    });
    
    window.addEventListener('orientationchange', () => {
        // Wait for orientation change to complete
        setTimeout(() => {
            convertTokenPositionsToPercentages();
            adjustTokensForScreenSize();
        }, 300);
    });
    
    // Make tokens and ball draggable
    tokens.forEach(token => {
        token.addEventListener('mousedown', startDrag);
        token.addEventListener('touchstart', startDrag, { passive: false });
    });
    
    // Download functionality
    downloadBtn.addEventListener('click', () => {
        // Show loading indicator or message
        downloadBtn.disabled = true;
        downloadBtn.textContent = 'Generating...';
        
        // Small delay to update UI before capturing
        setTimeout(() => {
            const captureArea = document.getElementById('captureArea');
            
            // Capture the tactical board
            html2canvas(captureArea, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                allowTaint: true,
                backgroundColor: null
            }).then(canvas => {
                // Convert to JPEG
                const jpegUrl = canvas.toDataURL('image/jpeg', 0.9);
                
                // Create download link
                const downloadLink = document.createElement('a');
                downloadLink.href = jpegUrl;
                downloadLink.download = 'football-tactic.jpg';
                
                // Trigger download
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                // Reset button
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Tactic
                `;
            }).catch(err => {
                console.error('Error generating image', err);
                downloadBtn.disabled = false;
                downloadBtn.textContent = 'Error - Try Again';
                setTimeout(() => {
                    downloadBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download Tactic
                    `;
                }, 3000);
            });
        }, 100);
    });
    
    function startDrag(e) {
        // Prevent default browser behaviors
        e.preventDefault();
        
        const token = e.target.closest('.token');
        if (!token) return;
        
        const tokenRect = token.getBoundingClientRect();
        const imageWrapperRect = imageWrapper.getBoundingClientRect();
        
        // Calculate initial offsets
        const offsetX = (e.clientX || (e.touches && e.touches[0].clientX)) - tokenRect.left;
        const offsetY = (e.clientY || (e.touches && e.touches[0].clientY)) - tokenRect.top;
        
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
            
            // Convert to percentage positions for responsiveness
            const leftPercent = (left / imageWrapperRect.width) * 100;
            const topPercent = (top / imageWrapperRect.height) * 100;
            
            // Position the token using percentages
            token.style.position = 'absolute';
            token.style.left = `${leftPercent}%`;
            token.style.top = `${topPercent}%`;
            token.style.zIndex = '100';
        }
        
        // Function to stop dragging
        function stopDrag(e) {
            if (e) e.preventDefault();
            token.classList.remove('dragging');
            document.removeEventListener('mousemove', dragToken);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchmove', dragToken);
            document.removeEventListener('touchend', stopDrag);
            document.removeEventListener('touchcancel', stopDrag);
        }
        
        // Add event listeners for dragging
        document.addEventListener('mousemove', dragToken);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchmove', dragToken, { passive: false });
        document.addEventListener('touchend', stopDrag);
        document.addEventListener('touchcancel', stopDrag);
    }
}); 