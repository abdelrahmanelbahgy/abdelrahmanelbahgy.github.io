/* ============================================
   ANIMATIONS.JS — Terminal Simulation &
   Typing Animation Engine
   ============================================ */

'use strict';

/* ── Typing Animation ──────────────────────── */
(function initTyping() {
  const el     = document.getElementById('typing-text');
  const cursor = document.querySelector('.typing-cursor');
  if (!el) return;

  const phrases = [
    'Penetration Tester',
    'Red Team Enthusiast',
    'Offensive Security Learner',
    'Ethical Hacker',
    'Cybersecurity Student'
  ];

  let phraseIdx  = 0;
  let charIdx    = 0;
  let deleting   = false;
  let pauseTimer = null;

  const TYPING_SPEED  = 75;
  const DELETE_SPEED  = 40;
  const PAUSE_AFTER   = 1800;
  const PAUSE_BEFORE  = 300;

  function type() {
    const phrase = phrases[phraseIdx];

    if (!deleting) {
      charIdx++;
      el.textContent = phrase.slice(0, charIdx);

      if (charIdx === phrase.length) {
        deleting = true;
        pauseTimer = setTimeout(type, PAUSE_AFTER);
        return;
      }
    } else {
      charIdx--;
      el.textContent = phrase.slice(0, charIdx);

      if (charIdx === 0) {
        deleting  = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(type, PAUSE_BEFORE);
        return;
      }
    }

    setTimeout(type, deleting ? DELETE_SPEED : TYPING_SPEED);
  }

  setTimeout(type, 1000);
})();

