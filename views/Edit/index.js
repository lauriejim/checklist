(async () => {
  const path = require('path')

  const {remote, ipcRenderer} = require('electron')

  const window = remote.getCurrentWindow()

  const [width] = window.getSize()

  const Task = require('../../lib/Task')

  const beforeChecklist = window.checklist

  const checklist = JSON.parse(JSON.stringify(window.checklist || {
    name: '',
    sheduled: false,
    data: []
  }))

  let initSize = false;

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

    if (newHeigth > 500 && !initSize) {
      window.setSize(width, 500)
    }

    if (!initSize) {
      initSize = true;
    }

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

  let configWindow = null

  $edit.on('click', () => {
    if (configWindow) {
      configWindow.focus()
      return
    }

    const BrowserWindow = remote.BrowserWindow

    configWindow = new BrowserWindow({
      title: `${checklist.name} configuration`,
      minimizable: false,
      maximizable: false,
      height: 250,
      width: 500,
      modal: true,
      parent: window,
      checklist
    })

    configWindow.loadFile(path.resolve(__dirname, '..', 'config', 'index.html'))

    configWindow.webContents.on('did-finish-load', () => {
      configWindow.webContents.send('checklist:load', {
        checklist
      })
    })

    configWindow.webContents.on('ipc-message', (event, [channel, args]) => {
      if (channel === 'checklist:config') {
        checklist.name = args.checklist.name
        checklist.scheduled = args.checklist.scheduled

        window.setTitle(checklist.name)
      }
    })

    configWindow.on('closed', function (e) {
      configWindow = null
    })
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