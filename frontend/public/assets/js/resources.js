// Resource management functionality
export const resourceAPI = {
    // Get all resources with their notes
    async getAllResources() {
        return await apiRequest('/resources');
    },

    // Upload a new resource
    async uploadResource(formData) {
        try {
            // Validate the form data
            const file = formData.get('file');
            if (!file) {
                throw new Error('No file selected for upload');
            }

            // Validate file size (50MB limit)
            const maxSize = 50 * 1024 * 1024; // 50MB in bytes
            if (file.size > maxSize) {
                throw new Error('File is too large. Maximum size is 50MB.');
            }

            // Validate file type
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'image/jpeg',
                'image/png',
                'video/mp4'
            ];
            
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Invalid file type. Please upload a valid document or media file.');
            }

            const response = await apiRequest('/resources', {
                method: 'POST',
                body: formData
            });

            if (!response) {
                throw new Error('No response from server');
            }

            if (response.error) {
                throw new Error(response.error);
            }

            if (!response._id) {
                throw new Error('Invalid response from server');
            }

            return response;
        } catch (error) {
            console.error('[resourceAPI] Upload failed:', error);
            throw new Error(error.message || 'Failed to upload resource. Please check your file and try again.');
        }
    },

    // Delete a resource
    async deleteResource(resourceId) {
        return await apiRequest(`/resources/${resourceId}`, {
            method: 'DELETE'
        });
    },

    // Add a note to a resource
    async addNote(resourceId, content) {
        return await apiRequest(`/resources/${resourceId}/notes`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
    },

    // Get all notes for a resource
    async getNotes(resourceId) {
        return await apiRequest(`/resources/${resourceId}/notes`);
    }
};

// Helper function to format resource card HTML
export function formatResourceCard(resource) {
    const notesSection = resource.notes && resource.notes.length > 0 ? `
        <div class="mt-3 pt-3 border-t border-slate-200">
            <h4 class="text-sm font-semibold text-slate-700 mb-2">Teacher Notes:</h4>
            <div class="space-y-2">
                ${resource.notes.map(note => `
                    <div class="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                        ${note.content}
                        <div class="text-xs text-slate-500 mt-1">
                            By ${note.createdBy.firstName} ${note.createdBy.lastName} • ${new Date(note.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    return `
        <div class="bg-white rounded-xl shadow-sm p-6">
            <div>
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="text-lg font-bold text-slate-800 mb-1">${resource.title}</h3>
                        <p class="text-sm text-slate-600">${resource.description || ''}</p>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 mt-3">
                    <span class="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-md">${resource.subject}</span>
                    <span class="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-md">${resource.type}</span>
                    <span class="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-md">${resource.semester}</span>
                    <span class="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-md">${resource.branch}</span>
                </div>
                ${notesSection}
                <div class="flex items-center justify-between text-xs text-slate-500 mt-4 pt-4 border-t border-slate-200">
                    <span>${resource.downloads} downloads • ${new Date(resource.uploadedAt).toLocaleDateString()}</span>
                    <div class="flex gap-2">
                        ${getCurrentUser()?.role === 'teacher' ? `
                            <button onclick="addNoteToResource('${resource._id}')" 
                                class="bg-green-600 text-white font-semibold px-3 py-1.5 text-xs rounded-lg hover:bg-green-700 transition-colors">
                                Add Note
                            </button>
                        ` : ''}
                        <a href="${resource.filePath}" target="_blank" 
                            class="bg-blue-600 text-white font-semibold px-3 py-1.5 text-xs rounded-lg hover:bg-blue-700 transition-colors">
                            Download
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to add a note to a resource
window.addNoteToResource = async function(resourceId) {
    const note = prompt('Enter your note:');
    if (!note) return;

    try {
        await resourceAPI.addNote(resourceId, note);
        // Refresh the resources to show the new note
        const resources = await resourceAPI.getAllResources();
        renderResources(resources);
        showToast('Note added successfully!');
    } catch (error) {
        console.error('Error adding note:', error);
        showToast('Error adding note. Please try again.');
    }
};

// Update the renderResources function to use the new card format
window.renderResources = function(filteredResources) {
    const libraryGrid = document.getElementById('library-grid');
    const resourceCount = document.getElementById('resource-count');
    const noResultsMessage = document.getElementById('no-results');

    if (!libraryGrid) return;
    
    libraryGrid.innerHTML = ''; // Clear existing cards
    
    if (filteredResources.length === 0) {
        noResultsMessage.classList.remove('hidden');
        libraryGrid.classList.add('hidden');
    } else {
        noResultsMessage.classList.add('hidden');
        libraryGrid.classList.remove('hidden');
        filteredResources.forEach(resource => {
            const card = formatResourceCard(resource);
            libraryGrid.insertAdjacentHTML('beforeend', card);
        });
    }

    if (resourceCount) {
        resourceCount.textContent = `Showing ${filteredResources.length} of ${window.resources.length} resources`;
    }

    const dashboardResourceCount = document.getElementById('dashboard-resource-count');
    if (dashboardResourceCount) {
        dashboardResourceCount.textContent = window.resources.length;
    }
};