/**
 * Heart Talk Book - Interactive Features
 *
 * Features:
 * - Smooth scrolling
 * - Keyboard navigation (arrow keys for prev/next chapter)
 * - Reading progress indicator
 * - Local storage for reading position
 */

(function() {
    'use strict';

    // Smooth scroll to top on page load
    window.addEventListener('load', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Keyboard navigation for chapters
    document.addEventListener('keydown', function(e) {
        // Left arrow or 'p' for previous chapter
        if ((e.key === 'ArrowLeft' || e.key === 'p') && !isInputFocused()) {
            const prevButton = document.querySelector('.prev-button');
            if (prevButton) {
                window.location.href = prevButton.href;
            }
        }

        // Right arrow or 'n' for next chapter
        if ((e.key === 'ArrowRight' || e.key === 'n') && !isInputFocused()) {
            const nextButton = document.querySelector('.next-button');
            if (nextButton) {
                window.location.href = nextButton.href;
            }
        }

        // 'h' or Escape for home/TOC
        if ((e.key === 'h' || e.key === 'Escape') && !isInputFocused()) {
            const homeLink = document.querySelector('.home-link');
            if (homeLink) {
                window.location.href = homeLink.href;
            }
        }
    });

    function isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.tagName === 'SELECT'
        );
    }

    // Save reading position
    function saveReadingPosition() {
        const currentPath = window.location.pathname;
        const scrollPosition = window.scrollY;
        localStorage.setItem('heartTalkLastPage', currentPath);
        localStorage.setItem('heartTalkScrollPosition', scrollPosition);
    }

    // Restore reading position (optional feature)
    function restoreReadingPosition() {
        const lastPage = localStorage.getItem('heartTalkLastPage');
        const currentPath = window.location.pathname;

        if (lastPage === currentPath) {
            const scrollPosition = localStorage.getItem('heartTalkScrollPosition');
            if (scrollPosition) {
                setTimeout(() => {
                    window.scrollTo({ top: parseInt(scrollPosition), behavior: 'smooth' });
                }, 100);
            }
        }
    }

    // Save position when leaving page
    window.addEventListener('beforeunload', saveReadingPosition);

    // Optional: Restore position on load (uncomment if desired)
    // window.addEventListener('load', restoreReadingPosition);

    // Add reading progress indicator
    function addProgressIndicator() {
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(to right, #c54a4a, #e76f6f);
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', function() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrolled = window.scrollY;
            const progress = (scrolled / documentHeight) * 100;
            progressBar.style.width = progress + '%';
        });
    }

    // Initialize progress indicator if on a chapter page
    if (document.querySelector('.chapter-content')) {
        addProgressIndicator();
    }

    // Add keyboard shortcuts hint (show on first visit)
    function showKeyboardHint() {
        const hasSeenHint = localStorage.getItem('heartTalkKeyboardHintSeen');

        if (!hasSeenHint && document.querySelector('.chapter-content')) {
            const hint = document.createElement('div');
            hint.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(44, 44, 44, 0.95);
                color: white;
                padding: 16px 20px;
                border-radius: 8px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                font-size: 14px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                z-index: 9998;
                animation: slideIn 0.4s ease-out;
                cursor: pointer;
            `;
            hint.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 8px;">Keyboard Shortcuts 🎹</div>
                <div style="opacity: 0.9; line-height: 1.6;">
                    ← → Arrow keys: Previous/Next chapter<br>
                    H or Esc: Return to Table of Contents
                </div>
                <div style="margin-top: 8px; font-size: 12px; opacity: 0.7;">Click to dismiss</div>
            `;

            // Add animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateY(100px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                @keyframes fadeOut {
                    to {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                }
            `;
            document.head.appendChild(style);

            hint.addEventListener('click', function() {
                hint.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => hint.remove(), 300);
                localStorage.setItem('heartTalkKeyboardHintSeen', 'true');
            });

            document.body.appendChild(hint);

            // Auto-hide after 8 seconds
            setTimeout(function() {
                if (hint.parentNode) {
                    hint.style.animation = 'fadeOut 0.3s ease-out';
                    setTimeout(() => hint.remove(), 300);
                    localStorage.setItem('heartTalkKeyboardHintSeen', 'true');
                }
            }, 8000);
        }
    }

    // Show hint after a short delay
    setTimeout(showKeyboardHint, 1000);

    // Add smooth hover effects to TOC items
    const tocItems = document.querySelectorAll('.toc-item');
    tocItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(8px)';
        });
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });

    // Print functionality (optional)
    function addPrintButton() {
        if (document.querySelector('.chapter-content')) {
            const printBtn = document.createElement('button');
            printBtn.innerHTML = '🖨️ Print Chapter';
            printBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 20px;
                padding: 12px 20px;
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 6px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                font-size: 14px;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                transition: all 0.2s ease;
                z-index: 9997;
            `;

            printBtn.addEventListener('mouseenter', function() {
                this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                this.style.transform = 'translateY(-2px)';
            });

            printBtn.addEventListener('mouseleave', function() {
                this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                this.style.transform = 'translateY(0)';
            });

            printBtn.addEventListener('click', function() {
                window.print();
            });

            document.body.appendChild(printBtn);
        }
    }

    // Uncomment to enable print button
    // addPrintButton();

})();
