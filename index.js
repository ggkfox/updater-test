const electron = require('electron');
const sq = require('squirrel');

const { app, BrowserWindow, autoUpdater } = electron;
const server = "https://updater-test.holland74.now.sh";
const feed = `${server}/update/${process.platform}/${app.getVersion()}`;

autoUpdater.setFeedURL(feed);
autoUpdater.checkForUpdates();

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({ webpreferences: { nodeIntegration: true } });
    mainWindow.loadFile("index.html");
    mainWindow.on('closed', () => app.quit());
});

autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
});