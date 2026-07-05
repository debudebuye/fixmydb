const backendPort = document.getElementById('backend-port');
const frontendPort = document.getElementById('frontend-port');
const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const urlRow = document.getElementById('url-row');
const frontendUrl = document.getElementById('frontend-url');
const logs = document.getElementById('logs');

function log(msg) {
  logs.textContent += `[${new Date().toLocaleTimeString()}] ${msg}\n`;
  logs.scrollTop = logs.scrollHeight;
}

function setStatus(running, url) {
  statusDot.className = 'dot' + (running ? ' running' : '');
  statusText.textContent = running ? 'Running' : 'Stopped';
  urlRow.style.display = running ? 'flex' : 'none';
  if (url) frontendUrl.textContent = url;
  frontendUrl.href = url || '#';
}

function setButtons(running) {
  btnStart.disabled = running;
  btnStop.disabled = !running;
  backendPort.disabled = running;
  frontendPort.disabled = running;
}

btnStart.addEventListener('click', async () => {
  setButtons(true);
  statusText.textContent = 'Starting...';
  log('Starting backend on port ' + backendPort.value + '...');
  log('Starting frontend on port ' + frontendPort.value + '...');
  try {
    const result = await window.fixmydb.start({
      backendPort: parseInt(backendPort.value, 10),
      frontendPort: parseInt(frontendPort.value, 10),
    });
    if (result.success) {
      setStatus(true, result.frontendUrl);
      log('FixMyDB is running!');
    } else {
      setStatus(false);
      log('Error: ' + result.error);
      setButtons(false);
    }
  } catch (err) {
    setStatus(false);
    log('Error: ' + err.message);
    setButtons(false);
  }
});

btnStop.addEventListener('click', async () => {
  statusText.textContent = 'Stopping...';
  log('Stopping servers...');
  await window.fixmydb.stop();
  setStatus(false);
  setButtons(false);
  log('Stopped.');
});

async function checkStatus() {
  try {
    const s = await window.fixmydb.getStatus();
    if (s.backendRunning || s.frontendRunning) {
      setStatus(true, `http://localhost:${s.frontendPort}`);
      setButtons(true);
    }
  } catch {}
}

checkStatus();
