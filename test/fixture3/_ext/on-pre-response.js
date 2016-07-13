'use strict'

module.exports = function(request, reply) {
  if (request.path === '/dog') {
    return reply('woof')
  }
  reply.continue()
}