/* ── Terminal Simulation ───────────────────── */
(function initTerminal() {
  const body = document.getElementById('terminal-body');
  if (!body) return;

  const session = [
    {
      prompt: { user: 'r00t', host: 'kali', path: '~' },
      cmd: 'whoami',
      output: [
        { text: 'r00t', cls: 't-green' }
      ]
    },
    {
      prompt: { user: 'r00t', host: 'kali', path: '~' },
      cmd: 'pwd',
      output: [
        { text: '/root/pentest', cls: 't-blue' }
      ]
    },
    {
      prompt: { user: 'r00t', host: 'kali', path: '~/pentest' },
      cmd: 'ls -la',
      output: [
        { text: 'total 48', cls: 't-output' },
        { text: 'drwxr-xr-x  6 r00t r00t 4096 Aug  3 2026 .', cls: 't-output' },
        { text: 'drwxr-xr-x 28 r00t r00t 4096 Aug  3 2026 ..', cls: 't-output' },
        { text: 'drwxrwxr-x  2 r00t r00t 4096 Aug  3 2026 \x1B[34mrecon\x1B[0m', cls: 't-output' },
        { text: 'drwxrwxr-x  2 r00t r00t 4096 Aug  3 2026 \x1B[34mexploit\x1B[0m', cls: 't-output' },
        { text: '-rw-r--r--  1 r00t r00t  420 Aug  3 2026 \x1B[31mskills.txt\x1B[0m', cls: 't-output' }
      ]
    },
    {
      prompt: { user: 'r00t', host: 'kali', path: '~/pentest' },
      cmd: 'cat skills.txt',
      output: [
        { text: '# AbdelRahman Elbahgy — Skill Set', cls: 't-cyan' },
        { text: '', cls: '' },
        { text: '[+] Networking    : CCNA, VLANs, Routing, DNS', cls: 't-green' },
        { text: '[+] Pentesting    : Burp Suite, Metasploit, Nmap', cls: 't-green' },
        { text: '[+] Programming   : Python, Bash, Java, SQL', cls: 't-green' },
        { text: '[+] Active Dir    : BloodHound, Impacket', cls: 't-green' },
        { text: '[+] Web Security  : OWASP Top 10, SQLi, XSS', cls: 't-green' },
        { text: '[+] Status        : eJPT in progress...', cls: 't-yellow' }
      ]
    },
    {
      prompt: { user: 'r00t', host: 'kali', path: '~/pentest' },
      cmd: 'nmap -sV -sC 10.10.10.1',
      output: [
        { text: 'Starting Nmap 7.94 ( https://nmap.org )', cls: 't-output' },
        { text: 'Nmap scan report for 10.10.10.1', cls: 't-output' },
        { text: 'Host is up (0.042s latency).', cls: 't-output' },
        { text: '', cls: '' },
        { text: 'PORT     STATE SERVICE    VERSION', cls: 't-cyan' },
        { text: '22/tcp   open  ssh        OpenSSH 8.9p1', cls: 't-green' },
        { text: '80/tcp   open  http       Apache httpd 2.4.52', cls: 't-green' },
        { text: '445/tcp  open  microsoft-ds', cls: 't-yellow' },
        { text: '3389/tcp open  ms-wbt-server', cls: 't-red' },
        { text: '', cls: '' },
        { text: 'Service detection performed.', cls: 't-output' },
      ]
    },
    {
      prompt: { user: 'r00t', host: 'kali', path: '~/pentest' },
      cmd: 'enum4linux -a 10.10.10.1',
      output: [
        { text: 'Starting enum4linux v0.9.1', cls: 't-output' },
        { text: '[+] Server 10.10.10.1 allows sessions using username \'\', password \'\'', cls: 't-green' },
        { text: '[+] Workgroup/Domain: CORP', cls: 't-green' },
        { text: '[+] Getting domain SID:', cls: 't-output' },
        { text: '    Domain SID: S-1-5-21-1234567890-12345-678', cls: 't-yellow' },
        { text: '[+] Users found:', cls: 't-green' },
        { text: '    administrator, john.doe, jane.smith', cls: 't-cyan' }
      ]
    },
    {
      prompt: { user: 'r00t', host: 'kali', path: '~/pentest' },
      cmd: 'bloodhound-python -u john.doe -p "P@ssw0rd" -d corp.local -ns 10.10.10.1',
      output: [
        { text: 'INFO: Found AD domain: corp.local', cls: 't-output' },
        { text: 'INFO: Connecting to LDAP server: dc01.corp.local', cls: 't-output' },
        { text: 'INFO: Found 1 domains', cls: 't-green' },
        { text: 'INFO: Found 5 computers', cls: 't-green' },
        { text: 'INFO: Found 12 users', cls: 't-green' },
        { text: 'INFO: Found 3 groups', cls: 't-green' },
        { text: 'INFO: Done in 00M 08S', cls: 't-cyan' },
      ]
    },
    {
      prompt: { user: 'r00t', host: 'kali', path: '~/pentest' },
      cmd: 'crackmapexec smb 10.10.10.0/24',
      output: [
        { text: 'SMB  10.10.10.1  445  DC01  [*] Windows Server 2019 Build 17763 x64', cls: 't-output' },
        { text: 'SMB  10.10.10.2  445  WS01  [*] Windows 10 Build 19045 x64', cls: 't-output' },
        { text: 'SMB  10.10.10.5  445  WS02  [*] Windows 10 Build 19045 x64', cls: 't-output' },
        { text: 'SMB  10.10.10.1  445  DC01  [+] corp.local\\john.doe:P@ssw0rd', cls: 't-green' }
      ]
    },
    {
      prompt: { user: 'r00t', host: 'kali', path: '~/pentest' },
      cmd: 'kerbrute userenum --dc 10.10.10.1 -d corp.local users.txt',
      output: [
        { text: '    __             __               __  ', cls: 't-red' },
        { text: '   / /_____  _____/ /_  _______  __/ /____', cls: 't-red' },
        { text: '  / //_/ _ \\/ ___/ __ \\/ ___/ / / / __/ _ \\', cls: 't-red' },
        { text: ' / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/', cls: 't-red' },
        { text: '/_/|_|\\___/_/  /_.___/_/   \\__,_/\\__/\\___/', cls: 't-red' },
        { text: '', cls: '' },
        { text: '[+] VALID USERNAME: administrator@corp.local', cls: 't-green' },
        { text: '[+] VALID USERNAME: john.doe@corp.local', cls: 't-green' },
        { text: '[+] VALID USERNAME: svc_backup@corp.local', cls: 't-yellow' }
      ]
    },
    {
      prompt: { user: 'r00t', host: 'kali', path: '~/pentest' },
      cmd: 'netexec smb 10.10.10.1 -u administrator -H "aad3b435b51404eeaad3b435b51404ee:31d6..."',
      output: [
        { text: 'SMB  10.10.10.1  445  DC01  [*] Windows Server 2019', cls: 't-output' },
        { text: 'SMB  10.10.10.1  445  DC01  [+] corp.local\\administrator (Pwn3d!)', cls: 't-green t-bold' }
      ]
    }
  ];

  let sessionIndex = 0;
  let charInterval = null;

  function createPromptEl({ user, host, path }) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.innerHTML =
      `<span class="t-green">${user}</span>` +
      `<span class="t-output">@</span>` +
      `<span class="t-red">${host}</span>` +
      `<span class="t-output">:</span>` +
      `<span class="t-blue">${path}</span>` +
      `<span class="t-output">$ </span>`;
    return line;
  }

  function appendLine(cls, text) {
    const line  = document.createElement('div');
    line.className = 'terminal-line ' + (cls || '');
    line.textContent = text;
    body.appendChild(line);
    body.scrollTop = body.scrollHeight;
    return line;
  }

  function typeCommand(promptData, cmd, outputLines, onDone) {
    const promptLine = createPromptEl(promptData);
    const cmdSpan    = document.createElement('span');
    cmdSpan.className = 't-cmd';
    const cursorEl   = document.createElement('span');
    cursorEl.className = 'terminal-cursor-blink';

    promptLine.appendChild(cmdSpan);
    promptLine.appendChild(cursorEl);
    body.appendChild(promptLine);
    body.scrollTop = body.scrollHeight;

    let idx = 0;
    charInterval = setInterval(() => {
      if (idx < cmd.length) {
        cmdSpan.textContent += cmd[idx++];
        body.scrollTop = body.scrollHeight;
      } else {
        clearInterval(charInterval);
        cursorEl.remove();
        promptLine.appendChild(document.createTextNode(''));

        // Show output line by line
        let outIdx = 0;
        function showNextLine() {
          if (outIdx < outputLines.length) {
            const { text, cls } = outputLines[outIdx++];
            appendLine(cls, text);
            setTimeout(showNextLine, 45);
          } else {
            setTimeout(onDone, 600);
          }
        }
        setTimeout(showNextLine, 200);
      }
    }, 55);
  }

  function runNextCommand() {
    if (sessionIndex >= session.length) {
      /* Loop: clear after pause */
      setTimeout(() => {
        body.innerHTML = '';
        sessionIndex = 0;
        runNextCommand();
      }, 4000);
      return;
    }

    const { prompt, cmd, output } = session[sessionIndex++];
    typeCommand(prompt, cmd, output, runNextCommand);
  }

  // Start after loader
  window.addEventListener('load', () => {
    setTimeout(runNextCommand, 2200);
  });
})();

