import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from "axios";

const form = document.querySelector('#form');
const loader = document.querySelector('.loader');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-btn');
let page = 1;
let perPage = 15;
let userInput = '';

const options = {
  captions: true,
  captionSelector: 'img',
  captionType: 'attr',
  captionsData: 'alt',
  captionPosition: 'bottom',
  animation: 250,
  widthRatio: 0.9,
  scaleImageToRatio: true,
};

loader.style.display = 'none';
loadMoreBtn.style.display = 'none';

document.addEventListener('DOMContentLoaded', () => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    userInput = document.getElementById('search').value.trim();

    if (!userInput) {
      return;
    }

    loader.style.display = 'inline-block';
    loadMoreBtn.style.display = 'block';
    gallery.innerHTML = '';

    try {
      const response = await axios.get(`https://pixabay.com/api/?key=42026920-e619b387ca2127f1aff40b8e2&q=${userInput}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=15`);
      const data = response.data;
      handleResponse(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      loader.style.display = 'none';
    }
  });

  loadMoreBtn.addEventListener('click', loadMoreImages);

  async function loadMoreImages() {
    page += 1;
    loader.style.display = 'inline-block';
  
    try {
      const response = await axios.get(`https://pixabay.com/api/?key=42026920-e619b387ca2127f1aff40b8e2&q=${userInput}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`);
      const data = response.data;
      handleResponse(data);
      smoothScroll();
      if (page * perPage >= data.totalHits) {
        hideLoadMoreButton()
        showEndMessage();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      loader.style.display = 'none';
    }
  }
  
  function showEndMessage() {
    loadMoreBtn.style.display = 'none';
    iziToast.error({
      title: '',
      backgroundColor: '#EF4040',
      message: "We're sorry, but you've reached the end of search results.",
      position: 'topRight'
    })
  }

  function smoothScroll() {
    const galleryItemHeight = document.querySelector('.gallery-item').getBoundingClientRect().height;

    window.scrollBy({
      top: galleryItemHeight * 2,
      behavior: 'smooth'
    });
  }

  function handleResponse(data) {
    if (data.hits.length === 0) {
      loadMoreBtn.style.display = 'none';
      iziToast.error({
        title: '',
        backgroundColor: '#EF4040',
        message: 'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight'
      });
    } else {
      const markup = data.hits
        .map(data => {
          return `<li class="gallery-item"><a href="${data.webformatURL}">
          <img class="gallery-image" src="${data.webformatURL}" alt="${data.tags}"></a>
          <div class='comments'>
          <p><b>Likes: </b>${data.likes}</p>
          <p><b>Views: </b>${data.views}</p>
          <p><b>Comments: </b>${data.comments}</p>
          <p><b>Downloads: </b>${data.downloads}</p>
          </div>
          </li>`;
        })
        .join('');
      gallery.insertAdjacentHTML('beforeend', markup);
      const lightbox = new SimpleLightbox('.gallery a', options);
      lightbox.refresh();
      form.reset();
    }
  }
});