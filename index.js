const electron = require('electron');
const updater = require('./updater');

const { app, BrowserWindow, autoUpdater } = electron;
// const server = "https://updater-test.holland74.now.sh";
// const feed = `${server}/update/${process.platform}/${app.getVersion()}`;

// autoUpdater.setFeedURL(feed);

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({ webpreferences: { nodeIntegration: true } });
    mainWindow.loadFile("index.html");
    mainWindow.on('closed', () => app.quit());

    setTimeout(updater.check, 2000);
});

// autoUpdater.on('update-downloaded', () => {
    // autoUpdater.quitAndInstall();
// });

// setInterval(() => {
    // autoUpdater.checkForUpdates();
// }, 20000);