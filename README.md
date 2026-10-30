# LexiQuest browser demo

A free, static educational prototype published with GitHub Pages. This public repository contains the standalone classroom demo and the separate Sound Studio draft, not the private Node.js/SQLite school application or any school database.

## Sound Studio

Open https://jandelayind.github.io/lexiquest-demo/phonics/ for 149 original draft lesson plans across six phases, an interactive 44-sound atlas, device word narration, teacher clip tools and local practice history. Australian voices are preferred when the device supplies them. Listen-and-point requires at least two permitted, reviewed teacher sound recordings; no phoneme recordings are bundled. This is not a complete voiced course or validated SSP. See [Sound Studio instructions](phonics/README.md) and [teaching guide](phonics/guide.html).

## Try it

Open https://jandelayind.github.io/lexiquest-demo/ and switch between **Student**, **Teacher** and **Admin**. Create a course and lesson as the teacher, assign it, complete it as the student, and review the sample work as the teacher. Role switching is simulated, not authentication. You can also open `index.html` locally; browser storage and speech support can differ for local files.

Changes are stored only in this browser's local storage. They are not shared across students, devices or browsers, and clearing browser data removes them. Use fictional content only. **Reset demo** clears this demo's stored state.

Device narration uses browser speech synthesis, not a premium AI service. Voices and Australian accents depend on the device; some installed voices may process text online. The demo itself has no configured server API, analytics, tracking SDK or paid provider keys. GitHub Pages can log visitor IP addresses according to GitHub's policies.

## Not included

This older prototype does not contain the full app's newer guided paragraph reader, Listening Lab, translated Conversation or Live Arena. It cannot provide real authentication, role-based access controls, shared persistence, live multiplayer, secure school administration, recording uploads, premium voices or AI generation. Do not use it for real student records, sensitive text or assessment reporting.

GitHub Pages serves static HTML/CSS/JavaScript; it cannot run the full app's Node.js server or SQLite database. The full source remains private in `jandelayind/lexiquest` and was not replaced for this demo.

## Publishing

Pages uses the `main` branch, root directory `/`. `.nojekyll` prevents Jekyll processing. The classroom demo uses inline assets; Sound Studio uses relative module and stylesheet paths under `phonics/`. Neither needs a build process. No custom domain or payment is required for this public repository within GitHub Pages limits.

Before committing updates, review the entire diff: everything in this repository is public. Never add databases, environment files, private articles, real names, credentials or recordings.

Official references: [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).
