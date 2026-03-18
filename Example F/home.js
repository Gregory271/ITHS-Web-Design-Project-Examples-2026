let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// --- Upcoming (from live Jikan API) ---
var upcomingReq = new XMLHttpRequest();
upcomingReq.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        const data = JSON.parse(this.responseText).data;

        for (let i = 0; i < 3; i++) {
            const upcoming_list = document.querySelector('.upcoming-list');
            const list_a = document.createElement('div');
            list_a.className = 'list_a';
            const imgUrl = data[i].images.jpg.image_url;
            list_a.innerHTML = `
                <img class="list_img" src="${imgUrl}">
                <div class="list_info">
                    <h3 class="list_title">${data[i].title}</h3>
                    <h3 class="list_status">Status: ${data[i].status}</h3>
                    <button class="add-fav-btn" data-title="${data[i].title}" data-img="${imgUrl}">⭐ Add to Favorites</button>
                </div>`;
            upcoming_list.appendChild(list_a);
        }
        attachFavoriteListeners();
    }
}
upcomingReq.open("GET", "https://api.jikan.moe/v4/seasons/upcoming", true);
upcomingReq.send();

// --- Navigation ---
document.querySelector('.view').addEventListener('click', () => window.location.href = 'upcoming.html');
document.querySelector('.view2').addEventListener('click', () => window.location.href = 'top.html');
document.querySelector('.fav_button').addEventListener('click', () => window.location.href = 'favorites.html');

// --- Favorites logic ---
function attachFavoriteListeners() {
    document.querySelectorAll('.add-fav-btn').forEach(button => {
        const title = button.dataset.title;

        if (favorites.find(f => f.title === title)) {
            button.textContent = '✅ Added!';
            button.disabled = true;
        }

        button.addEventListener('click', () => {
            favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const img = button.dataset.img;
            if (!favorites.find(f => f.title === title)) {
                favorites.push({ title, img });
                localStorage.setItem('favorites', JSON.stringify(favorites));
                button.textContent = '✅ Added!';
                button.disabled = true;
            } else {
                button.textContent = '✅ Already saved';
                button.disabled = true;
            }
        });
    });
}
