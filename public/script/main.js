"use strict";

document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    navigateTo(window.location.hash || "#home");
});

function setupNavigation() {
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            const targetHash = e.target.getAttribute('href') || e.target.dataset.link;
            navigateTo(targetHash);
        }
    });

    window.addEventListener("popstate", () => {
        navigateTo(window.location.hash);
    });
}

function navigateTo(urlOrHash) {
    let hash = urlOrHash.includes('#') ? urlOrHash.split('#')[1] : urlOrHash;
    hash = hash || "home";
    loadTemplate(`tl${capitalize(hash)}`);
    history.pushState(null, null, `#${hash}`);
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

async function loadTemplate(templateId) {
    const templateElement = document.getElementById(templateId);
    const divContent = document.getElementById("divContent");

    if (!templateElement) {
        console.error(`Template ${templateId} not found`);
        return;
    }

    divContent.innerHTML = '';
    divContent.appendChild(templateElement.content.cloneNode(true));

    if (templateId === "tlProfile") {
        fetchUserProfileInfo();
        setTimeout(() => {
            setupProfileForm();
            setupDeleteAccountButton();
        }, 100);
    } else if (templateId === "tlPostsList") {
        fetchAndDisplayArticles();
    } else if (templateId === "tlLogin") {
        setupLoginForm();
    } else if (templateId === "tlRegister") {
        setupRegisterForm();
    }
    if (templateId === "tlCreatePost") {
        setupCreatePostForm();
    }
}

function setupLoginForm() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;
            const data = { email, password };

            try {
                const response = await postTo("/login", data);
                const resData = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', resData.token); 

                    navigateTo("#profile"); 
                } else {
                    console.error("Login failed:", resData.message);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            }
        });
    } else {
        console.error("LoginForm not found");
    }
}

function setupDeleteAccountButton() {
    const deleteBtn = document.getElementById('deleteAccountBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            const confirmation = confirm('Are you sure you want to delete your account? This action cannot be undone.');
            if (confirmation) {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert('User is not logged in.');
                    return;
                }
                try {
                    const response = await fetch('/user/delete', {
                        method: "DELETE",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        console.log("Account deleted successfully.");
                        localStorage.clear();
                        navigateTo('#home'); 
                    } else {
                        console.error("Failed to delete account.");
                        alert('Failed to delete account.');
                    }
                } catch (error) {
                    console.error("Error deleting account:", error);
                }
            }
        });
    } else {
        console.error("Delete account button not found.");
    }
}

async function fetchUserProfileInfo() {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('Token not found. User might not be logged in.');
        return;
    }

    try {
        const response = await fetch('/user/profile', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const userInfo = await response.json();

            if(userInfo.username) { 
                document.querySelector('.profile-username').textContent = userInfo.username;
            }
            if(userInfo.email) {
                document.querySelector('.profile-email').textContent = userInfo.email;
            }
            if(userInfo.about) {
                document.querySelector('#about').textContent = userInfo.about;
            }
            
        } else {
            console.error('Failed to fetch user profile:', response.status);
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

function setupForm(templateId) {
    let formId;
    let actionUrl;

    switch (templateId) {
        case "tlLogin":
            formId = "loginForm";
            actionUrl = "/login";
            break;
        case "tlRegister":
            formId = "registerForm";
            actionUrl = "/user";
            break;
        case "tlCreatePost":
            formId = "createPostForm";
            actionUrl = "/api/posts"; 
            break;
        default:
            console.error("Unknown templateId:", templateId);
            return;
    }

    const form = document.getElementById(formId);
    if (!form) {
        console.error(`Form with ID ${formId} not found`);
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        let data = new FormData(form);
        if (templateId === "tlCreatePost") {
            e.preventDefault(); 
        
            
            const userId = localStorage.getItem('userId'); 
            const title = document.getElementById('postTitle').value;
            const content = document.getElementById('postContent').value;
            const data = { userId, title, content }; 
            const token = localStorage.getItem('token');
        
           
            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            };
        
            try {
                const response = await postTo(actionUrl, data, headers); 
                if (response.ok) {
                    const resData = await response.json();
    
                   
                } else {
                    console.error("Failed to create post:", await response.text());
                }
            } catch (error) {
                console.error("Fetch error:", error);
            }
        }

        data = Object.fromEntries(data.entries());

        try {
            const response = await postTo(actionUrl, data);
            if (response.ok) {
                const resData = await response.json()
                
            } else {
                console.error("Error submitting form:", await response.text());
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    });
}


document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
    navigateTo(window.location.hash || "#home");
    setupForm(); 
});

