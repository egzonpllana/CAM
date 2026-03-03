const { remote, shell } = require('electron')
const {Menu, MenuItem} = remote
const path = require('path')
const csvsync = require('csvsync')
const fs = require('fs')
const $ = require('jQuery')
const {app} = require('electron').remote;
app.setName('CAM')
const appRootDir = require('app-root-dir').get() //get the path of the application bundle
const ffmpeg = '/opt/homebrew/bin/ffmpeg'
const exec = require( 'child_process' ).exec
const spawn = require( 'child_process' ).spawn
const si = require('systeminformation');
const mkdirp = require('mkdirp');
var ipcRenderer = require('electron').ipcRenderer;
var moment = require('moment')
var content = document.getElementById("contentDiv")
var localMediaStream
var sys = {
  modelID: 'unknown',
  isMacBook: false // need to detect if macbook for ffmpeg recording framerate value
}
var exp = new experiment('CAM')
var rec = new ff()
exp.getRootPath()
exp.getMediaPath()
var userDataPath = path.join(app.getPath('userData'),'Data')
makeSureUserDataFolderIsThere()
var savePath
var isRecording = false
var subjectCounter = 1
var sessionCounter = 1
var taskCounter = 1
var recordingTimer = null
var recordingSeconds = 0
var caffeinateProcess = null

initDefaults()
startWebCamPreview()
document.getElementById("recordBtn").onclick = toggleRecording




function checkForUpdateFromRender() {
  ipcRenderer.send('user-requests-update')
  //alert('checked for update')
}


function updateFilenamePreview() {
  filenameTextArea = document.getElementById("fileNamePreview")
  filenameTextArea.innerHTML = getSubjID() + "_" + getSessID() + "_" + getTaskID() + "_" + getDateStamp() + ".mp4"
}


function padNumber(num) {
  return String(num).padStart(3, '0')
}

function initDefaults() {
  document.getElementById("subjID").value = 'S' + padNumber(subjectCounter)
  document.getElementById("sessID").value = padNumber(sessionCounter)
  document.getElementById("taskID").value = 'T' + padNumber(taskCounter)
  updateFilenamePreview()
}

function advanceCounters() {
  taskCounter++
  document.getElementById("taskID").value = 'T' + padNumber(taskCounter)
  updateFilenamePreview()
}

function formatTime(totalSeconds) {
  var hrs = Math.floor(totalSeconds / 3600)
  var mins = Math.floor((totalSeconds % 3600) / 60)
  var secs = totalSeconds % 60
  return String(hrs).padStart(2, '0') + ':' + String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0')
}

function startRecordingTimer() {
  recordingSeconds = 0
  var container = document.getElementById("previewContainer")
  container.innerHTML = '<p id="recordingTimerDisplay" style="font-size:48px;text-align:center;color:red;font-family:monospace;margin-top:40px;">00:00:00</p>'
  recordingTimer = setInterval(function() {
    recordingSeconds++
    var display = document.getElementById("recordingTimerDisplay")
    if (display) {
      display.textContent = formatTime(recordingSeconds)
    }
  }, 1000)
}

function stopRecordingTimer() {
  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }
  recordingSeconds = 0
}

function toggleRecording() {
  if (isRecording == false) {
    stopWebCamPreview()
    rec.startRec()
    isRecording = true
    document.getElementById("recordBtn").style.borderRadius = "20px";
    startRecordingTimer()
    caffeinateProcess = spawn('caffeinate', ['-dims'])
    console.log('caffeinate started, preventing sleep')
  } else if (isRecording == true) {
    stopRecordingTimer()
    if (caffeinateProcess) {
      caffeinateProcess.kill()
      caffeinateProcess = null
      console.log('caffeinate stopped')
    }
    startWebCamPreview()
    rec.stopRec()
    isRecording = false
    document.getElementById("recordBtn").style.borderRadius = "50px";
    advanceCounters()
  }
}


function getSubjID() {
  var subjID = document.getElementById("subjID").value.trim()
  if (subjID === '') {
    subjID = ''
  }
  return subjID
}

function getTaskID() {
  var taskID = document.getElementById("taskID").value.trim()
  if (taskID === '') {
    taskID = ''
  }
  return taskID
}

function getSessID() {
  var sessID = document.getElementById("sessID").value.trim()
  if (sessID === '') {
    sessID = ''
  }
  return sessID
}

function makeSureUserDataFolderIsThere() {
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath)
  }
}


//camera preview on
function startWebCamPreview() {
  var container = document.getElementById("previewContainer")
  container.innerHTML = ''
  var vidPrevEl = document.createElement("video")
  vidPrevEl.autoplay = true
  vidPrevEl.id = "webcampreview"
  container.appendChild(vidPrevEl)
  navigator.mediaDevices.getUserMedia({video: true, audio: false})
    .then(function(stream) {
      localMediaStream = stream
      vidPrevEl.srcObject = stream
    })
    .catch(function(err) {
      console.error('Webcam error: ', err)
      alert('Could not connect to webcam')
    })
}


// camera preview off
function stopWebCamPreview () {
  if (localMediaStream) {
    localMediaStream.getVideoTracks()[0].stop()
    localMediaStream = undefined
  }
  var container = document.getElementById("previewContainer")
  container.innerHTML = ''
}


// get date and time for appending to filenames
function getDateStamp() {
  ts = moment().format('MMMM Do YYYY, h:mm:ss a')
  ts = ts.replace(/ /g, '-') // replace spaces with dash
  ts = ts.replace(/,/g, '') // replace comma with nothing
  ts = ts.replace(/:/g, '-') // replace colon with dash
  console.log('recording date stamp: ', ts)
  return ts
}


