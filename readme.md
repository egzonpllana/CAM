<img src="./icon.png" width="50" height="50" />

# CAM

> Forked from [hanayik/CAM](https://github.com/hanayik/CAM)

### Description
The CAM app was made for recording short tasks with research participants for later scoring or analysis.

The CAM app's design is as minimalist as possible. To use, just launch the app and you will immediately see a preview of the camera image. The app will not record until you click the red record button. Before recording though, it's a good idea to use the text input fields to give your recording a name. As you type in the fields you will see an automatically generated preview of what your video will be named.

While recording, the preview will not be shown. Instead, a live recording timer is displayed. This is intentional so that it's not distracting to research participants.

When you're done recording click the red square and your video will be saved to `~/Downloads/CAM/`.

### Setup (macOS with Apple Silicon)

The original repo has several compatibility issues on modern macOS (Apple Silicon, Node 16+). This fork fixes them. Follow these steps to get it running:

#### 1. Install ffmpeg

```bash
brew install ffmpeg
```

#### 2. Clone and install

```bash
git clone https://github.com/egzonpllana/CAM.git
cd CAM
volta pin node@16
npm install --ignore-scripts
```

#### 3. Install the Electron binary

The `--ignore-scripts` flag skips Electron's post-install download. Run it manually for x64 (runs via Rosetta):

```bash
npm_config_arch=x64 node node_modules/electron/install.js
```

#### 4. Run

```bash
npm start
```

#### Quick-start recording (optional)

Launch the app and auto-start recording with:

```bash
npx electron app.js --autorecord
```

### Screenshots
<img src="./gh-screenshots/1.png" width="300" height=auto />

<img src="./gh-screenshots/2.png" width="300" height=auto />

<img src="./gh-screenshots/3.png" width="300" height=auto />

<img src="./gh-screenshots/4.png" width="300" height=auto />


### Credits
[Icon](http://www.flaticon.com/packs/camp-collection)

[ffmpeg](https://www.ffmpeg.org/)


### License
[MIT](https://github.com/hanayik/CAM/blob/master/LICENSE)

This app was made specifically for the CSTAR group, but is open source so that others may modify and use as desired.


### Links
[CSTAR](https://cstar.sc.edu/)

[Aphasia Lab](https://web.asph.sc.edu/aphasia/)
