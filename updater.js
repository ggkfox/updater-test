const { autoUpdater } = require('electron-updater');
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

exports.check = () => {
    autoUpdater.checkForUpdates();

    autoUpdater.on('update-available', () => {
        autoUpdater.downloadUpdate();
    });
    autoUpdater.on('update-downloaded', () => {
        autoUpdater.quitAndInstall();
    });
};