// runs when called by systeminformation
function updateSys(ID) {
  sys.modelID = ID
  if (ID.includes("MacBook") == true) {
    sys.isMacBook = true
  }

  //console.log("updateSys has updated!")
  //console.log(ID.includes("MacBook"))
  //console.log(sys.isMacBook)
} // end updateSys

si.system(function(data) {
  console.log(data['model']);
  updateSys(data['model'])
})


// ffmpeg object constructor
function ff() {
  this.ffmpegPath = '/opt/homebrew/bin/ffmpeg',
  this.framerate = function () {

  },
  this.shouldOverwrite = '-y',         // do overwrite if file with same name exists
  this.threadQueSize = '512',           // preallocation
  this.cameraFormat = 'avfoundation',  // macOS only
  this.screenFormat = 'avfoundation',  // macOS only
  this.cameraDeviceID = '0',           // macOS only
  this.audioDeviceID = '0',            // macOS only
  this.screenDeviceID = '1',           // macOS only
  this.videoSize = '1280x720',         // output video dimensions
  this.videoCodec = 'libx264',         // encoding codec libx264
  this.recQuality = '28',              //0-60 (0 = perfect quality but HUGE files)
  this.preset = 'veryfast',
  this.videoExt = '.mp4',
  // filter is for picture in picture effect
  this.filter = '"[0]scale=iw/8:ih/8 [pip]; [1][pip] overlay=main_w-overlay_w-10:main_h-overlay_h-10"',
  this.isRecording = false,
  this.getSubjID = function() {
    var subjID = document.getElementById("subjID").value.trim()
    if (subjID === '') {
      console.log ('subject is blank')
      //alert('Participant field is blank!')
      subjID = '0000'
    }
    return subjID
  },
  this.getSessID = function () {
    var sessID = document.getElementById("sessID").value.trim()
    if (sessID === '') {
      console.log ('session is blank')
      //alert('Session field is blank!')
      sessID = '0000'
    }
    return sessID
  },
  this.getTaskID = function () {
    var taskID = document.getElementById("taskID").value.trim()
    if (taskID === '') {
      console.log ('task is blank')
      //alert('task field is blank!')
      taskID = 'notask'
    }
    return taskID
  },
  this.datestamp = getDateStamp(),
  this.makeOutputFolder = function () {
    outpath = savePath
    console.log(outpath)
    if (!fs.existsSync(outpath)) {
      mkdirp.sync(outpath)
    }
    return outpath
  }
  this.outputFilename = function() {
    var timestamp = moment().format('YYYYMMDD_HHmmss')
    return path.join(this.makeOutputFolder(), this.getSubjID()+'_'+this.getSessID()+'_'+this.getTaskID()+'_'+timestamp+this.videoExt)
  },
  this.getFramerate = function () {
    return 15
  },
  this.startRec = function() {
    cmd = [
      this.ffmpegPath +
      ' ' + this.shouldOverwrite +
      ' -thread_queue_size ' + this.threadQueSize +
      ' -f ' + this.cameraFormat +
      ' -framerate 30' +
      ' -video_size ' + this.videoSize +
      ' -i "' + this.cameraDeviceID + '":"' + this.audioDeviceID + '"' +
      ' -vf hflip' +
      ' -c:v ' + this.videoCodec +
      ' -crf ' + this.recQuality +
      ' -preset ' + this.preset +
      ' -r ' + this.getFramerate().toString() +
      '  ' + '"' + this.outputFilename() + '"'
    ]
    cmd = cmd.toString()
    console.log('ffmpeg cmd: ')
    console.log(cmd)
    this.isRecording = true
    console.log('ffmpeg full command: ', cmd)
    exec(cmd,{maxBuffer: 2000 * 1024}, (error, stdout, stderr) => {
      if (error) {
        var stderrStr = stderr || ''
        if (stderrStr.indexOf('Exiting normally') !== -1 || stderrStr.indexOf('signal 15') !== -1) {
          console.log('ffmpeg stopped normally')
          return
        }
        console.error('ffmpeg error: ', error.message)
        console.error('ffmpeg stderr: ', stderr)
        alert('Recording error: ' + error.message)
        return
      }
      console.log('ffmpeg stderr: ', stderr);
    })
  },
  this.stopRec = function () {
    exec('killall ffmpeg')
  }
}


// open data folder in finder
function openDataFolder() {
  dataFolder = savePath
  if (!fs.existsSync(dataFolder)) {
    mkdirp.sync(dataFolder)
  }
  shell.showItemInFolder(dataFolder)
}


// remove all child elements from a div, here the convention will be to
// remove the elements from "contentDiv" after a trial
function clearScreen() {
  while (content.hasChildNodes())
  content.removeChild(content.lastChild)
}

function clearAllTimeouts() {
  clearTimeout(trialTimeoutID)
}

// show single image on screen
function showImage(imgPath) {
  clearScreen()
  var imageEl = document.createElement("img")
  imageEl.src = imgPath
  content.appendChild(imageEl)
  return getTime()
}

// experiment object for storing session parameters, etc.
function experiment(name) {
  this.beginTime= 0,
  this.endTime= 0,
  this.duration= 0,
  this.name= name,
  this.rootpath= '',
  this.mediapath= '',
  this.getDuration = function () {
    return this.endTime - this.beginTime
  },
  this.setBeginTime = function() {
    this.beginTime = performance.now()
  },
  this.setEndTime = function () {
    this.endTime = performance.now()
  },
  this.getMediaPath = function () {
    this.mediapath = path.join(__dirname, '/assets/')
    return this.mediapath
  },
  this.getRootPath = function () {
    this.rootpath = path.join(__dirname,'/')
    return this.rootpath
  }
}
