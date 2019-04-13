const { app, Menu, Tray, BrowserWindow, ipcMain, dialog} = require('electron')

const configstore = require('configstore')

const path = require('path')

const iconPath = path.resolve(__dirname, 'assets', 'images', 'icon@1x.png')

let appIcon = null

const Storage = new configstore('checklists', {
  checklists: []
})

app.on('ready', () => {
  appIcon = new Tray(iconPath)

  const checklists = Storage.get('checklists')

  const menu = Menu.buildFromTemplate([{
    label: app.getName(),
    submenu: [
      {role: 'about'},
      {role: 'quit'}
    ]
  }, {
    label: 'Edit',
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'pasteandmatchstyle'},
      {role: 'delete'},
      {role: 'selectall'}
    ]
  },
  {
    label: 'View',
    submenu: [
      {role: 'reload'},
      {role: 'forcereload'},
      {role: 'toggledevtools'},
      {type: 'separator'},
      {role: 'resetzoom'},
      {role: 'zoomin'},
      {role: 'zoomout'},
      {type: 'separator'},
      {role: 'togglefullscreen'}
    ]
  }])

  Menu.setApplicationMenu(menu)

  const buildContextMenu = () => {
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

  const mainWindow = new BrowserWindow({
    title: '📝 Checklist',
    titleBarStyle: 'hidden',
    minimizable: false,
    maximizable: false,
    height: 300,
    width: 500
  })

  mainWindow.loadFile(path.resolve(__dirname, 'views', 'Home', 'index.html'))

  buildContextMenu()

  const displayChecklist = (checklist) => {
    const height = checklist.data.length * 49 + 21

    let checklistWindow = new BrowserWindow({
      title: `${checklist.name} checklist`,
      minimizable: false,
      maximizable: false,
      width: 400,
      height,
      resizable: false,
      parent: mainWindow
    })

    checklistWindow.loadFile(path.resolve(__dirname, 'views', 'Checklist', 'index.html'))

    checklistWindow.checklist = checklist

    checklistWindow.on('closed', function (e) {
      checklistWindow = null
    })
  }

  displayEditChecklist = (checklist) => {
    let checklistWindow = new BrowserWindow({
      title: checklist ? `Edit ${checklist.name} checklit` : 'Create checklist',
      minimizable: false,
      maximizable: false,
      width: 500,
      resizable: false,
      parent: mainWindow
    })

    checklistWindow.loadFile(path.resolve(__dirname, 'views', 'Edit', 'index.html'))

    checklistWindow.checklist = checklist

    checklistWindow.on('closed', function (e) {
      checklistWindow = null
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

    buildContextMenu()
  }

  const deleteChecklist = (checklist) => {
    const index = checklists.findIndex((loopChecklist) => {
      return JSON.stringify(loopChecklist) === JSON.stringify(checklist)
    })

    const confirm = dialog.showMessageBox({
      type: 'info',
      buttons: ['Cancel', 'Confirm'],
      message: 'Confirm deletion',
      detail: `${checklists[index].name} checklist`
    })

    if (!confirm) {
      return
    }

    checklists.splice(index, 1)

    Storage.set('checklists', checklists)

    buildContextMenu()
  }

  ipcMain.on('checklist:edit', (e, checklists) => {
    editChecklist(checklists)
  })
})