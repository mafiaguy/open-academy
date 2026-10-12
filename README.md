# OpenComp Academy

OpenComp Academy makes practical computer education clear and connected. Courses cover systems foundations, security, cloud engineering, site reliability, and software deployment.

## Run locally

The public site is static and has no package installation or build step:

```sh
ruby -run -e httpd . -p 8000
```

Open <http://localhost:8000>. The Security 101 learning preview needs a local server because it loads course content from JSON. Its lesson progress and written workbook are stored in the current browser only. It is a prototype, not real authentication, synced enrollment, payment, video hosting, or certificate issuance.

## Structure

- `index.html`, `styles.css`, `brand.css`, `app.js`, `catalog.js` — public company homepage, responsive design, and course search.
- `courses/<slug>/index.html` — public, crawlable course detail pages.
- `courses/security-engineering/course.json` — 12 Security 101 lessons, written explanations, checks, guided activities, and embedded video metadata.
- `lms/security-engineering/` — course preview and a lesson-by-lesson learner view with progress and an in-browser workbook.
- `courses/COURSE_TEMPLATE.md` — guidance for adding courses with consistent page structure.
- `robots.txt`, `sitemap.xml`, `favicon.svg` — public indexing and site identity.
- `docs/repo-access-automation.md`, `.github/workflows/`, `scripts/`, `grants.json` — repository access automation preserved from the original repository.

## Course and certificate model

Course learning is designed around curated, attributed resources and practical work. Learning access is intended to be free. A course completion certificate is optional, offered after course requirements are met, and requires a separate fee. The certificate price, actual authentication and enrollment, payment processor, content hosting, and verification service need to be configured before launch.

The first LMS preview is for Security 101, a 4–6 hour breadth-first introduction. It has 12 lessons across four units, with lesson notes, knowledge checks, written practice, an access-control simulation, and local progress. Other public course pages show curriculum and intended outcomes; their LMS flows are still being developed.

## Curriculum contributions

See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [courses/COURSE_TEMPLATE.md](courses/COURSE_TEMPLATE.md). Link to third-party resources rather than rehosting them, and confirm attribution, access, licensing, and embedding terms.

## Hosting

The site can be served by a static host with clean directory URLs. Canonical URLs currently use `https://opencomp.academy/`; update page metadata, `robots.txt`, and `sitemap.xml` together if that domain changes.

## License

Choose and add a project license before accepting broad external contributions. Educational content and application code should have explicit, compatible licensing.
