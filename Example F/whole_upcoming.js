let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

var upcoming = new XMLHttpRequest();
upcoming.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        const data = JSON.parse(this.responseText).data;
        const count = Math.min(21, data.length);

        for (let i = 0; i < count; i++) {
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

            const btn = list_a.querySelector('.add-fav-btn');
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
}
upcoming.open("GET", "https://api.jikan.moe/v4/seasons/upcoming", true);
upcoming.send();

document.querySelector('.back-button').addEventListener('click', () => window.location.href = 'home.html');
