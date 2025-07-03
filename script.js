// DOM Elements
const userContainer = document.getElementById("userContainer")
const reloadBtn = document.querySelector(".reload-btn")
const addBtn = document.querySelector(".add-btn")
const addUserModal = document.getElementById("addUserModal")
const addUserForm = document.getElementById("addUserForm")
const searchInput = document.getElementById("searchInput")

// Stats elements
const totalUsersEl = document.getElementById("totalUsers")
const apiUsersEl = document.getElementById("apiUsers")
const localUsersEl = document.getElementById("localUsers")

// Configuration
const API_URL = "https://jsonplaceholder.typicode.com/users"
const LOCAL_STORAGE_KEY = "userVault_localUsers"

// Global state
const apiUsers = []
let localUsers = []
let allUsers = []
let filteredUsers = []

/**
 * Show loading state with spinner
 */
function showLoading() {
  userContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading amazing user data...</p>
            <p style="font-size: 0.9rem; opacity: 0.7; margin-top: 10px;">Please wait while we fetch the latest information</p>
        </div>
    `
  reloadBtn.disabled = true
  reloadBtn.innerHTML = `
    <span class="btn-icon">⏳</span>
    <span class="btn-text">Loading...</span>
  `
}

/**
 * Show error state with detailed message
 * @param {string} message - Error message to display
 */
function showError(message) {
  userContainer.innerHTML = `
        <div class="error">
            <h3>⚠️ Oops! Something went wrong</h3>
            <p><strong>Error Details:</strong> ${message}</p>
            <div style="margin-top: 20px;">
                <p><strong>💡 Quick Fixes:</strong></p>
                <ul style="margin-top: 10px; padding-left: 20px; line-height: 1.6;">
                    <li>Check your internet connection</li>
                    <li>Try refreshing the page</li>
                    <li>The API service might be temporarily unavailable</li>
                    <li>Disable any ad blockers or VPN that might interfere</li>
                    <li>Clear your browser cache and try again</li>
                </ul>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.2); border-radius: 10px;">
                <p style="margin: 0; font-size: 0.9rem;">💡 <strong>Pro Tip:</strong> You can still add new users manually using the "Add New" button!</p>
            </div>
        </div>
    `
  reloadBtn.disabled = false
  reloadBtn.innerHTML = `
    <span class="btn-icon">🔄</span>
    <span class="btn-text">Retry</span>
  `
}

/**
 * Get user initials for avatar display
 * @param {string} name - Full name of the user
 * @returns {string} User initials
 */
function getUserInitials(name) {
  if (!name) return "?"
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Create HTML for a single user card
 * @param {Object} user - User object from API
 * @param {boolean} isLocal - Indicates if the user is local
 * @returns {string} HTML string for user card
 */
function createUserCard(user, isLocal = false) {
  const badgeClass = isLocal ? "local-badge" : "api-badge"
  const badgeText = isLocal ? "Added" : "API"
  const cardClass = isLocal ? "local-user" : ""

  return `
        <div class="user-card ${cardClass}" data-user-id="${user.id}">
            <div class="user-badge ${badgeClass}">${badgeText}</div>
            <div class="user-header">
                <div class="user-avatar">
                    ${getUserInitials(user.name)}
                </div>
                <div>
                    <h2 class="user-name">${escapeHtml(user.name)}</h2>
                    <p class="user-username">@${escapeHtml(user.username)}</p>
                </div>
            </div>
            
            <div class="user-info">
                <div class="info-item">
                    <svg class="info-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    <div class="info-content">
                        <div class="info-label">Email Address</div>
                        <div class="info-value">
                            <a href="mailto:${escapeHtml(user.email)}" style="color: inherit; text-decoration: none;">
                                ${escapeHtml(user.email)}
                            </a>
                        </div>
                    </div>
                </div>
                
                <div class="info-item">
                    <svg class="info-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                    </svg>
                    <div class="info-content">
                        <div class="info-label">Location</div>
                        <div class="info-value">
                            ${escapeHtml(user.address?.street || "N/A")} ${escapeHtml(user.address?.suite || "")}
                            <div class="address-details">
                                ${escapeHtml(user.address?.city || "N/A")}, ${escapeHtml(user.address?.zipcode || "N/A")}
                                ${user.address?.geo ? `<br><small>📍 ${escapeHtml(user.address.geo.lat)}, ${escapeHtml(user.address.geo.lng)}</small>` : ""}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="info-item">
                    <svg class="info-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                    <div class="info-content">
                        <div class="info-label">Phone Number</div>
                        <div class="info-value">
                            ${user.phone ? `<a href="tel:${escapeHtml(user.phone)}" style="color: inherit; text-decoration: none;">${escapeHtml(user.phone)}</a>` : "Not provided"}
                        </div>
                    </div>
                </div>
                
                <div class="info-item">
                    <svg class="info-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <div class="info-content">
                        <div class="info-label">Company</div>
                        <div class="info-value">
                            ${escapeHtml(user.company?.name || "Not specified")}<br>
                            <small>${escapeHtml(user.company?.catchPhrase || "")}</small>
                        </div>
                    </div>
                </div>
                
                <div class="info-item">
                    <svg class="info-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clip-rule="evenodd"/>
                    </svg>
                    <div class="info-content">
                        <div class="info-label">Website</div>
                        <div class="info-value">
                            ${user.website ? `<a href="http://${escapeHtml(user.website)}" target="_blank" rel="noopener noreferrer" style="color: #667eea; text-decoration: none;">${escapeHtml(user.website)}</a>` : "Not provided"}
                        </div>
                    </div>
                </div>
            </div>
            
            ${
              isLocal
                ? `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(0,0,0,0.1);">
                    <button onclick="deleteUser('${user.id}')" style="background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 0.8rem; cursor: pointer; transition: all 0.3s ease;">
                        🗑️ Delete
                    </button>
                </div>
            `
                : ""
            }
        </div>
    `
}

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  if (!text) return ""
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

/**
 * Render users to the DOM
 * @param {Array} users - Array of user objects
 */
function renderUsers(users) {
  if (!Array.isArray(users) || users.length === 0) {
    showError("No users found in the response")
    return
  }

  const usersHTML = users.map(createUserCard).join("")
  userContainer.innerHTML = `<div class="users-grid">${usersHTML}</div>`

  // Reset button state
  reloadBtn.disabled = false
  reloadBtn.textContent = "🔄 Reload Data"

  // Log success
  console.log(`Successfully loaded ${users.length} users`)
}

/**
 * Determine error type and return appropriate message
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
function getErrorMessage(error) {
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    return "Network error - please check your internet connection"
  }

  if (error.message.includes("HTTP error")) {
    return `Server error: ${error.message}`
  }

  if (error.name === "SyntaxError") {
    return "Invalid response format received from server"
  }

  if (error.message.includes("timeout")) {
    return "Request timed out - server is taking too long to respond"
  }

  return error.message || "Unknown error occurred"
}

/**
 * Validate user data structure
 * @param {Array} users - Array of user objects to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateUserData(users) {
  if (!Array.isArray(users)) {
    return false
  }

  return users.every(
    (user) =>
      user &&
      typeof user.name === "string" &&
      typeof user.email === "string" &&
      user.address &&
      typeof user.address.street === "string",
  )
}

/**
 * Main function to fetch users from API
 */
async function fetchUsers() {
  showLoading()

  try {
    console.log("Fetching users from:", API_URL)

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    // Fetch data from JSONPlaceholder API
    const response = await fetch(API_URL, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    // Clear timeout
    clearTimeout(timeoutId)

    // Check if the response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
    }

    // Check content type
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Server did not return JSON data")
    }

    // Parse JSON response
    const users = await response.json()

    // Validate the data structure
    if (!validateUserData(users)) {
      throw new Error("Invalid user data structure received from API")
    }

    // Clear and populate apiUsers array
    apiUsers.length = 0
    apiUsers.push(...users)

    // Render all users (API + local)
    renderAllUsers()
  } catch (error) {
    // Handle AbortError specifically
    if (error.name === "AbortError") {
      console.error("Request timed out")
      showError("Request timed out - server is taking too long to respond")
      return
    }

    // Log error for debugging
    console.error("Error fetching users:", error)

    // Show user-friendly error message but still render local users
    showError(getErrorMessage(error))

    // Even if API fails, show local users
    renderAllUsers()
  }
}

/**
 * Generate unique ID for local users
 */
function generateUserId() {
  return Date.now() + Math.random().toString(36).substr(2, 9)
}

/**
 * Combine and render all users
 */
function renderAllUsers() {
  // Combine API and local users
  allUsers = [...apiUsers, ...localUsers]

  // Apply search filter if active
  const searchTerm = searchInput.value.toLowerCase().trim()
  filteredUsers = searchTerm
    ? allUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.username.toLowerCase().includes(searchTerm) ||
          user.company?.name?.toLowerCase().includes(searchTerm),
      )
    : allUsers

  if (filteredUsers.length === 0) {
    userContainer.innerHTML = `
      <div style="text-align: center; padding: 60px; color: #6c757d;">
        <div style="font-size: 4rem; margin-bottom: 20px;">🔍</div>
        <h3 style="margin-bottom: 10px; color: #2c3e50;">No users found</h3>
        <p>${searchTerm ? `No users match "${searchTerm}"` : "No users available"}</p>
        ${!searchTerm ? '<button onclick="openAddUserModal()" style="margin-top: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; font-weight: 600;">Add Your First User</button>' : ""}
      </div>
    `
    return
  }

  // Separate API and local users for rendering
  const apiUsersToRender = filteredUsers.filter((user) => !user.isLocal)
  const localUsersToRender = filteredUsers.filter((user) => user.isLocal)

  const usersHTML = [
    ...localUsersToRender.map((user) => createUserCard(user, true)),
    ...apiUsersToRender.map((user) => createUserCard(user, false)),
  ].join("")

  userContainer.innerHTML = `<div class="users-grid">${usersHTML}</div>`

  // Reset button state
  reloadBtn.disabled = false
  reloadBtn.innerHTML = `
    <span class="btn-icon">🔄</span>
    <span class="btn-text">Reload Data</span>
  `

  // Update statistics
  updateStats()

  // Add visual effects
  setTimeout(addVisualEffects, 100)

  // Log success
  console.log(
    `Successfully rendered ${filteredUsers.length} users (${apiUsersToRender.length} API + ${localUsersToRender.length} local)`,
  )
}

/**
 * Handle search functionality
 */
function handleSearch() {
  renderAllUsers()
}

/**
 * Load local users from localStorage
 */
function loadLocalUsers() {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    localUsers = stored ? JSON.parse(stored) : []
    console.log(`Loaded ${localUsers.length} local users from storage`)
  } catch (error) {
    console.error("Error loading local users:", error)
    localUsers = []
  }
}

/**
 * Save local users to localStorage
 */
function saveLocalUsers() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localUsers))
    console.log(`Saved ${localUsers.length} local users to storage`)
  } catch (error) {
    console.error("Error saving local users:", error)
    showNotification("Error saving user data", "error")
  }
}

/**
 * Update statistics display
 */
function updateStats() {
  const apiCount = apiUsers.length || 0
  const localCount = localUsers.length || 0
  const total = apiCount + localCount

  // Animate numbers with proper values
  animateNumber(totalUsersEl, total)
  animateNumber(apiUsersEl, apiCount)
  animateNumber(localUsersEl, localCount)

  console.log(`Stats updated - Total: ${total}, API: ${apiCount}, Local: ${localCount}`)
}

/**
 * Animate number counting
 */
function animateNumber(element, target) {
  const current = Number.parseInt(element.textContent) || 0

  // If target is the same as current, no need to animate
  if (current === target) {
    element.textContent = target
    return
  }

  const increment = target > current ? 1 : -1
  const duration = Math.min(1000, Math.abs(target - current) * 50) // Max 1 second
  const steps = Math.abs(target - current)

  if (steps === 0) {
    element.textContent = target
    return
  }

  const stepDuration = Math.max(10, duration / steps) // Min 10ms per step

  let currentValue = current

  const timer = setInterval(() => {
    currentValue += increment
    element.textContent = currentValue

    if (currentValue === target) {
      clearInterval(timer)
    }
  }, stepDuration)
}

/**
 * Add visual effects and animations
 */
function addVisualEffects() {
  // Add staggered animation to cards when they load
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = "1"
          entry.target.style.transform = "translateY(0)"
        }, index * 100)
      }
    })
  })

  // Observe user cards for animation
  document.querySelectorAll(".user-card").forEach((card) => {
    card.style.opacity = "0"
    card.style.transform = "translateY(20px)"
    card.style.transition = "all 0.6s ease-out"
    observer.observe(card)
  })
}

/**
 * Open add user modal
 */
function openAddUserModal() {
  addUserModal.classList.add("show")
  document.body.style.overflow = "hidden"

  // Focus on first input
  setTimeout(() => {
    document.getElementById("userName").focus()
  }, 300)
}

/**
 * Close add user modal
 */
function closeAddUserModal() {
  addUserModal.classList.remove("show")
  document.body.style.overflow = "auto"

  // Reset form
  addUserForm.reset()
}

/**
 * Handle add user form submission
 */
function handleAddUser(event) {
  event.preventDefault()

  const formData = new FormData(addUserForm)

  // Create new user object
  const newUser = {
    id: generateUserId(),
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    phone: formData.get("phone") || "",
    website: formData.get("website") || "",
    address: {
      street: formData.get("street") || "",
      suite: formData.get("suite") || "",
      city: formData.get("city") || "",
      zipcode: formData.get("zipcode") || "",
      geo: {
        lat: "0",
        lng: "0",
      },
    },
    company: {
      name: formData.get("companyName") || "",
      catchPhrase: formData.get("catchPhrase") || "",
    },
    isLocal: true,
    dateAdded: new Date().toISOString(),
  }

  // Add to local users array
  localUsers.unshift(newUser) // Add to beginning for better visibility

  // Save to localStorage
  saveLocalUsers()

  // Re-render all users
  renderAllUsers()

  // Close modal
  closeAddUserModal()

  // Show success notification
  showNotification(`User "${newUser.name}" added successfully! 🎉`, "success")

  console.log("New user added:", newUser)
}

/**
 * Delete a local user
 */
function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
    return
  }

  const userIndex = localUsers.findIndex((user) => user.id === userId)
  if (userIndex === -1) {
    showNotification("User not found", "error")
    return
  }

  const deletedUser = localUsers[userIndex]
  localUsers.splice(userIndex, 1)

  // Save to localStorage
  saveLocalUsers()

  // Re-render all users
  renderAllUsers()

  // Show success notification
  showNotification(`User "${deletedUser.name}" deleted successfully`, "success")

  console.log("User deleted:", deletedUser)
}

/**
 * Show notification
 */
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${getNotificationIcon(type)}</span>
      <span class="notification-message">${message}</span>
    </div>
  `

  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${getNotificationColor(type)};
    color: white;
    padding: 15px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 10000;
    transform: translateX(400px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 400px;
    backdrop-filter: blur(10px);
  `

  // Add to DOM
  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  // Remove after delay
  setTimeout(() => {
    notification.style.transform = "translateX(400px)"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 400)
  }, 4000)
}

/**
 * Get notification icon based on type
 */
function getNotificationIcon(type) {
  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  }
  return icons[type] || icons.info
}

/**
 * Get notification color based on type
 */
function getNotificationColor(type) {
  const colors = {
    success: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    error: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
    warning: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    info: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  }
  return colors[type] || colors.info
}

/**
 * Check if user is online/offline
 */
function checkOnlineStatus() {
  const updateOnlineStatus = () => {
    if (!navigator.onLine) {
      showNotification("You're offline. Only local users will be shown.", "warning")
    }
  }

  window.addEventListener("online", () => {
    showNotification("Connection restored! 🌐", "success")
    fetchUsers()
  })

  window.addEventListener("offline", updateOnlineStatus)

  // Check initial status
  if (!navigator.onLine) {
    updateOnlineStatus()
  }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // Search functionality
  searchInput.addEventListener("input", handleSearch)

  // Form submission
  addUserForm.addEventListener("submit", handleAddUser)

  // Modal close on outside click
  addUserModal.addEventListener("click", (e) => {
    if (e.target === addUserModal) {
      closeAddUserModal()
    }
  })

  // Keyboard shortcuts
  document.addEventListener("keydown", handleKeyboardShortcuts)
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
  // Ctrl/Cmd + R for reload
  if ((event.ctrlKey || event.metaKey) && event.key === "r") {
    event.preventDefault()
    fetchUsers()
  }

  // Ctrl/Cmd + N for new user
  if ((event.ctrlKey || event.metaKey) && event.key === "n") {
    event.preventDefault()
    openAddUserModal()
  }

  // Escape to close modal
  if (event.key === "Escape" && addUserModal.classList.contains("show")) {
    closeAddUserModal()
  }
}

/**
 * Initialize the application
 */
function initializeApp() {
  console.log("🚀 Initializing UserVault Pro...")

  // Load local users from localStorage
  loadLocalUsers()

  // Set up event listeners
  setupEventListeners()

  // Check online status
  checkOnlineStatus()

  // Load users when page loads
  fetchUsers()

  // Add some visual flair
  addVisualEffects()
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeApp)

// Export functions for potential testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    fetchUsers,
    getUserInitials,
    escapeHtml,
    validateUserData,
    handleAddUser,
    deleteUser,
  }
}
