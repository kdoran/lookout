/* global localStorage */

const splashboardPrefix = 'splashboard::'

export default {
  getRecent (id) {
    let recent
    try {
      recent = JSON.parse(localStorage.getItem(splashboardPrefix + id)) || []
    } catch (e) {
      recent = []
    }
    return recent
  },

  saveRecent (id, item) {
    let recent = this.getRecent(id)
    if (!recent.includes(item)) {
      recent.unshift(item)
      recent = recent.slice(0, 9)
    }
    return localStorage.setItem(splashboardPrefix + id, JSON.stringify(recent))
  },

  get (id) {
    let item
    try {
      item = JSON.parse(localStorage.getItem(splashboardPrefix + id))
    } catch (e) {
      item = null
    }
    return item
  },

  set (id, item) {
    return localStorage.setItem(splashboardPrefix + id, JSON.stringify(item))
  },

  destroy (id) {
    localStorage.removeItem(splashboardPrefix + id)
  }
}
