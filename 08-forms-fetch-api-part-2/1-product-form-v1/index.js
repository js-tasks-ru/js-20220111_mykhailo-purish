import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};
  fileInput;
  productData;
  categories;
  constructor (productId) {
    this.productId = productId;
  }

  async fetchData() {
    const urlProduct = new URL('api/rest/products', BACKEND_URL);
    urlProduct.searchParams.set('id', this.productId);

    const urlCategories = new URL('/api/rest/categories', BACKEND_URL);
    urlCategories.searchParams.set('_sort', 'weight');
    urlCategories.searchParams.set('_refs', 'subcategory');

    // const [cat, prod] = await Promise.all(fetchJson(urlCategories), [this.productId ? fetchJson(urlProduct) : []]);
    // [this.productData, this.categories] = await Promise.all([fetchJson(urlProduct), fetchJson(urlCategories)]);

    const cat = await fetchJson(urlCategories);
    if (this.productId) {
      const prod = await fetchJson(urlProduct);
      this.productData = prod[0];
    }
    this.categories = cat;
  }

  fillProductData() {
    let formElements = this.element.querySelectorAll('.form-control');
    formElements.forEach((element) => {
      element.value = this.productData[element.name];
    });
  }

  fillCategories() {
    let selectElement = this.element.querySelector('select[name="subcategory"]');
    this.categories.forEach((category) => {
      if (category.subcategories) {
        category.subcategories.forEach((subcategory) => {
          let option = document.createElement('option');
          option.value = subcategory.id;
          option.text = `${category.title} > ${subcategory.title}`;

          selectElement.append(option);

          if (this.productId && this.productData && subcategory.id === this.productData.subcategory) {
            selectElement.value = subcategory.id;
          }
        });
      }

    });
  }

  getSubElements() {
    const subElements = {};
    const elements = this.element.querySelectorAll('[data-element]');
    elements.forEach(item => {
      subElements[item.dataset.element] = item;
    });
    return subElements;
  }

  async render () {
    await this.fetchData();

    let element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.fillCategories();
    this.subElements = this.getSubElements();
    this.fileInput = this.element.querySelector('#file-input');

    this.addEventListeners();
    if (this.productData) {

      this.fillProductData();
    }

    return this.element;
  }

  addEventListeners() {
    this.element.querySelector('button[name=uploadImage]').addEventListener('click', this.openFileUploadModal);
    this.element.querySelector('button[type=submit]').addEventListener('click', this.onSubmit);
    this.fileInput.addEventListener('change', this.handleFiles);
  }
  removeEventListeners() {
    this.element.querySelector('button[name=uploadImage]').removeEventListener('click', this.openFileUploadModal);
    this.element.querySelector('button[type=submit]').removeEventListener('click', this.onSubmit);
    this.fileInput.removeEventListener('change', this.handleFiles);
  }

  onSubmit = async (event) => {
    event.preventDefault();

    let data = this.collectFormData();

    let response = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
      method: this.productId ? 'PATCH' : 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    this.save();
  }

  collectFormData() {
    let formData = {};
    this.element.querySelectorAll('.form-control').forEach((input) => {
      formData[input.name] = input.value;
    });
    formData.images = [];
    let list = this.element.querySelectorAll('.products-edit__imagelist-item');
    list.forEach((elem) => {
      let inputs =  elem.querySelectorAll('input');
      formData.images.push({url: inputs[0].value, source: inputs[1].value,});
    });
    if (this.productId) {
      formData.id = this.productId;
    }
    formData.price = +formData.price;
    formData.status = +formData.status;
    formData.quantity = +formData.quantity;
    formData.discount = +formData.discount;

    return formData;
  }

  openFileUploadModal = () => {
    this.fileInput.click();
  }

  save() {
    let eventType = this.productId ? 'product-updated' : 'product-saved';
    this.element.dispatchEvent(new CustomEvent(eventType, {
      bubbles: true
    }));
  }

  handleFiles = async () => {
    const file = this.fileInput.files[0];
    let data = new FormData();
    data.append('image', file);
    let url = new URL('3/image', 'https://api.imgur.com');
    this.element.querySelector('button[name=uploadImage]').classList.add('is-loading');
    let response = await fetchJson(url, {
      method: 'POST',
      body: data,
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
      },
      referrer: ''
    });
    this.element.querySelector('button[name=uploadImage]').classList.remove('is-loading');
    this.addImage(file.name, response.data.link);
  }

  addImage(name, link) {
    let element = document.createElement('div');
    element.innerHTML = `<li class="products-edit__imagelist-item sortable-list__item" style="">
      <input type="hidden" name="url" value="${link}">
      <input type="hidden" name="source" value="${name}">
      <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${link}">
        <span>${name}</span>
      </span>
      <button type="button">
        <img src="icon-trash.svg" data-delete-handle="" alt="delete">
      </button>
    </li>`;
    let li = element.firstElementChild;
    this.element.querySelector('.sortable-list').append(li);
  }

  getImages() {
    if (this.productId && this.productData?.images) {
      return this.productData.images.map((image) => `
    <li class="products-edit__imagelist-item sortable-list__item" style="">
      <input type="hidden" name="url" value="${image.url}">
      <input type="hidden" name="source" value="${image.source}">
      <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
        <span>${image.source}</span>
      </span>
      <button type="button">
        <img src="icon-trash.svg" data-delete-handle="" alt="delete">
      </button>
    </li>
    `).join('');
    }
  }

  getTemplate() {
    return `
    <div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" class="form-control" placeholder="Название товара" id="title">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара" id="description"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
        <ul class="sortable-list">
        ${this.productId ? this.getImages() : ''}
          </ul>
        </div>
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory" id="subcategory">
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" class="form-control" placeholder="100" id="price">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" class="form-control" placeholder="0" id="discount">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" placeholder="1" id="quantity">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status" id="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>
    <input id="file-input" type="file" accept="image/*" hidden>
  </div>
  `;
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.removeEventListeners();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
