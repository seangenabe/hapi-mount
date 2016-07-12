'use strict'

module.exports = {
  name: 'getCat',
  options: { callback: false },
  method() {
    return Promise.resolve('meow')
  }
}
