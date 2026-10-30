import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {course,sounds,phases} from '../course.js';
import {escapeHtml,journeyView,phaseView,lessonView,atlasView,soundDetail,filterSounds,soundCards,practiceView,teacherView} from '../views.js';

test('journey and phase views expose all draft lessons without pretending they are narrated or saved',()=>{
  const journey=journeyView();
  assert.equal((journey.match(/data-phase=/g)||[]).length,6);
  assert.match(journey,/not a completed audio course/);
  for(const phase of phases)assert.equal((phaseView(phase).match(/data-lesson=/g)||[]).length,course.filter(lesson=>lesson.phase===phase.id).length);
  assert.match(teacherView(),/not a secure gradebook/);
  assert.match(practiceView(),/id="listening-lab"/);
});
test('lesson view explicitly separates listening vocabulary from cumulative decoding',()=>{
  const first=course.find(lesson=>lesson.phase===2&&lesson.kind==='gpc');
  const third=course.find(lesson=>lesson.id==='p2-03');
  assert.match(lessonView(first),/Listening vocabulary—not a decoding test/);
  assert.match(lessonView(first),/No whole-word blending is expected yet/);
  assert.match(lessonView(third),/s · a · t/);
  assert.match(lessonView(third),/Reflection history is local practice only/);
  assert.equal((lessonView(third).match(/data-answer=/g)||[]).length,third.choices.length);
});
test('authored text and attributes are escaped rather than executable markup',()=>{
  const malicious='<img src=x onerror="alert(1)">';
  const markup=lessonView({...course[0],title:malicious,words:[malicious],choices:[malicious]});
  assert.ok(!markup.includes('<img'));
  assert.match(markup,/&lt;img/);
  assert.ok(!markup.includes('data-answer="<'));
  const detail=soundDetail({...sounds[0],word:malicious,mouth:malicious});
  assert.ok(!detail.includes('<img'));
  assert.equal(escapeHtml('"<&'), '&quot;&lt;&amp;');
});
test('atlas searches words, IPA and spellings and distinguishes sound families',()=>{
  assert.equal(filterSounds().length,44);
  assert.equal(filterSounds('', 'consonant').length,24);
  assert.equal(filterSounds('', 'vowel').length,20);
  assert.ok(filterSounds(' MOON ').some(sound=>sound.id==='oo-long'));
  assert.ok(filterSounds('θ').some(sound=>sound.id==='th-air'));
  assert.equal(filterSounds('<script>').length,0);
  assert.match(soundCards([]),/No sounds match/);
  const atlas=atlasView();
  assert.equal((atlas.match(/data-sound=/g)||[]).length,44);
  assert.equal((atlas.match(/aria-label="Explore/g)||[]).length,44);
  assert.match(atlas,/not audio/);
});
test('entry-point assets and guide exist without touching the original demo',()=>{
  for(const file of ['index.html','studio.js','studio.css','views.js','course.js','guide.html','narration.js','narration.css','clips.js','recording.js','clip-library.js','clips.css','drill.js','listening-lab.js','listening.css','progress.js','history-views.js','history.css'])assert.ok(fs.existsSync(new URL('../'+file,import.meta.url)),file);
  const entry=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(entry,/connect-src 'none'/);
  assert.match(entry,/href="guide.html"/);
  const script=fs.readFileSync(new URL('../studio.js',import.meta.url),'utf8');
  assert.ok(!/fetch\(|getUserMedia|speechSynthesis/.test(script));
});
test('narration controls distinguish whole-word speech from sound clips and stop on navigation',()=>{
  const lesson=lessonView(course[0]);
  assert.match(lesson,/data-read-lesson=/);
  assert.match(lesson,/data-read-examples=/);
  const detail=soundDetail(sounds[0]);
  assert.match(detail,/data-read-anchor="p"/);
  assert.match(detail,/Whole-word device speech—not an isolated/);
  const script=fs.readFileSync(new URL('../studio.js',import.meta.url),'utf8');
  assert.match(script,/if\(sound\)narrate\(sound.word\)/);
  assert.match(script,/window.addEventListener\('pagehide',\(\)=>\{narrator.stop\(\)/);
  assert.match(script,/clipLibrary\?\.destroy\(\)/);
  assert.match(script,/function render[\s\S]*?narrator.stop\(false\)/);
});
