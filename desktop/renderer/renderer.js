const backendPort = document.getElementById('backend-port');
const frontendPort = document.getElementById('frontend-port');
const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const statusSub = document.getElementById('status-sub');
const urlPill = document.getElementById('url-pill');
const frontendUrl = document.getElementById('frontend-url');
const logs = document.getElementById('logs');
const logClear = document.getElementById('log-clear');

function log(msg, type) {
  const empty = logs.querySelector('.log-empty');
  if (empty) empty.remove();

  const line = document.createElement('span');
  line.className = 'log-line';

  const time = document.createElement('span');
  time.className = 'log-time';
  time.textContent = new Date().toLocaleTimeString() + '  ';

  const text = document.createElement('span');
  text.className = type === 'success' ? 'log-msg-success' : type === 'error' ? 'log-msg-error' : 'log-msg-info';
  text.textContent = msg;

  line.appendChild(time);
  line.appendChild(text);
  logs.appendChild(line);
  logs.scrollTop = logs.scrollHeight;
}

function setStatus(running, url) {
  statusIndicator.className = 'status-indicator' + (running ? ' running' : '');
  statusText.textContent = running ? 'Running' : 'Offline';
  statusSub.textContent = running ? 'Both servers active' : 'Both servers stopped';
  if (url) {
    urlPill.style.display = 'inline-flex';
    frontendUrl.textContent = url;
    frontendUrl.href = url;
  } else {
    urlPill.style.display = 'none';
  }
}

function setStatusStarting() {
  statusIndicator.className = 'status-indicator';
  statusText.textContent = 'Starting...';
  statusSub.textContent = 'Launching servers...';
  urlPill.style.display = 'none';
}

function setButtons(running) {
  btnStart.disabled = running;
  btnStop.disabled = !running;
  backendPort.disabled = running;
  frontendPort.disabled = running;
}

logClear.addEventListener('click', () => {
  logs.innerHTML = '<div class="log-empty">Waiting for activity...</div>';
});

btnStart.addEventListener('click', async () => {
  setButtons(true);
  setStatusStarting();
  log('Starting backend on port ' + backendPort.value + '...', 'info');
  log('Starting frontend on port ' + frontendPort.value + '...', 'info');
  try {
    const result = await window.fixmydb.start({
      backendPort: parseInt(backendPort.value, 10),
      frontendPort: parseInt(frontendPort.value, 10),
    });
    if (result.success) {
      setStatus(true, result.frontendUrl);
      log('FixMyDB is running!', 'success');
    } else {
      setStatus(false);
      log('Error: ' + result.error, 'error');
      setButtons(false);
    }
  } catch (err) {
    setStatus(false);
    log('Error: ' + err.message, 'error');
    setButtons(false);
  }
});

btnStop.addEventListener('click', async () => {
  statusText.textContent = 'Stopping...';
  statusSub.textContent = 'Shutting down...';
  log('Stopping servers...', 'info');
  await window.fixmydb.stop();
  setStatus(false);
  setButtons(false);
  log('All servers stopped.', 'success');
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
