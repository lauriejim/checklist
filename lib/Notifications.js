const {Notification} = require('electron')

module.exports = async (options = {body: '', sound: true}) => {
  new Notification(options).show()
}