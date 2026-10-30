import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ListeningLab} from '../listening-lab.js';
import {reviewedClip} from '../clips.js';

const model=(soundId,accent='en-AU')=>reviewedClip({soundId,accent,blob:new Blob(['synthetic test bytes, not speech'],{type:'audio/wav'}),duration:1,consent:true,reviewed:true,playbackCompleted:true});
function harness(clips=[model('p'),model('s'),model('m')],overrides={}){
  const elements=new Map(),listeners=new Map();
  const field=selector=>{if(!elements.has(selector))elements.set(selector,{value:'',textContent:'',innerHTML:'',hidden:true,disabled:false,currentTime:0,focus(){this.focused=true;},pause(){},play:async()=>{}});return elements.get(selector);};
  field('#drill-accent').value='en-AU';
  const root={innerHTML:'',querySelector:field,addEventListener:(name,listener)=>listeners.set(name,listener),removeEventListener:name=>listeners.delete(name)};
  class Player{constructor(audio,callbacks){this.callbacks=callbacks;this.playbackCompleted=false;}clear(){this.playbackCompleted=false;}load(blob){this.loaded=blob;this.callbacks.onStatus('Supplied clip loaded.');}dispose(){this.disposed=true;}}
  const completed=[];
  const lab=new ListeningLab(root,{store:{list:async()=>clips,close:async()=>{}},Player,confirm:()=>true,onComplete:summary=>completed.push(summary),...overrides});
  return {lab,field,listeners,completed};
}
test('empty models leave Start disabled and explain the missing-model requirement',async()=>{
  const setup=harness([]);await setup.lab.refresh();
  assert.equal(setup.field('[data-drill-start]').disabled,true);
  assert.match(setup.field('#drill-availability').textContent,/Add at least two/);
  assert.throws(()=>setup.lab.start(),/at least two/);setup.lab.destroy();
});
test('clip-player completion callbacks unlock answers and a complete practice reports once',async()=>{
  const setup=harness();await setup.lab.refresh();setup.lab.start();
  assert.equal(setup.lab.session.heard,false);
  assert.throws(()=>setup.lab.answer(setup.lab.session.round.target.id),/complete/);
  for(let index=0;index<6;index++){
    setup.lab.player.callbacks.onPlay();setup.lab.player.playbackCompleted=true;setup.lab.player.callbacks.onStatus('finished');
    assert.equal(setup.lab.session.heard,true);
    if(index===0){const wrong=setup.lab.session.round.options.find(sound=>sound.id!==setup.lab.session.round.target.id);setup.lab.answer(wrong.id);}
    setup.lab.answer(setup.lab.session.round.target.id);assert.equal(setup.field('[data-drill-next]').focused,true);setup.lab.next();
  }
  setup.lab.finish();assert.equal(setup.completed.length,1);
  assert.equal(setup.completed[0].independentFirstCorrect,5);assert.equal(setup.completed[0].extraAttempts,1);
  assert.match(setup.field('#drill-summary').innerHTML,/not saved yet/);setup.lab.destroy();assert.equal(setup.listeners.size,0);
});
test('revealing a model enables supported progression without adding an independent success',async()=>{
  const setup=harness();await setup.lab.refresh();setup.lab.start();setup.lab.reveal();
  assert.equal(setup.field('[data-drill-next]').disabled,false);
  assert.match(setup.field('#drill-hint').innerHTML,/supported practice/);
  assert.equal(setup.lab.session.summary().independentFirstCorrect,0);setup.lab.destroy();
});
test('an accent change while initial storage is loading uses the requested accent rather than discarding the loaded list',async()=>{
  let resolve;
  const setup=harness([],{store:{list:()=>new Promise(done=>{resolve=done;}),close:async()=>{}}});
  setup.field('#drill-accent').value='en-GB';setup.lab.changeAccent();resolve([model('p','en-GB'),model('s','en-GB'),model('m')]);
  await Promise.resolve();await Promise.resolve();
  assert.equal(setup.lab.available().length,2);assert.equal(setup.field('[data-drill-start]').disabled,false);setup.lab.destroy();
});
test('late storage results after navigation cannot re-enable controls or resurrect a session',async()=>{
  let resolve;
  const setup=harness([],{store:{list:()=>new Promise(done=>{resolve=done;}),close:async()=>{}}});
  setup.lab.destroy();resolve([model('p'),model('s')]);await Promise.resolve();await Promise.resolve();
  assert.equal(setup.lab.session,null);assert.deepEqual(setup.lab.clips,[]);
});
test('refresh errors remain visible even with no active round, and never start TTS',async()=>{
  const setup=harness([],{store:{list:async()=>{throw Error('Storage is blocked.');},close:async()=>{}}});
  await assert.rejects(setup.lab.refresh(),/blocked/);setup.lab.message('Storage is blocked.');
  assert.match(setup.field('#drill-availability').textContent,/blocked/);
  assert.equal(setup.field('[data-drill-start]').disabled,true);setup.lab.destroy();
});
