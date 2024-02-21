export class RandomSet {
  #items;
  elements;

  constructor() {
    this.#items = {};
    this.elements = [];
  }

  add(item) {
    if (!this.has(item)) {
      this.#items[item] = this.elements.length;
      this.elements.push(item);
    }
  }

  delete(item) {
    if (this.has(item)) {
      const index = this.#items[item];
      delete this.#items[item];
      this.elements[index] = this.elements[this.elements.length - 1]; // Chat GPT is awesome.
      this.elements.pop();
      if (index < this.elements.length) {
        this.#items[this.elements[index]] = index;
      }
    }
  }

  has(item) {
    return item in this.#items;
  }

  getRandom() {
    const randomIndex = Math.floor(Math.random() * this.elements.length);
    return this.elements[randomIndex];
  }
}

export class RandomMap {
  _set;
  map;

  constructor() {
    this._set = new RandomSet();
    this.map = new Map();
  }

  get(key) {
    return this.map.get(key);
  }

  set(key, value) {
    this._set.add(key);
    return this.map.set(key, value);
  }

  delete(key) {
    this._set.delete(key);
    this.map.delete(key);
  }

  size() {
    return this.map.size;
  }

  getRandomKey() {
    return this._set.getRandom();
  }
}
