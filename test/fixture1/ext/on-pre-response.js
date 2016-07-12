'use strict'

module.exports = {
  type: 'onPreResponse',
  method(request, reply) {
    if (request.path === '/dog') {
      return reply('woof')
    }
    reply.continue()
  }
}
