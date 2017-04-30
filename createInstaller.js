var electronInstaller = require('electron-winstaller');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: './vote-win32-ia32',
    outputDirectory: './vote-installer',
    authors: 'Rishit Bansal, Muktaka Joshipura, Rachit Verma',
    exe: 'vote.exe'
  });

resultPromise.then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));