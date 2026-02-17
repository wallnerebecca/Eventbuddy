export default class Filters {

    #filters

    constructor() {
        this.#filters = new Map()
    }

    getFilterValues(key) {
        return this.#filters.get(key) || [];
    }

    setFilterValues(key, values) {
        this.#filters.set(key, values);
    }
}
