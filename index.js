const { app, Menu, Tray, BrowserWindow, ipcMain, dialog} = require('electron')

const configstore = require('configstore')

const path = require('path')

const Notification = require('./lib/Notifications')

const iconPath = path.resolve(__dirname, 'assets', 'images', 'icon@1x.png')

let appIcon = null

const Storage = new configstore('checklists', {
  checklists: []
})

app.dock.hide()

app.on('ready', () => {
  appIcon = new Tray(iconPath)

  const checklists = Storage.get('checklists')

  const buildMenu = () => {
    const menu = checklists.map((checklist) => {
      return {
        label: checklist.name,
        click: () => displayChecklist(checklist)
      }
    })

    menu.push(
      {type: 'separator'},
      {
        label: 'Create checklist',
        click: () => displayEditChecklist()
      },
      {
        label: "Edit checklist",
        submenu: checklists.map((checklist) => {
          return {
            label: checklist.name,
            click: () => displayEditChecklist(checklist)
          }
        })
      },
      {
        label: "Delete checklist",
        submenu: checklists.map((checklist) => {
          return {
            label: checklist.name,
            click: () => deleteChecklist(checklist)
          }
        })
      },
      {type: 'separator'},
      {role: 'quit'}
    )

    const contextMenu = Menu.buildFromTemplate(menu)

    appIcon.setContextMenu(contextMenu)
  }

  const mainWindow = new BrowserWindow({ show: false })

  let WINDOWS_OPEN = 0

  buildMenu()

  const dock = {
    show: () => {
      if (!WINDOWS_OPEN) {
        app.dock.show()
      }

      WINDOWS_OPEN += 1
    },
    hide: () => {
      WINDOWS_OPEN -= 1

      if (!WINDOWS_OPEN) {
        app.dock.hide()
      }
    }
  }

  const displayChecklist = (checklist) => {
    const height = checklist.data.length * 49 + 21

    let checklistWindow = new BrowserWindow({
      title: `${checklist.name} checklist`,
      width: 400,
      height,
      resizable: false,
      parent: mainWindow
    })

    checklistWindow.loadFile(path.resolve(__dirname, 'views', 'Checklist', 'index.html'))

    dock.show()

    checklistWindow.checklist = checklist

    checklistWindow.on('closed', function (e) {
      checklistWindow = null
      dock.hide()
    })
  }

  displayEditChecklist = (checklist) => {
    let checklistWindow = new BrowserWindow({
      title: checklist ? `Edit ${checklist.name} checklit` : 'Create checklist',
      width: 500,
      resizable: false,
      parent: mainWindow
    })

    checklistWindow.loadFile(path.resolve(__dirname, 'views', 'Edit', 'index.html'))

    dock.show()

    checklistWindow.checklist = checklist

    checklistWindow.on('closed', function (e) {
      checklistWindow = null
      dock.hide()
    })
  }

  const editChecklist = ({newChecklist, beforeChecklist}) => {
    if (!beforeChecklist) {
      checklists.push(newChecklist)
    } else {
      const index = checklists.findIndex((loopChecklist) => {
        return JSON.stringify(loopChecklist) === JSON.stringify(beforeChecklist)
      })

      checklists.splice(index, 1)

      checklists.splice(index, 0, newChecklist)
    }

    Storage.set('checklists', checklists)

    buildMenu()
  }

  const deleteChecklist = (checklist) => {
    const index = checklists.findIndex((loopChecklist) => {
      return JSON.stringify(loopChecklist) === JSON.stringify(checklist)
    })

    checklists.splice(index, 1)

    Storage.set('checklists', checklists)

    buildMenu()
  }

  ipcMain.on('checklist:edit', (e, checklists) => {
    editChecklist(checklists)
  })
})