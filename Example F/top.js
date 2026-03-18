// favorites is already declared in home.js — do not redeclare it here

var topAnimeReq = new XMLHttpRequest();
topAnimeReq.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
        const data = JSON.parse(this.responseText).data;
        const top_list = document.querySelector('.top-anime-list');

        for (let l = 0; l < 3; l++) {
            const list_b = document.createElement('div');
            list_b.className = 'list_b';
            const imgUrl = data[l].images.jpg.image_url;
            list_b.innerHTML = `
                <img class="list_img" src="${imgUrl}">
                <div class="list_info">
                    <h3 class="list_title">${data[l].title}</h3>
                    <h3 class="list_status">Status: ${data[l].status}</h3>
                    <button class="add-fav-btn" data-title="${data[l].title}" data-img="${imgUrl}">⭐ Add to Favorites</button>
                </div>`;
            top_list.appendChild(list_b);

            const btn = list_b.querySelector('.add-fav-btn');
            const title = btn.dataset.title;

            if (favorites.find(f => f.title === title)) {
                btn.textContent = '✅ Added!';
                btn.disabled = true;
            }

            btn.addEventListener('click', () => {
                favorites = JSON.parse(localStorage.getItem('favorites')) || [];
                const img = btn.dataset.img;
                if (!favorites.find(f => f.title === title)) {
                    favorites.push({ title, img });
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                    btn.textContent = '✅ Added!';
                    btn.disabled = true;
                } else {
                    btn.textContent = '✅ Already saved';
                    btn.disabled = true;
                }
            });
        }
    }
};

topAnimeReq.open("GET", "https://api.jikan.moe/v4/top/anime?sfw", true);
topAnimeReq.send();
