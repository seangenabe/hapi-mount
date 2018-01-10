'use strict'

module.exports = function(request, h) {
  if (request.path === '/dog') {
    return 'woof'
  }
  return h.continue
}
