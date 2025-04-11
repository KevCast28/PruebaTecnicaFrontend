/* Declaración de la URL para el consumo del API y variables */
const apiURL = 'https://d8aeba5b-65e8-48d5-8a78-a74f53ec2e9c.mock.pstmn.io/hotels';
const hotelList = document.getElementById('hotelList');
const categoryFilter = document.getElementById('categoryFilter');
const counter = document.getElementById('counter');
const searchInput = document.getElementById('searchInput');
const favoritesOnlyCheckbox = document.getElementById('favoritesOnly');
const sortBy = document.getElementById('sortBy');
let isListView = false;
let currentView = 'grid';

/* Variables para guardar los hoteles y uso de localStorage para mantener
los hoteles marcados como favoritos */
let hotels = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

document.addEventListener('DOMContentLoaded', () => {
    fetchHotels();
    categoryFilter.addEventListener('change', renderHotels);
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', renderHotels);
    const favoritesOnlyCheckbox = document.getElementById('favoritesOnly');
    favoritesOnlyCheckbox.addEventListener('change', renderHotels);
    const sortBy = document.getElementById('sortBy');
    sortBy.addEventListener('change', renderHotels);
    let isListView = false;
    document.getElementById('toggleView').addEventListener('click', () => {
        isListView = !isListView;
        renderHotels();
    });

    /* Función para la búsqueda de hoteles */

    async function fetchHotels() {
        try {
            const response = await fetch(apiURL);
            const data = await response.json();

            const promises = data.map(async hotel => {
                //const validImage = await getValidImageUri(hotel.gallery || []);
                return {
                    id: hotel.id,
                    name: hotel.name,
                    description: hotel.description,
                    city: hotel.address.city,
                    stars: hotel.category.number,
                    image: hotel.gallery.length > 0 ? hotel.gallery[0].uri : 'https://via.placeholder.com/150',
                    category: hotel.category.id
                };
            });

            hotels = await Promise.all(promises);
            renderHotels();
        } catch (error) {
            console.error('Hubo un error al momento de cargar los hoteles:', error);
        }
    }

    function renderHotels() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value;
        const shownOnlyFavorites = favoritesOnlyCheckbox.checked;
        const sortOption = sortBy.value;
        let filteredHotels = hotels;

        if (selectedCategory !== 'all') {
            filteredHotels = hotels.filter(h => h.category == parseInt(selectedCategory));
        }

        if (searchTerm) {
            filteredHotels = filteredHotels.filter(h => {
                const normalize = str => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                return normalize(h.name).includes(normalize(searchTerm));
            });
        }

        if (shownOnlyFavorites) {
            filteredHotels = filteredHotels.filter(h => favorites.includes(h.id));
        }

        if (sortOption === 'ratingAsc') {
            filteredHotels.sort((a, b) => a.stars - b.stars);
        } else if (sortOption === 'ratingDesc') {
            filteredHotels.sort((a, b) => b.stars - a.stars);
        } else {
            filteredHotels = [...hotels]
        }

        counter.textContent = `Mostrando ${filteredHotels.length} de ${hotels.length} hoteles`;
        hotelList.innerHTML = '';

        filteredHotels.forEach(hotel => {
            const isFavorite = favorites.includes(hotel.id);

            const card = document.createElement('div');
            card.className = isListView ? 'list-card' : 'card';

            const cleanDescription = hotel.description.replace(/<\/?[^>]+(>|$)/g, "");

            card.innerHTML = isListView ? `
      ${isFavorite ? `<div class="favorite-label">❤</div>` : ''}
      <img src="${hotel.image}" alt="${hotel.name}" />
      <div class="card-content">
        <h3>${hotel.name}</h3>
        <div class="info-row">
        <span class="stars">${'★'.repeat(hotel.stars)}</span>
        <span class="city">${hotel.city}</span>
        </div>
        <p class="truncate">${cleanDescription}</p>
        <div class="card-actions">
        <button class="info-button" data-id="${hotel.id}">Ver más</button>
        <button class="favorite-button">${isFavorite ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}</button>
        </div>
      </div>
    `
                : `
      ${isFavorite ? `<div class="favorite-label">❤</div>` : ''}
        <img src="${hotel.image}" alt="${hotel.name}" />
      <div class="card-content">
        <h3>${hotel.name}</h3>
        <div class="info-row">
        <span class="stars">${'★'.repeat(hotel.stars)}</span>
        <span class="city">${hotel.city}</span>
        </div>
        <p class="truncate">${cleanDescription}</p>
        <div class="card-actions">
        <button class="info-button" data-id="${hotel.id}">Ver más</button>
        <button class="favorite-button">${isFavorite ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}</button>
        </div>
      </div>
    `;
            card.querySelector('.info-button').addEventListener('click', () => {
                hotelInfoModal(hotel);
            });

            card.querySelector('.favorite-button').addEventListener('click', () => {
                toggleFavorite(hotel.id);
                renderHotels();
            });
            hotelList.appendChild(card);
        });
    }

    /* Función para mostrar el modal */
    function hotelInfoModal(hotel) {
        const modal = document.getElementById('hotelModal');
        const modalDetails = document.getElementById('modalDetails');
        modalDetails.innerHTML = `
        <h2>${hotel.name}</h2>
        <img src="${hotel.image}" alt="${hotel.name}" />
        <p>${hotel.description}</p>
        <div class="info-row">
        <span class="stars">${'★'.repeat(hotel.stars)}</span>
        <span class="city">${hotel.city}</span>
        </div>
    `;

        modal.classList.remove('hidden');
        document.body.classList.add('modal-open');

        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('hotelModal').classList.add('hidden');
            document.body.classList.remove('modal-open');
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.classList.add('hidden');
                document.body.classList.remove('modal-open');
            }
        }
        )
    };


    function toggleFavorite(hotelId) {
        const index = favorites.indexOf(hotelId);

        if (index === -1) {
            favorites.push(hotelId);
        } else {
            favorites.splice(index, 1);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderHotels()
    };
});