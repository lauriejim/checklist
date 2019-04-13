(async () => {
  const $clock = $('.clock')

  const clock = () => {
    const today = new Date()

    const h = prefix(today.getHours())
    const m = prefix(today.getMinutes())
    const s = prefix(today.getSeconds())

    $clock.html(`${h}:${m}:${s}`)

    setTimeout(clock, 500)
  }

  const prefix = (time) => {
    return `${time < 10 ? '0' : ''}${time}`
  }

  clock()
})()