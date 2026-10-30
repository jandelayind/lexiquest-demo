import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ClipLibrary,clipLibraryMarkup,savedClipRows} from '../clip-library.js';

const blob=new Blob(['synthetic test fixture, not speech'],{type:'audio/wav'});
function harness({inspect=async()=>({duration:1}),confirm=()=>true}={}){
  const elements=new Map();
  const element=selector=>{if(!elements.has(selector))elements.set(selector,{value:'',checked:false,disabled:false,textContent:'',innerHTML:'',pause(){}});return elements.get(selector);};
  element('#clip-sound').value='p';element('#clip-accent').value='en-AU';
  const listeners=new Map(),root={innerHTML:'',querySelector:element,addEventListener:(name,listener)=>listeners.set(name,listener),removeEventListener:name=>listeners.delete(name)};
  const records=new Map();let writes=0,cancelled=0;
  const store={list:async()=>[...records.values()],get:async id=>records.get(id),save:async input=>{writes++;records.set(input.soundId,{id:input.soundId,...input});},remove:async id=>records.delete(id),close:async()=>{}};
  class Player{constructor(audio,callbacks){this.callbacks=callbacks;this.playbackCompleted=false;}load(value){this.loaded=value;this.playbackCompleted=false;}clear(){this.loaded=null;this.playbackCompleted=false;}dispose(){this.disposed=true;}}
  class Recorder{constructor(){this.supported=true;this.busy=false;}cancel(){cancelled++;this.busy=false;}stop(){this.busy=false;}async start(){return blob;}}
  const library=new ClipLibrary(root,{store,inspect,confirm,Player,Recorder});
  return {library,element,records,store,listeners,writes:()=>writes,cancelled:()=>cancelled};
}
test('teacher controls disclose local-only storage, require consent and keep saving disabled initially',()=>{
  const markup=clipLibraryMarkup();
  assert.match(markup,/No upload to a server/);
  assert.match(markup,/id="clip-consent"/);
  assert.match(markup,/data-clip-record disabled/);
  assert.match(markup,/data-clip-save disabled/);
  assert.match(markup,/not verify pronunciation/);
  const setup=harness();assert.equal(setup.element('#clip-file').disabled,true);assert.equal(setup.element('[data-clip-save]').disabled,true);
  setup.library.destroy();
});
test('uploaded audio is decoded but cannot save before complete playback and explicit review',async()=>{
  const setup=harness();
  await assert.rejects(setup.library.upload(blob),/consent/);
  setup.element('#clip-consent').checked=true;await setup.library.upload(blob);
  assert.equal(setup.library.candidate.blob,blob);
  await assert.rejects(setup.library.save(),/Play the complete preview/);
  setup.library.player.playbackCompleted=true;setup.element('#clip-reviewed').checked=true;
  await setup.library.save();assert.equal(setup.writes(),1);assert.ok(setup.records.has('p'));
  assert.match(setup.element('#clip-message').textContent,/saved on this browser only/);
  assert.equal(setup.library.candidate,null);setup.library.destroy();
});
test('a discarded or navigated-away upload cannot resurrect its asynchronously decoded candidate',async()=>{
  let decode;const setup=harness({inspect:()=>new Promise(resolve=>{decode=resolve;})});
  setup.element('#clip-consent').checked=true;const pending=setup.library.upload(blob);
  setup.library.clear();decode({duration:1});await pending;
  assert.equal(setup.library.candidate,null);assert.equal(setup.library.player.loaded,null);
  setup.library.destroy();assert.equal(setup.listeners.size,0);assert.ok(setup.cancelled()>0);
});
test('consent withdrawal and target changes discard previews without deleting saved models',async()=>{
  const setup=harness();setup.records.set('s',{id:'s'});
  setup.element('#clip-consent').checked=true;await setup.library.upload(blob);
  setup.element('#clip-consent').checked=false;await setup.library.handleChange({target:{id:'clip-consent',checked:false}});
  assert.equal(setup.library.candidate,null);assert.equal(setup.records.size,1);
  setup.element('#clip-consent').checked=true;await setup.library.upload(blob);
  await setup.library.handleChange({target:{id:'clip-sound'}});assert.equal(setup.library.candidate,null);
  setup.library.destroy();
});
test('overwriting and deleting a model require confirmation and cancellation preserves existing audio',async()=>{
  const messages=[];const setup=harness({confirm:message=>{messages.push(message);return false;}});
  setup.records.set('p',{id:'p',blob,duration:1,accent:'en-GB'});
  setup.element('#clip-consent').checked=true;await setup.library.upload(blob);
  setup.library.player.playbackCompleted=true;setup.element('#clip-reviewed').checked=true;
  await setup.library.save();assert.equal(setup.writes(),0);assert.equal(setup.records.get('p').accent,'en-GB');
  await setup.library.remove('p');assert.ok(setup.records.has('p'));
  assert.match(messages[0],/Replace/);assert.match(messages[1],/Permanently delete/);setup.library.destroy();
});
test('leaving during an existing-model lookup prevents an unintended late save',async()=>{
  const setup=harness();let lookup;
  setup.element('#clip-consent').checked=true;await setup.library.upload(blob);
  setup.library.player.playbackCompleted=true;setup.element('#clip-reviewed').checked=true;
  setup.store.get=()=>new Promise(resolve=>{lookup=resolve;});
  const saving=setup.library.save();setup.library.destroy();lookup(null);await saving;
  assert.equal(setup.writes(),0);
});
test('storage failures never claim success and leave the candidate available to retry',async()=>{
  const setup=harness();setup.element('#clip-consent').checked=true;await setup.library.upload(blob);
  setup.library.player.playbackCompleted=true;setup.element('#clip-reviewed').checked=true;
  setup.store.save=async()=>{throw Error('Storage full');};
  await assert.rejects(setup.library.save(),/Storage full/);
  assert.equal(setup.writes(),0);assert.ok(setup.library.candidate);assert.equal(setup.library.busy,false);setup.library.destroy();
});
test('saved-model metadata is escaped and does not imply independent phonetic verification',()=>{
  const markup=savedClipRows([{id:'s',duration:1,accent:'<img src=x onerror=alert(1)>'}]);
  assert.ok(!markup.includes('<img'));assert.match(markup,/&lt;img/);assert.match(markup,/not independently verified/);
  assert.match(savedClipRows([]),/missing models never become synthetic phonemes/);
});
