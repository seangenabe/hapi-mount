'use strict'

module.exports = {
  type: 'onPreResponse',
  async method(request, h) {
    if (request.path === '/dog') {
      return 'woof'
    }
    return h.continue
  }
}
