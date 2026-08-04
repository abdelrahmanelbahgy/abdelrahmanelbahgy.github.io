/* ============================================
   MAIN.JS — Core Logic, Interactions, Data
   AbdelRahman Elbahgy | Cybersecurity Portfolio
   ============================================ */

'use strict';

/* ── Page Loader ───────────────────────────── */
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
    initReveal();
    initSkillBars();
    initCountUp();
  }, 1900);
});

/* ── Scroll Progress Bar ───────────────────── */
const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const pct   = (window.scrollY / total) * 100;
  if (progressBar) progressBar.style.width = pct + '%';
});

/* ── Navbar: Scroll & Active Link ──────────── */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id]');

function onScroll() {
  /* sticky */
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }

  /* back to top */
  const btt = document.getElementById('back-to-top');
  if (btt) {
    btt.classList.toggle('visible', window.scrollY > 400);
  }

  /* active nav link */
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    if (window.scrollY >= top) {
      current = sec.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── Back to Top ───────────────────────────── */
const bttBtn = document.getElementById('back-to-top');
if (bttBtn) {
  bttBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── Mobile Nav ────────────────────────────── */
const hamburger = document.getElementById('nav-hamburger');
const mobileOverlay = document.getElementById('mobile-overlay');

if (hamburger && mobileOverlay) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileOverlay.classList.toggle('open');
    document.body.style.overflow = mobileOverlay.classList.contains('open') ? 'hidden' : '';
  });

  mobileOverlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ── Custom Cursor ─────────────────────────── */
const cursorDot  = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

if (cursorDot && cursorRing && window.matchMedia('(pointer: fine)').matches) {
  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left  = mouseX + 'px';
    cursorDot.style.top   = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .glass-card, .timeline-card, .social-link, .btn, [role="button"]').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
  });
}

/* ── Scroll Reveal ─────────────────────────── */
function initReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

/* ── Skill Bars ────────────────────────────── */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        bar.style.width = bar.dataset.width;
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach(bar => observer.observe(bar));
}

/* ── Count Up Animation ────────────────────── */
function initCountUp() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const dur    = 1800;
        const step   = dur / target;
        let current  = 0;

        const timer = setInterval(() => {
          current += Math.ceil(target / 60);
          if (current >= target) {
            el.textContent = target + suffix;
            clearInterval(timer);
          } else {
            el.textContent = current + suffix;
          }
        }, step);

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ── Timeline Expand ───────────────────────── */
document.querySelectorAll('.timeline-item').forEach(item => {
  const dot  = item.querySelector('.timeline-dot');
  const card = item.querySelector('.timeline-card');

  const toggle = () => {
    const wasActive = item.classList.contains('active');
    document.querySelectorAll('.timeline-item').forEach(i => i.classList.remove('active'));
    if (!wasActive) item.classList.add('active');
  };

  if (dot)  dot.addEventListener('click', toggle);
  if (card) card.addEventListener('click', toggle);
});

// Open first timeline item by default
const firstTL = document.querySelector('.timeline-item');
if (firstTL) firstTL.classList.add('active');

/* ── Contact Form ──────────────────────────── */
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();

    const btn = contactForm.querySelector('.form-submit');
    const successMsg = document.getElementById('form-success');

    btn.textContent = 'Sending...';
    btn.disabled    = true;

    // Simulate form submission
    setTimeout(() => {
      btn.textContent = '✓ Message Sent';
      btn.style.background = 'linear-gradient(135deg, #16a34a, #15803d)';

      if (successMsg) successMsg.style.display = 'block';

      contactForm.reset();

      setTimeout(() => {
        btn.textContent = 'Send Message →';
        btn.disabled    = false;
        btn.style.background = '';
        if (successMsg) successMsg.style.display = 'none';
      }, 4000);
    }, 1500);
  });
}

