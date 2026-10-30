import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reviewedClip} from '../clips.js';
import {drillClips,ListeningSession} from '../drill.js';
import {listeningMarkup,drillOptions} from '../listening-lab.js';

const clip=id=>reviewedClip({soundId:id,blob:new Blob(['test fixture, not real speech'],{type:'audio/wav'}),duration:1,accent:'en-AU',consent:true,reviewed:true,playbackCompleted:true});
const clips=[clip('s'),clip('m'),clip('p')];
test('practice requires two stored-model records with valid metadata and one known accent label',()=>{
  assert.throws(()=>new ListeningSession([]),/at least two/);
  assert.throws(()=>new ListeningSession([clips[0],{...clips[1],accent:'en-GB'}]),/at least two/);
  assert.equal(drillClips([...clips,clips[0],{...clips[1],reviewed:false}],'en-AU').length,3);
  assert.equal(drillClips(clips,'other').length,0);
  assert.throws(()=>new ListeningSession(clips,{rounds:0}),/between 1 and 20/);
});
test('answering requires a finished clip and only displayed choices are accepted',()=>{
  const session=new ListeningSession(clips,{rounds:2,random:()=>0});session.next();
  assert.equal(session.clip().id,session.round.target.id);
  assert.throws(()=>session.answer('s'),/complete sound clip/);
  session.markHeard();assert.throws(()=>session.answer('not-a-tile'),/displayed/);
  assert.throws(()=>session.next(),/Answer correctly or reveal/);
});
test('retrying can complete a round but never rewrites first-attempt correctness',()=>{
  const session=new ListeningSession(clips,{rounds:1,random:()=>0});session.next();session.markHeard();
  const wrong=session.round.options.find(sound=>sound.id!==session.round.target.id);
  assert.equal(session.answer(wrong.id).correct,false);assert.equal(session.record.firstCorrect,false);
  session.replay();assert.throws(()=>session.answer(session.round.target.id),/complete/);session.markHeard();
  assert.equal(session.answer(session.round.target.id).correct,true);
  assert.equal(session.answer(session.round.target.id).alreadyAnswered,true);
  session.next();assert.deepEqual(session.summary(),{finished:true,accent:'en-AU',rounds:1,independentFirstCorrect:0,revealed:0,extraAttempts:1});
});
test('revealed answers count as supported practice, not independent first-try success',()=>{
  const session=new ListeningSession(clips,{rounds:1});session.next();const target=session.reveal();session.markHeard();
  session.answer(target.id);session.next();assert.equal(session.summary().independentFirstCorrect,0);assert.equal(session.summary().revealed,1);
});
test('a six-round session finishes once, with bounded counts and no extra rounds after completion',()=>{
  const session=new ListeningSession(clips);
  for(let index=0;index<6;index++){session.next();session.markHeard();session.answer(session.round.target.id);}
  assert.equal(session.next(),null);assert.equal(session.finished,true);assert.equal(session.next(),null);
  assert.equal(session.summary().rounds,6);assert.equal(session.summary().independentFirstCorrect,6);
  assert.throws(()=>session.answer('s'),/Start a sound round/);
});
test('blind rounds expose no target-specific instruction or hidden answer attributes before feedback',()=>{
  const session=new ListeningSession(clips,{random:()=>0});const round=session.next();
  const markup=drillOptions(round);
  assert.equal((markup.match(/data-drill-answer=/g)||[]).length,3);
  assert.equal((markup.match(/disabled/g)||[]).length,3);
  assert.ok(!markup.includes('data-correct'));
  assert.ok(!drillOptions(round,{heard:true}).includes('disabled'));
  assert.match(listeningMarkup(),/Mystery sound model/);
  assert.match(listeningMarkup(),/Missing clips never become TTS/);
});
