# webCliGui
Web / Browser base Gui for running command services.

The webCliGui is using React in the frontend and Django in the backend. To run the React and Django you need to install packages/modules.

## Installation

### Install the frontend packages

To install the frontend packages please give the following command:

```sh
npm i
```

### Install the backend python modules

To install the backend python modules you need to give the following commands:

```sh
pip update
pip install Django djangorestframework python-dotenv
```

## Run in development

This application is developed in vscode so please open the project in the webCliGui directory in vscode and open a terminal.

To run this application in development you have to start the frontend and the backend servers in development.

### Start the backend python Django server in developer mode

To start the python server in developer mode you have to go to the 'Run and Debug' tab in vscode. In the top you will see the option 'Python: Django' selected. Click on the triangle in front of it which will start the python Django server. A terminal will pop up which will show the following output:

```cmd
(.venv) fvanris@debian:~/webCliGui$  /usr/bin/env /home/fvanris/.venv/bin/python /home/fvanris/.vscode-server/extensions/ms-python.debugpy-2025.18.0-linux-x64/bundled/libs/debugpy/adapter/../../debugpy/launcher 49677 -- /home/fvanris/webCliGui/server/manage.py runserver 0.0.0.0:5000 
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
January 11, 2026 - 20:21:02
Django version 6.0, using settings 'webCliGui.settings'
Starting development server at http://0.0.0.0:5000/
Quit the server with CONTROL-C.
```

The Django server is now started.

### Start the frontend React development server

Open another terminal and give the following command:

```sh
npm run watch
```

This will show the following output:

```cmd
(.venv) fvanris@debian:~/webCliGui$ npm run watch

> webcligui@1.0.0 watch
> if [ -d dist ]; then rm -rf dist; fi && webpack serve --mode development

<w> [webpack-dev-server] "hot: true" automatically applies HMR plugin, you don't have to add it manually to your webpack configuration.
<i> [webpack-dev-server] [HPM] Proxy created: /api  -> http://127.0.0.1:5000
<i> [webpack-dev-server] Project is running at:
<i> [webpack-dev-server] Loopback: http://localhost:9002/, http://[::1]:9002/
<i> [webpack-dev-server] On Your Network (IPv4): http://10.0.0.169:9002/
<i> [webpack-dev-server] Content not from webpack is served from '/home/fvanris/webCliGui/dist' directory
<i> [webpack-dev-server] 404s will fallback to '/index.html'
asset bundle.js 3.26 MiB [emitted] (name: main) 1 related asset
asset crazyface.png 1.37 KiB [emitted] [from: public/crazyface.png] [copied]
asset index.html 393 bytes [emitted] [from: public/index.html] [copied]
orphan modules 299 KiB [orphan] 222 modules
runtime modules 30.5 KiB 16 modules
javascript modules 2.79 MiB
  modules by path ./node_modules/ 1.96 MiB 304 modules
  modules by path ./src/ 847 KiB
    modules by path ./src/*.css 842 KiB 2 modules
    modules by path ./src/components/*.tsx 3.82 KiB 2 modules
    ./src/main.tsx 1.32 KiB [built] [code generated]
asset modules 20.3 KiB
  modules by mime type image/svg+xml 5.03 KiB 19 modules
  modules by mime type image/gif 643 bytes
    data:image/gif;base64,R0lGODlhEAAQAKIG.. 547 bytes [built] [code generated]
    data:image/gif;base64,R0lGODlhCQACAIAA.. 96.3 bytes [built] [code generated]
  data:image/png;base64,iVBORw0KGgoAAAAN.. 14.7 KiB [built] [code generated]
webpack 5.104.1 compiled successfully in 13238 ms
```

The React development server is now started.

### Show the application in the browser

If you started the vscode inside the VirtualBox system then you simply would open your browser and enter the following url:

```
http://localhost:9002
```

This should show up the application.

If you are running vscode outside of the VirtualBox system then you must make sure that your ports are being exported:

| Port   | Forwarded Address | Running Process  | Origin         |
| :------| :-----------------| :----------------| :--------------|
| 5000   | localhost:5000    |                  | User Forwarded |
| 9002   | localhost:9002    |                  | Auto Forwarded |

Your system has now its own IP address.

Now open the browser and enter the following url:

```
http://<system-ip-address>:9002
```

This should show up the application.