/* ── Tilt Effect on Cards ──────────────────── */
(function initTilt() {
  const cards = document.querySelectorAll('.glass-card, .project-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const x      = (e.clientX - rect.left) / rect.width  - 0.5;
      const y      = (e.clientY - rect.top)  / rect.height - 0.5;
      const tiltX  = y * 6;
      const tiltY  = -x * 6;

      card.style.transform = `translateY(-4px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ── Particle Burst on Click ───────────────── */
(function initClickParticles() {
  document.addEventListener('click', e => {
    const target = e.target;
    if (!target.classList.contains('btn') && !target.classList.contains('btn-primary')) return;

    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('span');
      const angle    = (i / 8) * 360;
      const radius   = 40 + Math.random() * 30;
      const rads     = angle * Math.PI / 180;
      const dx       = Math.cos(rads) * radius;
      const dy       = Math.sin(rads) * radius;

      particle.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 5px; height: 5px;
        border-radius: 50%;
        background: #ff1a1a;
        pointer-events: none;
        z-index: 99997;
        box-shadow: 0 0 6px #ff1a1a;
        transition: transform 0.5s ease, opacity 0.5s ease;
        opacity: 1;
      `;

      document.body.appendChild(particle);

      requestAnimationFrame(() => {
        particle.style.transform = `translate(${dx}px, ${dy}px)`;
        particle.style.opacity   = '0';
      });

      setTimeout(() => particle.remove(), 500);
    }
  });
})();
