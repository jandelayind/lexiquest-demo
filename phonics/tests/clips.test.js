import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CLIP_LIMITS,audioTypedFile,validateClipBlob,inspectClip,reviewedClip,usableClip,LocalClipStore,SoundClipPlayer} from '../clips.js';

const blob=new Blob(['synthetic test bytes, not a phoneme recording'],{type:'audio/wav'});
const input={soundId:'s',blob,duration:1,accent:'en-AU',source:'upload',consent:true,reviewed:true,playbackCompleted:true};
test('audio inputs are constrained to known sound IDs, supported formats and bounded sizes/durations',()=>{
  assert.equal(validateClipBlob(blob),blob);
  for(const invalid of [new Blob([],{type:'audio/wav'}),new Blob(['x'],{type:'text/html'}),new Blob(['x'.repeat(CLIP_LIMITS.bytes+1)],{type:'audio/wav'})])assert.throws(()=>validateClipBlob(invalid));
  for(const changes of [{soundId:'x'},{duration:Infinity},{duration:11},{duration:0},{accent:'invented'},{source:'url'}])assert.throws(()=>reviewedClip({...input,...changes}));
});
test('saving requires explicit rights consent, completed playback and human review',()=>{
  for(const changes of [{consent:false},{consent:'true'},{playbackCompleted:false},{reviewed:false}])assert.throws(()=>reviewedClip({...input,...changes}));
  const saved=reviewedClip({...input,filename:'private-child-name.wav',password:'do-not-store'},new Date('2026-10-29T10:54:00Z'));
  assert.deepEqual(Object.keys(saved),['id','blob','duration','accent','source','reviewed','reviewedAt','version']);
  assert.equal(saved.reviewedAt,'2026-10-29T10:54:00.000Z');
  assert.equal(usableClip(saved),true);
  assert.equal(usableClip({...saved,version:99}),false);
  assert.equal(usableClip({...saved,reviewed:false}),false);
});
test('audio decoding rejects corrupt or long files and always closes its decoder',async()=>{
  let closed=0;
  class Decoder{async decodeAudioData(){return {duration:1,numberOfChannels:1};}async close(){closed++;}}
  assert.deepEqual(await inspectClip(blob,Decoder),{duration:1,channels:1});
  class TooLong extends Decoder{async decodeAudioData(){return {duration:11};}}
  await assert.rejects(inspectClip(blob,TooLong),/between 0.1 and 10/);
  class Corrupt extends Decoder{async decodeAudioData(){throw Error('invalid');}}
  await assert.rejects(inspectClip(blob,Corrupt),/could not be decoded/);
  await assert.rejects(inspectClip(blob,null),/cannot inspect/);
  assert.equal(closed,3);
});
test('unavailable local storage fails without claiming a save or using the classroom demo storage',async()=>{
  const store=new LocalClipStore(null);
  await assert.rejects(store.save(input),/unavailable/);
  await assert.rejects(store.save({...input,reviewed:false}),/reviewed/);
  assert.equal(await store.get('unknown'),null);
  assert.notEqual(CLIP_LIMITS.database,'jexi');
});
test('preview completion is reset on replay/replacement and object URLs/listeners are cleaned up',()=>{
  const events=new Map(),revoked=[],messages=[];
  const audio={addEventListener:(name,listener)=>events.set(name,listener),removeEventListener:name=>events.delete(name),pause(){},removeAttribute(){},load(){}};
  let count=0;
  const player=new SoundClipPlayer(audio,{url:{createObjectURL:()=>`blob:test-${++count}`,revokeObjectURL:value=>revoked.push(value)},onStatus:message=>messages.push(message)});
  player.load(blob);assert.equal(player.playbackCompleted,false);
  events.get('play')();events.get('ended')();assert.equal(player.playbackCompleted,false);
  audio.currentSrc=audio.src;audio.ended=true;events.get('ended')();assert.equal(player.playbackCompleted,true);
  events.get('play')();assert.equal(player.playbackCompleted,false);
  player.load(blob);assert.deepEqual(revoked,['blob:test-1']);
  events.get('ended')();assert.equal(player.playbackCompleted,false);
  events.get('error')();assert.match(messages.at(-1),/could not play/);
  player.dispose();assert.deepEqual(revoked,['blob:test-1','blob:test-2']);assert.equal(events.size,0);
  assert.throws(()=>player.load(blob),/closed/);
});
function storageHarness(){
  const records=new Map(),opened=[];let failWrite=false;
  const database={objectStoreNames:{contains:()=>true},close(){},transaction(storeName,mode){
    const transaction={objectStore:()=>({get:id=>request(()=>records.get(id)),getAll:()=>request(()=>[...records.values()]),put:value=>request(()=>records.set(value.id,value)),delete:id=>request(()=>records.delete(id))})};
    function request(operation){
      const result={};
      queueMicrotask(()=>{
        if(failWrite&&mode==='readwrite'){transaction.onabort?.();return;}
        result.result=operation();result.onsuccess?.();transaction.oncomplete?.();
      });
      return result;
    }
    return transaction;
  }};
  const indexedDB={open(name,version){opened.push({name,version});const request={};queueMicrotask(()=>{request.result=database;request.onsuccess();});return request;}};
  return {store:new LocalClipStore(indexedDB),records,opened,setFail:()=>{failWrite=true;}};
}
test('local clip transactions save one reviewed model per sound, filter corrupt records and delete only the selected sound',async()=>{
  const setup=storageHarness();
  await setup.store.save(input);await setup.store.save({...input,soundId:'m'});await setup.store.save({...input,accent:'en-GB'});
  assert.equal((await setup.store.list()).length,2);
  assert.equal((await setup.store.get('s')).accent,'en-GB');
  assert.deepEqual(setup.opened,[{name:CLIP_LIMITS.database,version:1}]);
  setup.records.set('bad',{id:'bad'});assert.equal((await setup.store.list()).length,2);
  await setup.store.remove('s');assert.equal(await setup.store.get('s'),null);assert.ok(await setup.store.get('m'));
  await assert.rejects(setup.store.remove('unknown'),/Unknown/);
  await setup.store.close();
});
test('failed storage transactions do not report success or overwrite the prior model',async()=>{
  const setup=storageHarness();await setup.store.save(input);setup.setFail();
  await assert.rejects(setup.store.save({...input,accent:'en-GB'}),/not saved/);
  assert.equal((await setup.store.get('s')).accent,'en-AU');
});

test('files browsers actually label are accepted: m4a variants and audio-only webm',()=>{
  for(const type of ['audio/x-m4a','audio/m4a','audio/mp4','audio/mp3','audio/wave'])assert.ok(validateClipBlob(new Blob(['x'],{type})));
  const webm=audioTypedFile(new Blob(['x'],{type:'video/webm'}));
  assert.equal(webm.type,'audio/webm');assert.ok(validateClipBlob(webm));
  assert.throws(()=>validateClipBlob(new Blob(['x'],{type:'video/webm'})),/supported/);
  assert.throws(()=>validateClipBlob(audioTypedFile(new Blob(['x'],{type:'video/mp4'}))),/supported/);
  const wav=new Blob(['x'],{type:'audio/wav'});assert.equal(audioTypedFile(wav),wav);
});
