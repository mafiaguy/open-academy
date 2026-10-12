# Course authoring template

To add a course, copy an existing page such as `courses/cloud-engineering/index.html`, then replace the metadata, intro, learner outcomes, syllabus modules, and project with course-specific content. Keep the shared class names and stylesheet links so the responsive layout and interaction patterns remain consistent.

## Required page content

- Stable slug under `courses/<slug>/` and a canonical URL.
- Plain-language course purpose and intended learner.
- Prerequisites, level, and honest time estimate.
- Measurable learning outcomes.
- Ordered modules with enough detail to explain progression.
- A practical final project or demonstration.
- Links to attributed resources, with license and access checked.
- An explicit statement about course access and any optional certificate fee.

## Course resources

Use `courses/security-engineering/course.json` as the initial LMS content shape. Lessons should distinguish original OpenComp explanations from external resources. Link to third-party videos, documentation, articles, and PDFs; do not rehost copyrighted material without permission. Required materials should be free to access.

## LMS integration

Only Security Engineering has a learner-space prototype today. Other pages should link to the catalog until their course content and LMS access are ready. Connect real authentication, enrollment, content delivery, progress sync, and certificate payments before presenting these as production features.
