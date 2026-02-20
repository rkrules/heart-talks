/**
 * Heart Talk - Client-Side Search Functionality
 */

class HeartTalkSearch {
    constructor() {
        this.searchIndex = [];
        this.isLoading = true;
        this.currentResults = [];
        this.selectedIndex = -1;

        this.initializeUI();
        this.loadSearchIndex();
        this.attachEventListeners();
    }

    /**
     * Load the search index from JSON file
     */
    async loadSearchIndex() {
        try {
            // Determine the correct path based on current location
            const isInChapterSubdir = window.location.pathname.includes('/chapters');
            const searchIndexPath = isInChapterSubdir ? '../search-index.json' : 'search-index.json';

            const response = await fetch(searchIndexPath);
            if (!response.ok) {
                throw new Error('Failed to load search index');
            }
            this.searchIndex = await response.json();
            this.isLoading = false;
            console.log(`✅ Search index loaded: ${this.searchIndex.length} chapters`);
        } catch (error) {
            console.error('❌ Failed to load search index:', error);
            this.isLoading = false;
        }
    }

    /**
     * Initialize search UI elements
     */
    initializeUI() {
        // Create search button
        const searchButton = document.createElement('button');
        searchButton.className = 'search-button';
        searchButton.setAttribute('aria-label', 'Search all chapters');
        searchButton.innerHTML = '🔍 Search';
        searchButton.addEventListener('click', () => this.openSearchModal());

        // On homepage, insert search button into the action bar next to glossary
        // On chapter pages, insert into the chapter header
        const actionBar = document.querySelector('.index-actions');
        const header = document.querySelector('.chapter-header, .book-header');
        if (actionBar) {
            actionBar.appendChild(searchButton);
        } else if (header) {
            header.appendChild(searchButton);
        }

        // Create search modal
        const modal = document.createElement('div');
        modal.className = 'search-modal';
        modal.id = 'searchModal';
        modal.setAttribute('hidden', '');
        modal.innerHTML = `
            <div class="search-backdrop" aria-hidden="true"></div>
            <div class="search-container" role="dialog" aria-labelledby="search-title" aria-modal="true">
                <div class="search-header">
                    <h2 id="search-title" class="search-title">Search Heart Talk</h2>
                    <button class="search-close" aria-label="Close search">&times;</button>
                </div>
                <input type="search"
                       class="search-input"
                       placeholder="Search all chapters... (Ctrl+K)"
                       aria-label="Search"
                       autocomplete="off">
                <div class="search-results" role="listbox" aria-label="Search results"></div>
                <div class="search-footer">
                    <kbd>↑</kbd><kbd>↓</kbd> Navigate · <kbd>Enter</kbd> Open · <kbd>Esc</kbd> Close
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Keyboard shortcut: Ctrl+K or Cmd+K
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearchModal();
            }

            // Escape key to close
            if (e.key === 'Escape') {
                this.closeSearchModal();
            }
        });

        // Search input
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.performSearch(e.target.value);
            });

            searchInput.addEventListener('keydown', (e) => {
                this.handleKeyboardNavigation(e);
            });
        }

        // Close button
        const closeButton = document.querySelector('.search-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => this.closeSearchModal());
        }

        // Click backdrop to close
        const backdrop = document.querySelector('.search-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.closeSearchModal());
        }
    }

    /**
     * Open search modal
     */
    openSearchModal() {
        const modal = document.getElementById('searchModal');
        const input = document.querySelector('.search-input');

        if (modal && input) {
            modal.removeAttribute('hidden');
            input.focus();
            input.select();
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }
    }

    /**
     * Close search modal
     */
    closeSearchModal() {
        const modal = document.getElementById('searchModal');
        const input = document.querySelector('.search-input');
        const resultsContainer = document.querySelector('.search-results');

        if (modal) {
            modal.setAttribute('hidden', '');
            document.body.style.overflow = ''; // Restore scroll

            if (input) input.value = '';
            if (resultsContainer) resultsContainer.innerHTML = '';

            this.currentResults = [];
            this.selectedIndex = -1;
        }
    }

    /**
     * Perform search query
     * @param {string} query - Search query
     */
    performSearch(query) {
        query = query.trim();

        if (!query || query.length < 2) {
            this.displayResults([]);
            return;
        }

        if (this.isLoading) {
            this.displayResults([], 'Loading search index...');
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = [];

        this.searchIndex.forEach(chapter => {
            const titleMatch = chapter.title.toLowerCase().includes(lowerQuery);
            const contentMatch = chapter.content.toLowerCase().includes(lowerQuery);

            if (titleMatch || contentMatch) {
                const relevance = titleMatch ? 10 : 1;
                const context = this.getContext(chapter.content, lowerQuery);

                results.push({
                    ...chapter,
                    relevance,
                    context,
                    titleMatch
                });
            }
        });

        // Sort by relevance (title matches first, then content matches)
        results.sort((a, b) => b.relevance - a.relevance);

        this.currentResults = results;
        this.selectedIndex = -1;
        this.displayResults(results, query);
    }

    /**
     * Get context snippet around the search query
     * @param {string} content - Full content
     * @param {string} query - Search query
     * @param {number} contextLength - Characters of context
     * @returns {string} Context snippet with highlighting
     */
    getContext(content, query, contextLength = 150) {
        const lowerContent = content.toLowerCase();
        const index = lowerContent.indexOf(query);

        if (index === -1) {
            return this.escapeHTML(content.substring(0, contextLength)) + '...';
        }

        const start = Math.max(0, index - contextLength / 2);
        const end = Math.min(content.length, index + query.length + contextLength / 2);

        let context = content.substring(start, end);

        if (start > 0) context = '...' + context;
        if (end < content.length) context = context + '...';

        // Highlight the query (case-insensitive)
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        context = this.escapeHTML(context).replace(regex, '<mark>$1</mark>');

        return context;
    }

    /**
     * Display search results
     * @param {Array} results - Search results
     * @param {string} query - Search query (optional)
     */
    displayResults(results, query = '') {
        const resultsContainer = document.querySelector('.search-results');
        if (!resultsContainer) return;

        if (results.length === 0) {
            if (query && query !== 'Loading search index...') {
                resultsContainer.innerHTML = `
                    <div class="search-no-results">
                        <p>No results found for "${this.escapeHTML(query)}"</p>
                        <p class="search-hint">Try different keywords or check spelling</p>
                    </div>
                `;
            } else if (query === 'Loading search index...') {
                resultsContainer.innerHTML = `
                    <div class="search-loading">
                        <p>Loading search index...</p>
                    </div>
                `;
            } else {
                resultsContainer.innerHTML = '';
            }
            return;
        }

        const html = results.map((result, index) => `
            <div class="search-result" data-index="${index}" data-chapter="${result.id}">
                <div class="search-result-number">Heart Talk #${result.number}</div>
                <div class="search-result-title">${this.escapeHTML(result.title)}</div>
                <div class="search-result-context">${result.context}</div>
            </div>
        `).join('');

        resultsContainer.innerHTML = html;

        // Add click handlers
        resultsContainer.querySelectorAll('.search-result').forEach(el => {
            el.addEventListener('click', () => {
                const chapterId = el.getAttribute('data-chapter');
                this.navigateToChapter(chapterId);
            });
        });
    }

    /**
     * Handle keyboard navigation in results
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardNavigation(e) {
        if (this.currentResults.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectedIndex = Math.min(this.selectedIndex + 1, this.currentResults.length - 1);
            this.highlightResult();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
            this.highlightResult();
        } else if (e.key === 'Enter' && this.selectedIndex >= 0) {
            e.preventDefault();
            const result = this.currentResults[this.selectedIndex];
            this.navigateToChapter(result.id);
        }
    }

    /**
     * Highlight the selected result
     */
    highlightResult() {
        const results = document.querySelectorAll('.search-result');
        results.forEach((el, index) => {
            if (index === this.selectedIndex) {
                el.classList.add('search-result-selected');
                el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                el.classList.remove('search-result-selected');
            }
        });
    }

    /**
     * Navigate to a chapter
     * @param {number} chapterId - Chapter ID
     */
    navigateToChapter(chapterId) {
        const isInChapterSubdir = window.location.pathname.includes('/chapters');

        if (isInChapterSubdir) {
            // Already in chapters/ directory, just navigate to the chapter
            window.location.href = `chapter${chapterId}.html`;
        } else {
            // On index page, need to go into chapters/ directory
            window.location.href = `chapters/chapter${chapterId}.html`;
        }
    }

    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Escape regex special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeRegex(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// Initialize search when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new HeartTalkSearch();
    });
} else {
    new HeartTalkSearch();
}
