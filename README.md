# AbdelRahman Elbahgy — Portfolio

Plain HTML/CSS/JS site. No build step — open `index.html` directly, or deploy to GitHub Pages as-is.

## Add your certification images
Drop image files into `assets/certs/` using these exact names (the page will pick them up automatically —
no code changes needed):

- `assets/certs/efset.jpg` — EF SET Certificate
- `assets/certs/iti-cybersecurity.jpg` — ITI Cybersecurity Training Certificate
- `assets/certs/linux-fundamentals.jpg` — Linux Fundamentals Certificate
- `assets/certs/cybersecurity-beginners.jpg` — Cybersecurity for Beginners

Until a file exists, the card shows a placeholder badge icon — nothing looks broken.
(`.jpg`, `.png`, or `.webp` all work — just keep the filename and swap the extension in `index.html` if needed.)

## Add your social links
Open `index.html`, find the `<!-- CONTACT -->` section, and replace the `href="#"` placeholders on each
`.social-card` with your real URLs:

```html
<a href="#" class="social-card" data-social="facebook" ...>   ->  href="https://facebook.com/yourhandle"
<a href="#" class="social-card" data-social="linkedin" ...>   ->  href="https://linkedin.com/in/abdulrahmanelbahgy"
<a href="#" class="social-card" data-social="instagram" ...>  ->  href="https://instagram.com/yourhandle"
<a href="#" class="social-card" data-social="github" ...>     ->  href="https://github.com/yourhandle"
<a href="#" class="social-card" data-social="discord" ...>    ->  href="https://discord.gg/yourinvite"
```

Email is already wired to `mailto:abdelrahman.elbahgyy@gmail.com`.

The footer has three more placeholder links (GitHub, LinkedIn) in the `<footer>` section — update those
`href="#"` the same way.

## Deploy to GitHub Pages
1. Push this folder's contents to a repo.
2. Repo Settings → Pages → Source: `main` branch, root.
3. Done — `index.html` is the entry point.
