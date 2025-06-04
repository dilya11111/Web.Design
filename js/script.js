// ===== Common Functions =====
function showTab(tabName, event) {
  document.querySelectorAll('.auth-form').forEach(form => {
    form.classList.remove('active');
  });
  document.getElementById(tabName + '-form').classList.add('active');

  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  event.currentTarget.classList.add('active');
}

// ===== Notification System =====
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span class="notification-icon">${type === 'success' ? '✓' : '!'}</span>
    <span class="notification-text">${message}</span>
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ===== Forms Handling =====
function setupForms() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('#email').value;
      const password = this.querySelector('#password').value;
      
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        showNotification('Successfully logged in!', 'success');
        localStorage.setItem('currentUser', JSON.stringify(user));
        setTimeout(() => window.location.href = 'user.html', 1000);
      } else {
        showNotification('Invalid email or password', 'error');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('#reg-email').value;
      const password = this.querySelector('#reg-password').value;
      const confirmPassword = this.querySelector('#confirm-password').value;
      
      // Validate email
      if (!email.includes('@') || !email.includes('.')) {
        showNotification('Please enter a valid email address', 'error');
        return;
      }
      
      // Validate password length
      if (password.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
      }
      
      // Validate password match
      if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
      }
      
      // Store user data
      const users = JSON.parse(localStorage.getItem('users')) || [];
      if (users.some(u => u.email === email)) {
        showNotification('Email already registered', 'error');
        return;
      }
      
      users.push({ email, password });
      localStorage.setItem('users', JSON.stringify(users));
      
      showNotification('Registration successful! Please log in.', 'success');
      showTab('login', { currentTarget: document.querySelector('.auth-tab[onclick*="login"]') });
    });
  }
}

// ===== Recipe Data =====
const recipes = [
  {
    id: 1,
    title: "Italian Pasta",
    time: "25 min",
    servings: "4 servings",
    description: "Classic pasta with fresh tomatoes, basil and garlic in olive oil sauce.",
    image: "https://img02.rl0.ru/afisha/e750x-i/daily.afisha.ru/uploads/images/c/a6/ca6bb747276e966055c63042996905d9.jpg",
    category: "dinner",
    calories: 560
  },
  {
    id: 2,
    title: "Pancakes",
    time: "15 min",
    servings: "2 servings",
    description: "Fluffy pancakes with maple syrup and fresh berries.",
    image: "https://potionsquirrel.ru/wp-content/uploads/2017/06/Gluten-free-pancakes-7.jpg",
    category: "breakfast",
    calories: 350
  },
  {
    id: 3,
    title: "Caesar Salad",
    time: "20 min",
    servings: "2 servings",
    description: "Fresh romaine lettuce with croutons, parmesan and Caesar dressing.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVXnOpnE8jTpMO0CUU5oIAw_TBRoU35qnRP2L_oGAffQ&s&ec=72940545",
    category: "lunch",
    calories: 320
  },
  {
    id: 4,
    title: "Chocolate Cake",
    time: "60 min",
    servings: "8 servings",
    description: "Decadent chocolate cake with rich buttercream frosting.",
    image: "https://recipes.av.ru//media/recipes/100668_picture_7qqxPo4.jpg",
    category: "dessert",
    calories: 450
  }
];

