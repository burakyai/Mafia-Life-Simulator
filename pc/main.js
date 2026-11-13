// Derin Dünya - masaüstü (Windows) kabuğu.
// Oyunun web dosyalarını (www/) bir pencerede açar. Oyunun kendisi www/index.html içindedir.
const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('node:path');

const SMOKE = process.argv.includes('--smoke'); // derleme sonrası otomatik açılış testi
if (!app.requestSingleInstanceLock()) app.quit();

function create() {
  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 1024, minHeight: 700,
    show: !SMOKE, backgroundColor: '#0a0808', title: 'Derin Dünya',
    autoHideMenuBar: true, icon: path.join(__dirname, 'icon.png'),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  Menu.setApplicationMenu(null);
  // Oyun dışı bağlantılar pencerenin içinde değil, kullanıcının tarayıcısında açılır.
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file://')) { e.preventDefault(); if (/^https?:\/\//.test(url)) shell.openExternal(url); } });
  // F11: tam ekran
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') { win.setFullScreen(!win.isFullScreen()); e.preventDefault(); }
  });
  if (SMOKE) {
    const errs = [];
    win.webContents.on('console-message', (e, level, msg) => { const lv = level === undefined ? e.level : level, m = msg === undefined ? e.message : msg; if (lv === 'error' || lv >= 3) errs.push(String(m)); });
    win.webContents.on('did-fail-load', (_e, code, desc) => { console.error('YUKLENEMEDI', code, desc); app.exit(1); });
    win.webContents.once('did-finish-load', async () => {
      try {
        const r = await win.webContents.executeJavaScript(
          "new Promise(res=>setTimeout(()=>res({v:typeof APPV==='string'?APPV:null,ok:typeof ageUp==='function'&&typeof miniGame==='function',img:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length}),1500))");
        console.log('SMOKE', JSON.stringify(r), 'hata:', errs.length);
        errs.slice(0, 5).forEach(x => console.log('  ', x));
        app.exit(r && r.ok && r.v && !errs.length ? 0 : 1);
      } catch (err) { console.error('SMOKE HATA', err); app.exit(1); }
    });
    setTimeout(() => { console.error('SMOKE zaman asimi'); app.exit(1); }, 60000);
  }
  win.loadFile(path.join(__dirname, 'www', 'index.html'));
}

app.whenReady().then(create);
app.on('second-instance', () => { const w = BrowserWindow.getAllWindows()[0]; if (w) { if (w.isMinimized()) w.restore(); w.focus(); } });
app.on('window-all-closed', () => app.quit());
