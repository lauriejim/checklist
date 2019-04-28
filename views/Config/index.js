(async () => {
  const {remote, ipcRenderer} = require('electron')

  const window = remote.getCurrentWindow()

  const $name = $('[name="name"]')
  const $schedule = $('[name="schedule"]')
  const $hour = $('[name="hour"]')

  const $continue = $('[action="continue"]')
  const $cancel = $('[action="cancel"]')

  let checklist

  ipcRenderer.on('checklist:load', (event, args) => {
    checklist = args.checklist

    $name.val(checklist.name)

    if (checklist.scheduled) {
      $schedule.click()
      $hour.val(checklist.scheduled)
    }
  })

  $name.focus()

  $schedule.on('change', () => {
    $hour.closest('.row').toggleClass('d-none')
  })

  $continue.on('click', () => {
    const name = $name.val().trim()
    const IS_SCHEDULED = $schedule.is(":checked")
    const hour = $hour.val().trim()

    if (name === '') {
      $name.select()

      return
    }

    checklist.name = name

    IS_VALID_HOUR = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(hour)

    if (IS_SCHEDULED && !IS_VALID_HOUR) {
      $hour.select()

      return
    }

    checklist.scheduled = IS_SCHEDULED ? hour : false

    ipcRenderer.send('checklist:config', {
      checklist
    })

    window.close()
  })

  $cancel.on('click', () => {
    window.close()
  })
})()