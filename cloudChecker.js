function checkCloudSettings() {
  savePath = path.join(app.getPath('downloads'), 'CAM')
}

function toggleCloudSetting() {
  // no-op: always save to Downloads
}

function checkForCloudOptions() {
  savePath = path.join(app.getPath('downloads'), 'CAM')
}

document.addEventListener('DOMContentLoaded', checkCloudSettings);
document.addEventListener('DOMContentLoaded', checkForCloudOptions);
