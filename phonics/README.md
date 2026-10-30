# LexiQuest Sound Studio — interactive draft

This is an original six-phase phonics-course prototype for teenage ESL learners, prepared for GitHub Pages at https://jandelayind.github.io/lexiquest-demo/phonics/ . It contains 149 draft lesson plans, a 44-sound reference atlas with mnemonic captions/emoji anchors, word/instruction narration, local teacher-model tools, conditional listen-and-point practice and local practice history. It is not the full published Letters and Sounds programme, a validated SSP, a THRASS product or a complete professionally voiced phonics course.

## Preview

From this folder, with Python 3 installed:

```sh
python3 -m http.server 3002 --bind 127.0.0.1
```

Open http://127.0.0.1:3002/ . Stop the preview with Control-C. The loopback address is for your computer only, not student devices. Do not use `file://`: JavaScript modules, recording permissions and browser storage can behave differently there. No dependencies or paid API keys are needed for this preview.

For automated tests, with Node.js 24 or newer:

```sh
npm test
```

All 62 tests passed on Node.js 26 in the last development block. See `PROGRESS.md` for the actual browser checks and what remains unverified. Tests use synthetic fixtures/fakes where stated, not real teacher phoneme recordings. No claim of human audio-quality review is made.

## Try a learning plan

Open My journey, choose a phase and a lesson. Read the listening and decoding labels carefully. Use Read instructions or Read examples for whole-word device narration; voice availability, accent and processing location depend on your device. The controls never promise that reading a bare letter is a correct isolated sound.

Reflection answers save first and latest results separately. “I practised this aloud” is an explicit self-report, not a speech assessment. Opening the plan or playing TTS does not mark mastery. Practice history survives reload when browser storage is available; blocked, full or corrupt storage is reported. Reset learning history requires confirmation and does not delete sound models or the original classroom demo's data.

## Supply real sound models before independent drills

No phoneme audio library ships with this draft. On Teacher desk, select a sound/accent, confirm permission to use an adult sound model without personal student information, choose or voluntarily record a short clip, play its complete preview, review it and explicitly save. Clips must decode as 0.1–10 seconds and be at most 1 MB. Saving is local to the current browser/profile and origin; these are teacher-labelled models, not independently verified phonemes. Replacing/deleting models requires confirmation. Recording requires a supported browser, a secure context and your explicit microphone permission; there is no background recording or speech recognition.

Listen & point requires at least two saved models with the same Australian or UK accent label. Play the mystery clip fully, then choose a tile. Retries and revealed models remain separate from independent first-try responses. There is no TTS substitute for missing clips. Only completed practice summaries are retained, with at most 50 stored locally. Sound-model accuracy and a complete real-audio browser drill still require teacher review and testing with permitted recordings.

All people sharing a browser profile share its local data; this draft has no learner accounts, real teacher permissions, cross-device sharing, cloud backups, secure gradebook, server integration or pronunciation scoring. Use fictional material only. Narration can use the operating system's online speech provider; review device settings before entering text.

## References and limitations

Read `guide.html` for teaching, accent, privacy and audio notes. The original government publication is linked at https://www.gov.uk/government/publications/letters-and-sounds . The course wording, arrangement and mnemonic captions are original. No THRASS chart, protected artwork or commercial phonics programme is reproduced. Reference UK vowel categories vary across accents; consult an appropriate teacher model rather than marking valid local variants as wrong.

This draft has its own section in the public demo repository and remains separate from the private server-backed LexiQuest app. Publishing source does not upload browser history or sound recordings. Browser data is tied to its origin: local-preview history and clips do not migrate automatically to the published site.
