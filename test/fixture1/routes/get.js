'use strict'

module.exports = {
  path: '/',
  method: 'GET',
  handler(request) {
    if (this && this.simple) {
      return 'hi'
    }
    return 'hello'
  }
}
