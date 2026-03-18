const backButton = document.querySelector('.back-button');
const grid = document.getElementById('favorites-grid');
const emptyMsg = document.getElementById('empty-msg');
const submitButton = document.querySelector('.form-button');
const titleInput = document.getElementById('titleInput');
const imgInput = document.getElementById('imgInput');

backButton.addEventListener('click', () => {
    window.location.href = 'home.html';
});

function getFavorites() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}

function saveFavorites(favs) {
    localStorage.setItem('favorites', JSON.stringify(favs));
}

function renderFavorites() {
    const favorites = getFavorites();
    grid.innerHTML = '';

    if (favorites.length === 0) {
        emptyMsg.style.display = 'block';
        return;
    }

    emptyMsg.style.display = 'none';

    favorites.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'fav-card';

        const img = document.createElement('img');
        img.className = 'fav-img';
        img.src = item.img || 'https://via.placeholder.com/220x300?text=No+Image';
        img.alt = item.title || 'Favorite Anime';

        const title = document.createElement('div');
        title.className = 'fav-title';
        title.textContent = item.title || 'Untitled';

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '🗑 Remove';
        removeBtn.addEventListener('click', () => {
            const favs = getFavorites();
            favs.splice(index, 1);
            saveFavorites(favs);
            renderFavorites();
        });

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(removeBtn);
        grid.appendChild(card);
    });
}

submitButton.addEventListener('click', () => {
    const title = titleInput.value.trim();
    const img = imgInput.value.trim();

    if (!title) return;

    const favs = getFavorites();
    const alreadyExists = favs.find(f => f.title === title);
    if (!alreadyExists) {
        favs.push({ title, img });
        saveFavorites(favs);
        renderFavorites();
    }

    titleInput.value = '';
    imgInput.value = '';
});

// Initial render
renderFavorites();
