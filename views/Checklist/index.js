(async () => {
  const {remote} = require('electron')

  const window = remote.getCurrentWindow()

  const Task = require('../../lib/Task')

  const checklist = window.checklist

  const $ul = $('ul')
  const $modal = $('.modal')

  checklist.data.forEach((validation, index) => {
    const $task = new Task({
      validation,
      action: 'validation',
      check: (ctx) => {
        ctx.$.trigger('disable')
        ctx.$.next().trigger('active')

        if (ctx.$.is(':last-child')) {
          $modal.modal('show')
          setTimeout(window.close, 2000)
        }
      }
    })

    if (index === 0) {
      $task.$.trigger('active')
    }

    $ul.append($task.$)
  })
})()