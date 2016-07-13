'use strict'

module.exports = {
  path: '/',
  method: 'GET',
  handler(request, reply) {
    if (this && this.simple) {
      return reply('hi')
    }
    reply('hello')
  }
}