// ===== Recipe Display Functions =====
function loadRecipes() {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  
  container.innerHTML = recipes.map(recipe => `
    <div class="col-md-4 mb-4">
      <div class="recipe-card" data-category="${recipe.category}">
        <img src="${recipe.image}" alt="${recipe.title}" class="recipe-img" loading="lazy">
        <div class="recipe-info">
          <h3 class="recipe-title">${recipe.title}</h3>
          <div class="recipe-meta">
            <span><i class="fas fa-clock"></i> ${recipe.time}</span>
            <span><i class="fas fa-utensils"></i> ${recipe.servings}</span>
          </div>
          <p>${recipe.description}</p>
          <div class="d-flex justify-content-between">
            <a href="recipe-detail.html?id=${recipe.id}" class="btn btn-primary">View Recipe</a>
            <button class="like-btn" data-id="${recipe.id}"><i class="far fa-heart"></i></button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  setupLikeButtons();
}

// ===== Like Buttons =====
function setupLikeButtons() {
  document.querySelectorAll('.like-btn').forEach(btn => {
    const recipeId = btn.dataset.id;
    const recipe = recipes.find(r => r.id == recipeId);
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    // Check if recipe is already favorited
    if (favorites.some(fav => fav.id == recipeId)) {
      btn.innerHTML = '<i class="fas fa-heart"></i>';
      btn.classList.add('liked');
    }
    
    btn.addEventListener('click', function() {
      const icon = this.querySelector('i');
      icon.classList.toggle('far');
      icon.classList.toggle('fas');
      
      if (icon.classList.contains('fas')) {
        addToFavorites(recipe);
        showNotification('Added to favorites!', 'success');
      } else {
        removeFromFavorites(recipeId);
        showNotification('Removed from favorites', 'success');
      }
    });
  });
}

function addToFavorites(recipe) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.some(fav => fav.id === recipe.id)) {
    favorites.push(recipe);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}

function removeFromFavorites(recipeId) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites = favorites.filter(fav => fav.id != recipeId);
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

document.addEventListener('DOMContentLoaded', () => {
            // Load favorites from localStorage
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const container = document.getElementById('favorites-container');
            const emptyState = document.querySelector('.empty-state');
            
            if (favorites.length === 0) {
                emptyState.style.display = 'block';
            } else {
                emptyState.style.display = 'none';
                container.innerHTML = favorites.map(recipe => `
                    <div class="recipe-card">
                        <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image" height="350" loading="lazy">
                        <div class="recipe-content">
                            <div class="recipe-meta">
                                <span class="time"><i class="far fa-clock"></i> ${recipe.time}</span>
                                <span class="servings"><i class="fas fa-utensils"></i> ${recipe.servings}</span>
                            </div>
                            <h3>${recipe.title}</h3>
                            <p class="recipe-desc">${recipe.description}</p>
                            <div class="recipe-actions">
                                <a href="recipes.html#${recipe.id}" class="btn btn-view">View Recipe</a>
                                <button class="btn btn-remove"><i class="fas fa-trash"></i> Remove</button>
                            </div>
                        </div>
                    </div>
                `).join('');
                
                // Setup remove buttons
                document.querySelectorAll('.btn-remove').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const title = this.closest('.recipe-card').querySelector('h3').textContent;
                        removeFromFavorites(title);
                        this.closest('.recipe-card').remove();
                        showNotification('Removed from favorites', 'success');
                        
                        // Show empty state if no favorites left
                        if (document.querySelectorAll('.recipe-card').length === 0) {
                            emptyState.style.display = 'block';
                        }
                    });
                });
            }
        });

// ===== Remove Favorite Buttons =====
function setupRemoveButtons() {
  document.querySelectorAll('.btn-remove').forEach(button => {
    button.addEventListener('click', function() {
      const card = this.closest('.recipe-card');
      const recipeId = card.dataset.id;
      
      card.style.transition = 'all 0.3s';
      card.style.opacity = '0';
      setTimeout(() => {
        card.remove();
        removeFromFavorites(recipeId);
        
        // Update like buttons on recipes page
        document.querySelectorAll(`.like-btn[data-id="${recipeId}"]`).forEach(btn => {
          btn.innerHTML = '<i class="far fa-heart"></i>';
        });
        
        // Show empty state if no favorites left
        const emptyState = document.querySelector('.empty-state');
        if (document.querySelectorAll('.recipe-card').length === 0 && emptyState) {
          emptyState.style.display = 'block';
        }
      }, 300);
    });
  });
}

// ===== Random Recipe Generator =====
function getRandomRecipe() {
  return recipes[Math.floor(Math.random() * recipes.length)];
}

function displayRandomRecipe() {
  const recipe = getRandomRecipe();
  document.getElementById('random-result').innerHTML = `
    <div class="random-recipe-card card">
      <img src="${recipe.image}" class="random-recipe-img card-img-top" alt="${recipe.title}" loading="lazy">
      <div class="card-body">
        <h3 class="card-title">${recipe.title}</h3>
        <div class="my-2">
          <span><i class="fas fa-clock"></i> ${recipe.time}</span> | 
          <span><i class="fas fa-utensils"></i> ${recipe.servings}</span>
        </div>
        <p class="card-text">${recipe.description}</p>
        <a href="recipe-detail.html?id=${recipe.id}" class="btn btn-primary">View Recipe</a>
      </div>
    </div>
  `;
}
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('generate-btn');
  if (btn) btn.addEventListener('click', displayRandomRecipe);
});

// ===== Recipe Filtering =====
function setupRecipeFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const parent = this.parentElement;
      parent.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      
      this.classList.add('active');
      const category = this.dataset.category;
      filterRecipes(category);
    });
  });
}

function filterRecipes(category) {
  const recipeCards = document.querySelectorAll('.recipe-card');
  
  recipeCards.forEach(card => {
    if (category === 'all') {
      card.style.display = 'block';
    } else {
      const cardCategory = card.dataset.category || '';
      if (cardCategory.toLowerCase().includes(category)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    }
  });
}

// ===== Burger Menu Toggle =====
function setupBurgerMenu() {
  const toggler = document.querySelector('.navbar-toggler');
  const menu = document.querySelector('.navbar-collapse');
  const overlay = document.createElement('div');
  overlay.className = 'menu-overlay';
  document.body.appendChild(overlay);

  if (toggler && menu) {
    toggler.addEventListener('click', function() {
      this.classList.toggle('active');
      menu.classList.toggle('show');
      overlay.classList.toggle('active');
    });
    
    // Close when clicking outside
    overlay.addEventListener('click', function() {
      toggler.classList.remove('active');
      menu.classList.remove('show');
      this.classList.remove('active');
    });
  }
}
document.addEventListener("DOMContentLoaded", function () {
  const toggler = document.querySelector(".navbar-toggler");
  const nav = document.querySelector(".navbar-nav");

  if (toggler && nav) {
    toggler.addEventListener("click", () => {
      nav.classList.toggle("active");
    });
  }
});


// ===== Load Favorites =====
function loadFavorites() {
  const container = document.getElementById('favorites-container');
  if (!container) return;
  
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const emptyState = document.querySelector('.empty-state');
  
  if (favorites.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  
  container.innerHTML = favorites.map(recipe => `
    <div class="recipe-card" data-id="${recipe.id}">
      <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image" loading="lazy">
      <div class="recipe-content">
        <div class="recipe-meta">
          <span class="time"><i class="far fa-clock"></i> ${recipe.time}</span>
          <span class="servings"><i class="fas fa-utensils"></i> ${recipe.servings}</span>
        </div>
        <h3>${recipe.title}</h3>
        <p class="recipe-desc">${recipe.description}</p>
        <div class="recipe-actions">
          <a href="recipe-detail.html?id=${recipe.id}" class="btn btn-view">View Recipe</a>
          <button class="btn btn-remove"><i class="fas fa-trash"></i> Remove</button>
        </div>
      </div>
    </div>
  `).join('');
  
  setupRemoveButtons();
}

// ===== Initialize User Page =====
function setupUserPage() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser && window.location.pathname.includes('user.html')) {
    window.location.href = 'profile.html';
    return;
  }
  
  if (currentUser) {
    document.getElementById('user-email').textContent = currentUser.email;
    document.getElementById('profile-email').value = currentUser.email;
    
    // Set mock join date
    const joinDate = new Date();
    document.getElementById('join-date').textContent = joinDate.getFullYear();
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', () => {
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    });
  }
}
document.addEventListener('DOMContentLoaded', () => {
    // Elements for tab switching
    const showLoginBtn = document.getElementById('show-login');
    const showRegisterBtn = document.getElementById('show-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authSection = document.getElementById('auth-section');
    const profileSection = document.getElementById('profile-section');

    // Profile elements
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const profilePhone = document.getElementById('profile-phone');
    const profileAddress = document.getElementById('profile-address');
    const profileJoinDate = document.getElementById('profile-join-date');

    // Registration errors
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const confirmError = document.getElementById('confirm-error');
    const loginError = document.getElementById('login-error');

    // Show login form
    function showLogin() {
        showLoginBtn.classList.add('active');
        showRegisterBtn.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        loginError.style.display = 'none';
        clearRegisterErrors();
    }

    // Show register form
    function showRegister() {
        showLoginBtn.classList.remove('active');
        showRegisterBtn.classList.add('active');
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        loginError.style.display = 'none';
        clearRegisterErrors();
    }

    // Clear registration errors
    function clearRegisterErrors() {
        emailError.style.display = 'none';
        passwordError.style.display = 'none';
        confirmError.style.display = 'none';
    }

    showLoginBtn.addEventListener('click', showLogin);
    showRegisterBtn.addEventListener('click', showRegister);

    // Validate email format
    function isValidEmail(email) {
        return /\S+@\S+\.\S+/.test(email);
    }

    // Registration form submit
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const fullname = document.getElementById('reg-fullname').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        const phone = document.getElementById('reg-phone').value.trim();
        const address = document.getElementById('reg-address').value.trim();

        clearRegisterErrors();

        if (!isValidEmail(email)) {
            emailError.style.display = 'block';
            return;
        }

        if (password.length < 8) {
            passwordError.style.display = 'block';
            return;
        }

        if (password !== confirmPassword) {
            confirmError.style.display = 'block';
            return;
        }

        let users = JSON.parse(localStorage.getItem('users')) || [];

        // Check if email exists
        if (users.some(u => u.email === email)) {
            alert('User with this email is already registered!');
            return;
        }

        const newUser = {
            fullname,
            email,
            password,
            phone,
            address,
            joinDate: new Date().toLocaleDateString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        alert('Registration successful! You can now login.');

        registerForm.reset();
        showLogin();
    });

    // Login form submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        loginError.style.display = 'none';

        let users = JSON.parse(localStorage.getItem('users')) || [];

        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            loginError.textContent = 'Invalid email or password.';
            loginError.style.display = 'block';
            return;
        }

        // Show profile section and fill data
        authSection.style.display = 'none';
        profileSection.style.display = 'block';

        profileName.textContent = user.fullname;
        profileEmail.textContent = user.email;
        profilePhone.textContent = user.phone ? `Phone: ${user.phone}` : '';
        profileAddress.textContent = user.address ? `Address: ${user.address}` : '';
        profileJoinDate.textContent = user.joinDate;
    });

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', () => {
        profileSection.style.display = 'none';
        authSection.style.display = 'block';
        loginForm.reset();
        registerForm.reset();
        showLogin();
    });

    // Show login form by default on page load
    showLogin();
});


// ===== DOM Content Loaded =====
document.addEventListener('DOMContentLoaded', () => {
  setupForms();
  setupLikeButtons();
  setupRemoveButtons();
  setupRecipeFilters();
  setupBurgerMenu();
  loadRecipes();
  loadFavorites();
  setupUserPage();
  
  // Random recipe generator
  const btn = document.getElementById('generate-btn');
  if (btn) btn.addEventListener('click', displayRandomRecipe);
  
  // Display random recipe on page load for demo
  if (document.getElementById('random-result') && !document.getElementById('random-result').innerHTML) {
    displayRandomRecipe();
  }
});