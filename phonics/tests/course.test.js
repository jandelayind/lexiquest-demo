import {test} from 'node:test';
import assert from 'node:assert/strict';
import {course,sounds,phases,progression,sourceLinks,lessonById,soundById,checkAnswer,normaliseAnswer,phaseTwoDecoding,makeRound,shuffle} from '../course.js';

test('the draft covers all six phases with unique lesson identifiers',()=>{
  assert.deepEqual(phases.map(phase=>phase.id),[1,2,3,4,5,6]);
  assert.equal(course.length,149);
  assert.equal(new Set(course.map(lesson=>lesson.id)).size,course.length);
  assert.deepEqual(phases.map(phase=>course.filter(lesson=>lesson.phase===phase.id).length),[7,26,30,7,59,20]);
  for(const lesson of course){
    assert.equal(lessonById(lesson.id),lesson);
    assert.ok(lesson.title&&lesson.instruction&&lesson.sentence&&lesson.task);
    assert.ok(lesson.choices.length>=2);
    assert.equal(new Set(lesson.choices.map(normaliseAnswer)).size,lesson.choices.length);
    assert.ok(lesson.choices.includes(lesson.answer),lesson.id);
    for(const sound of lesson.focus)assert.ok(soundById(sound),`${lesson.id}: ${sound}`);
  }
});

test('the sound atlas has 24 consonants and 20 reference vowels, with original mnemonic metadata',()=>{
  assert.equal(sounds.length,44);
  assert.equal(new Set(sounds.map(sound=>sound.id)).size,44);
  assert.equal(sounds.filter(sound=>sound.category==='consonant').length,24);
  assert.equal(sounds.filter(sound=>sound.category==='vowel').length,20);
  for(const sound of sounds){
    assert.ok(sound.ipa&&sound.word&&sound.graphic&&sound.mnemonic&&sound.mouth);
    assert.ok(sound.spellings.length);
  }
  assert.notEqual(soundById('th-air').ipa,soundById('th-voice').ipa);
  assert.notEqual(soundById('oo-short').ipa,soundById('oo-long').ipa);
  assert.match(soundById('ure').mouth,/merge/);
  assert.match(soundById('air').mouth,/UK\/Australian/);
});

test('phase two follows the initial letter sequence and separates listening vocabulary from cumulative decoding',()=>{
  assert.deepEqual(progression.phase2,['s','a','t','p','i','n','m','d','g','o','c','k','ck','e','u','r','h','b','f','ff','l','ll','ss']);
  const lessons=course.filter(lesson=>lesson.phase===2&&lesson.kind==='gpc');
  assert.deepEqual(lessons[0].decodeWords,[]);
  assert.deepEqual(lessons[1].decodeWords,[]);
  assert.deepEqual(lessons[2].decodeWords,['sat']);
  assert.ok(lessons[0].listeningWords.includes('sun'));
  assert.ok(!lessons[0].decodeWords.includes('sun'));
  assert.ok(!lessons[3].decodeWords.includes('pin'));
  for(const lesson of lessons){
    assert.match(lesson.instruction,/not a reading test/);
    for(const {word,segments} of lesson.decoding){
      assert.equal(segments.join(''),word.toLowerCase());
      assert.ok(segments.every(segment=>lesson.knownGraphemes.includes(segment)));
      assert.deepEqual(phaseTwoDecoding(word,lesson.knownGraphemes),segments);
    }
    assert.equal(lesson.decodableText,lesson.decodeWords.join('. '));
  }
});

test('phase-two segmentation preserves taught digraphs and rejects untaught spellings',()=>{
  assert.deepEqual(phaseTwoDecoding('sock',['s','o','c','k','ck']),['s','o','ck']);
  assert.deepEqual(phaseTwoDecoding('bell',['b','e','l','ll']),['b','e','ll']);
  assert.equal(phaseTwoDecoding('sun',['s','a','t','p']),null);
  assert.equal(phaseTwoDecoding('',[]),null);
});

test('multi-phoneme spellings are not presented as extra single sounds',()=>{
  const letterX=course.find(lesson=>lesson.title==='Explore x');
  const qu=course.find(lesson=>lesson.title==='Explore qu');
  assert.deepEqual(letterX.focus,['k','s']);
  assert.deepEqual(qu.focus,['k','w']);
  assert.match(letterX.instruction,/two sounds/);
  assert.match(qu.instruction,/two sounds/);
  assert.equal(soundById('x'),undefined);
  assert.equal(soundById('qu'),undefined);
  const ur=course.find(lesson=>lesson.title==='Explore ur');
  assert.deepEqual(ur.words,['turn','hurt','surf']);
  assert.ok(ur.words.every(word=>word.includes('ur')));
});

test('phase five includes the alternative graphemes and all five split digraphs',()=>{
  assert.deepEqual(progression.phase5,['ay','ou','ie','ea','oy','ir','ue','aw','wh','ph','ew','oe','au','ey','a-e','e-e','i-e','o-e','u-e']);
  assert.equal(course.filter(lesson=>lesson.phase===5&&lesson.kind==='alternative').length,13);
  assert.ok(course.some(lesson=>lesson.phase===6&&lesson.title==='Past tense, three endings'));
  assert.ok(course.some(lesson=>lesson.phase===6&&lesson.title==='Proofread in layers'));
  assert.ok(Object.values(sourceLinks).every(link=>new URL(link).protocol==='https:'));
});

test('answer checks accept harmless casing and spacing, but not a different response',()=>{
  const lesson=course[0];
  assert.equal(checkAnswer(lesson,'  A SOFT, STEADY HUM  '),true);
  assert.equal(checkAnswer(lesson,lesson.choices[1]),false);
  assert.equal(checkAnswer(lesson,null),false);
  assert.equal(normaliseAnswer('two   sounds'),'two sounds');
});

test('listen-and-point rounds include one target among unique options and never mutate the atlas',()=>{
  const before=sounds.map(sound=>sound.id);
  for(let index=0;index<50;index++){
    const round=makeRound(sounds);
    assert.equal(round.options.length,6);
    assert.equal(round.options.filter(sound=>sound.id===round.target.id).length,1);
    assert.equal(new Set(round.options.map(sound=>sound.id)).size,6);
  }
  assert.deepEqual(sounds.map(sound=>sound.id),before);
  assert.throws(()=>makeRound([sounds[0]]),/at least two/);
  assert.equal(makeRound(sounds.slice(0,2),()=>0).options.length,2);
  assert.deepEqual(shuffle([1,2,3],()=>0),[2,3,1]);
});