/* ── Matrix Rain Canvas ─────────────────────── */
function initMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;

  const ctx   = canvas.getContext('2d');
  const chars = '0123456789ABCDEF></?@#$%&|\\[]{}ψφ∑∏∫';
  let   cols, drops;

  const resize = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    cols  = Math.floor(canvas.width / 14);
    drops = Array(cols).fill(1);
  };

  resize();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.fillStyle = 'rgba(5,5,5,0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,26,26,0.6)';
    ctx.font      = '12px JetBrains Mono, monospace';

    for (let i = 0; i < cols; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(ch, i * 14, drops[i] * 14);
      if (drops[i] * 14 > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  setInterval(draw, 60);
}

initMatrix();

/* ── Smooth Anchor Scroll ──────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ── Project Modal / Details ───────────────── */
const projectData = {
  1: {
    title: 'Advanced Cybersecurity Exploitation Lab',
    desc: 'A comprehensive home lab environment built for practicing offensive security techniques including Active Directory attacks, privilege escalation, lateral movement, and post-exploitation. Simulates enterprise networks with domain controllers, workstations, and vulnerable services.',
    tech: ['Kali Linux', 'Windows Server 2019', 'Active Directory', 'Metasploit', 'BloodHound', 'Impacket', 'CrackMapExec'],
    github: '#',
    highlights: [
      'Set up multi-VM Active Directory environment',
      'Practiced Kerberoasting, AS-REP Roasting',
      'Simulated lateral movement techniques',
      'Documented attack paths and mitigations'
    ]
  },
  2: {
    title: 'Web Application Security Assessment',
    desc: 'A structured penetration test against a deliberately vulnerable web application, covering the OWASP Top 10 vulnerabilities including SQLi, XSS, IDOR, SSRF, and broken authentication. Full report with PoC and remediation guidance.',
    tech: ['Burp Suite', 'OWASP ZAP', 'SQLMap', 'Python', 'OWASP Top 10', 'HTML/JS'],
    github: '#',
    highlights: [
      'Identified and exploited SQLi vulnerabilities',
      'Demonstrated stored XSS attack chains',
      'Documented IDOR findings with PoC',
      'Produced professional pentest report'
    ]
  },
  3: {
    title: 'Enterprise Network Design',
    desc: 'Designed and configured a full enterprise network topology featuring VLANs, inter-VLAN routing, redundant links, NAT, ACLs, DHCP, and DNS. Modeled in Cisco Packet Tracer with detailed documentation.',
    tech: ['Cisco Packet Tracer', 'VLANs', 'OSPF', 'NAT', 'ACL', 'DHCP', 'DNS'],
    github: '#',
    highlights: [
      'Designed scalable VLAN segmentation',
      'Configured OSPF dynamic routing',
      'Implemented NAT and ACL policies',
      'Redundancy with STP and EtherChannel'
    ]
  },
  4: {
    title: 'University Management Database',
    desc: 'A relational database system for managing university operations including students, courses, grades, faculty, and enrollment. Features complex SQL queries, stored procedures, triggers, and a Java Swing GUI front-end.',
    tech: ['Java', 'MySQL', 'JDBC', 'SQL', 'Java Swing', 'OOP'],
    github: '#',
    highlights: [
      'Designed normalized relational schema',
      'Implemented CRUD via Java & JDBC',
      'Built Swing desktop front-end',
      'Advanced SQL: triggers, procedures, views'
    ]
  }
};

function openModal(id) {
  const data   = projectData[id];
  if (!data) return;

  const modal  = document.getElementById('project-modal');
  const mTitle = document.getElementById('modal-title');
  const mDesc  = document.getElementById('modal-desc');
  const mTech  = document.getElementById('modal-tech');
  const mHL    = document.getElementById('modal-highlights');

  if (mTitle)  mTitle.textContent = data.title;
  if (mDesc)   mDesc.textContent  = data.desc;
  if (mTech) {
    mTech.innerHTML = data.tech.map(t => `<span class="tech-badge">${t}</span>`).join('');
  }
  if (mHL) {
    mHL.innerHTML = data.highlights.map(h => `<li>${h}</li>`).join('');
  }

  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal() {
  const modal = document.getElementById('project-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Expose globally
window.openModal  = openModal;
window.closeModal = closeModal;

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

document.getElementById('project-modal')?.addEventListener('click', e => {
  if (e.target.id === 'project-modal') closeModal();
});
