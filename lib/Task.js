module.exports = function (options) {
  const ctx = this

  ctx.$ = $(`
    <li class="list-group-item">
      <div class="form-check d-flex">
        <input class="form-check-input" type="checkbox" ${options.action === 'edit' ? 'disabled' : ''}>
        <label class="form-check-label pl-2">
          ${options.validation.name}
        </label>
        ${
          options.action === 'edit'
          ? `
            <span class="ml-auto d-flex align-items-center text-secondary">
              <span><i class="fa fa-arrow-up" action="up"></i></span>
              <span class="ml-3"><i class="fa fa-arrow-down" action="down"></i></span>
              <span class="ml-3"><i class="fa fa-minus" action="remove"></i></span>
            </span>
          `
          : ''
        }
      </div>
    </li>
  `)

  ctx.$.on('ckeck', () => {
    $('input', ctx.$).attr('checked', true)
  })

  ctx.$.on('active', () => {
    ctx.$.addClass('active').removeClass('disabled')
  })

  ctx.$.on('disable', () => {
    ctx.$.addClass('disabled').removeClass('active')
  })

  $('[type="checkbox"]', ctx.$).on('click', () => {
    if (options.check) {
      options.check(ctx)
    }
  })

  $('[action="remove"]', ctx.$).on('click', () => {
    if (options.remove) {
      options.remove(ctx)
    }

    ctx.$.remove()
  })

  $('[action="up"]', ctx.$).on('click', () => {
    if (options.up) {
      options.up(ctx)
    }
  })

  $('[action="down"]', ctx.$).on('click', () => {
    if (options.down) {
      options.down(ctx)
    }
  })
}