function setupCreatePostForm() {
    const createPostForm = document.getElementById("createPostForm");
    if (createPostForm) {
        createPostForm.addEventListener("submit", async (e) => {
            e.preventDefault();

           
            const title = document.getElementById('postTitle').value;
            const content = document.getElementById('postContent').value;
            const data = { title, content }; 
            
            
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No authentication token found. Please login.");
                return; 
            }

           
            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            };

            try {
                const response = await postTo("/api/posts", data, headers);
                if (response.ok) {
                    
                    console.log("Post created successfully");
                    
                } else {
                    
                    console.error("Failed to create post:", await response.text());
                }
            } catch (error) {
                console.error("Error submitting the create post form:", error);
            }
        });
    }
}


function setupProfileForm() {
    const profileForm = document.getElementById("profileForm");
    if (profileForm) { 
        profileForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("User is not logged in.");
                return;
            }
            
            const formData = new FormData(profileForm);
            const data = Object.fromEntries(formData.entries());

            const response = await fetch('/user/profile/update', {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                console.log("Profile updated successfully.");
            } else {
                console.error("Failed to update profile.");
            }
        });
    } else {
        console.error("Profile form not found. Make sure you are on the profile page.");
    }
}

function setupRegisterForm() {
    const registerForm = document.getElementById("registerForm");
    if (!registerForm) {
        console.error("RegisterForm not found");
        return;
    }

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const data = { username, email, password };

        try {
            const response = await postTo("/user", data); 
            const resData = await response.json();

            if (response.ok) {
                
                console.log("Registration successful");
                navigateTo("#login"); 
            } else {
                console.error("Registration failed:", resData.message);
            }
        } catch (error) {
            console.error("Fetch error during registration:", error);
        }
    });
}

async function fetchAndDisplayArticles() {
    try {
        const response = await fetch('http://localhost:8080/api/posts');
        if (!response.ok) {
            throw new Error(`Failed to fetch articles: ${response.statusText}`);
        }
        const articles = await response.json();
        renderArticles(articles);
    } catch (error) {
        console.error('Error loading articles:', error.message);
    }
}

function renderArticles(articles) {
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) {
        console.error('Posts container not found');
        return;
    }
    postsContainer.innerHTML = ''; // Clear previous content
    articles.forEach(article => {
        const articleElement = document.createElement('div');
        articleElement.className = 'article';
        articleElement.innerHTML = `
            <h3>${article.title}</h3>
            <p>${article.content.substring(0, 200)}...</p> <!-- Show a preview -->
            <small>Posted on ${new Date(article.postdate).toLocaleDateString()}</small>
        `;
        postsContainer.appendChild(articleElement);
    });
}

function setupDeleteAccountButton() {
    const deleteBtn = document.getElementById('deleteAccountBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            const confirmation = confirm('Are you sure you want to delete your account? This action cannot be undone.');
            if (!confirmation) return;
            
            const token = localStorage.getItem('token');
            if (!token) {
                alert('User is not logged in.');
                return;
            }
        
          
            const userId = localStorage.getItem('userId');        
            try {
                const response = await fetch(`/user/delete/${userId}`, { 
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
        
                if (response.ok) {
                    console.log("Account deleted successfully.");
                    localStorage.clear();
                    navigateTo('#home');
                } else {
                    console.error("Failed to delete account:", await response.text());
                    alert('Failed to delete account.');
                }
            } catch (error) {
                console.error("Error deleting account:", error);
            }
        });
        
    } else {
        console.error("Delete account button not found.");
    }
}



async function postTo(url, data, headers = { "Content-Type": "application/json" }) {
    return await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(data),
    });
}
