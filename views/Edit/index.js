(async () => {
  const {remote, ipcRenderer} = require('electron')

  const window = remote.getCurrentWindow()

  const [width] = window.getSize()

  const Task = require('../../lib/Task')

  const beforeChecklist = window.checklist

  const checklist = JSON.parse(JSON.stringify(window.checklist || {
    name: '',
    data: []
  }))

  const $ul = $('ul')

  const $inputTask = $('.input-group input')

  const $add = $('[action="add"]')
  const $continue = $('[action="continue"]')
  const $edit = $('[action="edit"]')
  const $save = $('[action="save"]')

  const $modalName = $('[modal="name"]')
  const $inputChecklit = $('input', $modalName)

  const $modalSave = $('[modal="save"]')

  $inputChecklit.val(checklist.name)

  const height = () => {
    return (checklist.data.length || 1) * 49 + 21 + 69
  }

  const scrollBottom = () => {
    $('html, body').animate({
      scrollTop: $(document).height()
    }, 0)
  }

  const resize = () => {
    const newHeigth = height()

    if (newHeigth > 500) {
      scrollBottom()
      return
    }

    window.setSize(width, newHeigth)
    scrollBottom()
  }

  const displayTasks = () => {
    $ul.html('')

    checklist.data.forEach((validation) => {
      const $task = new Task({
        validation,
        action: 'edit',
        remove: (ctx) => {
          const currentIndex = ctx.$.index()

          checklist.data.splice(currentIndex, 1)

          $inputTask.select()

          resize()
        },
        up: (ctx) => {
          const currentIndex = ctx.$.index()

          console.log(currentIndex)

          if (currentIndex === 0) {
            return
          }

          const currentValidation = checklist.data[currentIndex]

          checklist.data.splice(currentIndex, 1)

          checklist.data.splice(currentIndex - 1, 0, currentValidation)

          console.log(checklist.data)

          displayTasks()
        },
        down: (ctx) => {
          const currentIndex = ctx.$.index()

          if (currentIndex === checklist.data.length - 1) {
            return
          }

          const currentValidation = checklist.data[currentIndex]

          checklist.data.splice(currentIndex, 1)

          checklist.data.splice(currentIndex + 1, 0, currentValidation)

          displayTasks()
        }
      })

      $ul.append($task.$)
    })
  }

  resize()

  $inputTask.on('keypress',function (e) {
    if (e.which == 13) {
      $add.click()
    }
  })

  $add.on('click', () => {
    const name = $inputTask.val().trim()

    if (name === '') {
      $inputTask.select()

      return
    }

    checklist.data.push({
      name
    })

    displayTasks()

    $inputTask.val('')
    $inputTask.select()

    resize()
  })

  $inputChecklit.on('keypress',function (e) {
    if (e.which == 13) {
      $continue.click()
    }
  })

  $continue.on('click', () => {
    const name = $inputChecklit.val().trim()

    if (name === '') {
      $inputChecklit.select()

      return
    }

    checklist.name = name

    window.setTitle(`${beforeChecklist ? 'Update' : 'Create'} ${checklist.name} checklist`)

    $modalName.modal('hide')

    $inputTask.select()
  })

  $edit.on('click', () => {
    $modalName.modal('show')

    $inputChecklit.select()
  })

  $save.on('click', () => {
    if (checklist.data.length === 0) {
      return
    }

    ipcRenderer.send('checklist:edit', {
      newChecklist: checklist,
      beforeChecklist
    })

    $('span', $modalSave).html(`Checklist ${beforeChecklist ? 'updated' : 'created'}`)

    $modalSave.modal('show')
    setTimeout(window.close, 2000)
  })

  if (checklist.name) {
    displayTasks()
  } else {
    $edit.click()
  }
})()