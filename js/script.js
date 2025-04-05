// Add student information dynamically
document.addEventListener('DOMContentLoaded', function() {
    const studentId = "200596150"; 
    const studentName = "Gurmehar Kaur";
    
    // Add student info to the page
    document.getElementById('student-info').textContent = `Student ID: ${studentId} | Name: ${studentName}`;
    
    // Set up event listeners
    setupEventListeners();
    
    // Load random photos on initial page load
    getRandomPhotos();
});

// API Configuration
const API_KEY = 's9f4aC2Ce1RxzGWsSxYlQVIPJfZZQV2V-RlJYK733cg'; // Your actual API key
const API_URL = 'https://api.unsplash.com';

// Global state variables
let currentPage = 1;
let totalPages = 0;
let currentQuery = '';
let currentSort = 'relevant';
let perPage = 20;

/**
 * Set up all event listeners for the application
 */
function setupEventListeners() {
    // Search button click
    document.getElementById('search-btn').addEventListener('click', function() {
        const query = document.getElementById('search-input').value.trim();
        if (query) {
            currentQuery = query;
            currentPage = 1;
            searchPhotos(query, currentPage);
        } else {
            showError("Please enter a search term");
        }
    });
    
    // Enter key in search input
    document.getElementById('search-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            const query = document.getElementById('search-input').value.trim();
            if (query) {
                currentQuery = query;
                currentPage = 1;
                searchPhotos(query, currentPage);
            } else {
                showError("Please enter a search term");
            }
        }
    });
    
    // Sort select change
    document.getElementById('sort-select').addEventListener('change', function() {
        currentSort = this.value;
        if (currentQuery) {
            currentPage = 1;
            searchPhotos(currentQuery, currentPage);
        }
    });
    
    // Per page select change
    document.getElementById('per-page-select').addEventListener('change', function() {
        perPage = parseInt(this.value);
        if (currentQuery) {
            currentPage = 1;
            searchPhotos(currentQuery, currentPage);
        } else {
            getRandomPhotos();
        }
    });
    
    // Previous page button
    document.getElementById('prev-btn').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            if (currentQuery) {
                searchPhotos(currentQuery, currentPage);
            }
        }
    });
    
    // Next page button
    document.getElementById('next-btn').addEventListener('click', function() {
        if (currentPage < totalPages) {
            currentPage++;
            if (currentQuery) {
                searchPhotos(currentQuery, currentPage);
            }
        }
    });
    
    // Close modal when clicking the X
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('photo-modal').classList.add('hidden');
        document.body.style.overflow = 'auto';
    });
    
    // Close modal when clicking outside the modal content
    document.getElementById('photo-modal').addEventListener('click', function(event) {
        if (event.target === this) {
            this.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Prevent modal close when clicking inside the modal content
    document.querySelector('.modal-content').addEventListener('click', function(event) {
        event.stopPropagation();
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !document.getElementById('photo-modal').classList.contains('hidden')) {
            document.getElementById('photo-modal').classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    });
}

/**
 * Get random photos for initial page load
 */
async function getRandomPhotos() {
    try {
        showLoading();
        
        const url = `${API_URL}/photos/random?client_id=${API_KEY}&count=${perPage}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const photos = await response.json();
        
        // Handle case where single photo is returned (wrap in array)
        const photosArray = Array.isArray(photos) ? photos : [photos];
        
        hideLoading();
        displayPhotos(photosArray);
        
        // Update pagination
        document.getElementById('page-info').textContent = `Random Photos`;
        document.getElementById('prev-btn').classList.add('hidden');
        document.getElementById('next-btn').classList.add('hidden');
        
    } catch (error) {
        hideLoading();
        showError(`Error loading photos: ${error.message}`);
    }
}

/**
 * Search for photos based on query
 * @param {string} query - Search term
 * @param {number} page - Page number
 */
async function searchPhotos(query, page) {
    try {
        showLoading();
        
        const url = `${API_URL}/search/photos?client_id=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&order_by=${currentSort}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        hideLoading();
        
        if (!data.results || data.results.length === 0) {
            showError(`No photos found for "${query}"`);
            return;
        }
        
        displayPhotos(data.results);
        
        // Update pagination
        totalPages = data.total_pages;
        updatePagination();
        
    } catch (error) {
        hideLoading();
        showError(`Error searching photos: ${error.message}`);
    }
}

/**
 * Display photos in the grid
 * @param {Array} photos - Array of photo objects
 */
function displayPhotos(photos) {
    const photosGrid = document.getElementById('photos-grid');
    photosGrid.innerHTML = '';
    
    photos.forEach(photo => {
        const photoCard = document.createElement('div');
        photoCard.className = 'photo-card';
        
        const img = document.createElement('img');
        img.src = photo.urls.small;
        img.alt = photo.alt_description || 'Unsplash photo';
        img.loading = 'lazy';
        
        const overlay = document.createElement('div');
        overlay.className = 'photo-overlay';
        
        const photographerName = document.createElement('p');
        photographerName.className = 'photographer';
        photographerName.textContent = photo.user.name;
        
        const likes = document.createElement('p');
        likes.className = 'likes';
        likes.innerHTML = `<span>❤</span> ${photo.likes}`;
        
        overlay.appendChild(photographerName);
        overlay.appendChild(likes);
        
        photoCard.appendChild(img);
        photoCard.appendChild(overlay);
        
        // Add click event to show modal with photo details
        photoCard.addEventListener('click', () => {
            showPhotoModal(photo);
        });
        
        photosGrid.appendChild(photoCard);
    });
}

/**
 * Show photo modal with detailed information
 * @param {Object} photo - Photo object
 */
function showPhotoModal(photo) {
    const modalPhotoContainer = document.getElementById('modal-photo-container');
    
    // Format date
    const createdDate = new Date(photo.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Create HTML for photo details
    modalPhotoContainer.innerHTML = `
        <div class="modal-photo">
            <img src="${photo.urls.regular}" alt="${photo.alt_description || 'Unsplash photo'}">
        </div>
        <div class="modal-info">
            <h3>${photo.description || photo.alt_description || 'Untitled photo'}</h3>
            
            <div class="photographer-info">
                <img src="${photo.user.profile_image.medium}" alt="${photo.user.name}" class="profile-img">
                <div>
                    <h4>${photo.user.name}</h4>
                    <p class="username">@${photo.user.username}</p>
                </div>
            </div>
            
            <div class="photo-stats">
                <p><span class="stat-label">Likes:</span> ${photo.likes}</p>
                <p><span class="stat-label">Downloads:</span> ${photo.downloads || 'N/A'}</p>
                <p><span class="stat-label">Views:</span> ${photo.views || 'N/A'}</p>
                <p><span class="stat-label">Published:</span> ${createdDate}</p>
            </div>
            
            ${photo.location && photo.location.name ? 
                `<p class="location"><span class="stat-label">Location:</span> ${photo.location.name}</p>` : ''}
            
            ${photo.exif ? 
                `<div class="exif-data">
                    <h4>Camera Info</h4>
                    ${photo.exif.make || photo.exif.model ? `<p><span class="stat-label">Camera:</span> ${[photo.exif.make, photo.exif.model].filter(Boolean).join(' ')}</p>` : ''}
                    ${photo.exif.exposure_time ? `<p><span class="stat-label">Exposure:</span> ${photo.exif.exposure_time}s</p>` : ''}
                    ${photo.exif.aperture ? `<p><span class="stat-label">Aperture:</span> f/${photo.exif.aperture}</p>` : ''}
                    ${photo.exif.focal_length ? `<p><span class="stat-label">Focal Length:</span> ${photo.exif.focal_length}mm</p>` : ''}
                    ${photo.exif.iso ? `<p><span class="stat-label">ISO:</span> ${photo.exif.iso}</p>` : ''}
                </div>` : ''}
            
            ${photo.tags && photo.tags.length ? 
                `<div class="tags">
                    <h4>Tags</h4>
                    <div class="tags-container">
                        ${photo.tags.map(tag => `<span class="tag">${tag.title}</span>`).join('')}
                    </div>
                </div>` : ''}
            
            <div class="photo-links">
                <a href="${photo.links.html}" target="_blank" rel="noopener noreferrer" class="button">View on Unsplash</a>
                <a href="${photo.urls.full}" target="_blank" rel="noopener noreferrer" class="button">View Full Resolution</a>
            </div>
        </div>
    `;
    
    // Show modal
    document.getElementById('photo-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Update pagination controls
 */
function updatePagination() {
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Show/hide previous button
    if (currentPage > 1) {
        prevBtn.classList.remove('hidden');
    } else {
        prevBtn.classList.add('hidden');
    }
    
    // Show/hide next button
    if (currentPage < totalPages) {
        nextBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.add('hidden');
    }
}

/**
 * Show loading indicator
 */
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    const photosGrid = document.getElementById('photos-grid');
    photosGrid.innerHTML = `
        <div class="error-container">
            <p class="error-message">${message}</p>
            <p>Please try again with a different search term.</p>
        </div>
    `;
    
    // Reset pagination
    document.getElementById('page-info').textContent = `Error`;
    document.getElementById('prev-btn').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');
}
