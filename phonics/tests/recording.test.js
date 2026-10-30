import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PhonemeRecorder} from '../recording.js';

function harness(){
  const instances=[],messages=[];let stopped=0,timer;
  const stream={getTracks:()=>[{stop(){stopped++;}}]};
  class Recorder{
    static isTypeSupported(type){return type==='audio/webm;codecs=opus';}
    constructor(){this.state='inactive';this.mimeType='audio/webm;codecs=opus';instances.push(this);}
    start(){this.state='recording';}
    stop(){this.state='inactive';queueMicrotask(()=>this.onstop?.());}
  }
  const mediaDevices={getUserMedia:async()=>stream};
  const recorder=new PhonemeRecorder({mediaDevices,Recorder,setTimer:callback=>{timer=callback;return 1;},clearTimer:()=>{},onStatus:message=>messages.push(message)});
  return {recorder,instances,messages,mediaDevices,stream,stopped:()=>stopped,timeout:()=>timer()};
}
test('microphone access is never requested without explicit consent and missing capture APIs have an upload fallback',async()=>{
  let requested=0;
  const recorder=new PhonemeRecorder({mediaDevices:{getUserMedia:()=>{requested++;}},Recorder:class{}});
  await assert.rejects(recorder.start(),/consent/);assert.equal(requested,0);
  await assert.rejects(new PhonemeRecorder({mediaDevices:null,Recorder:null}).start({consent:true}),/Upload/);
});
test('capture stops at its time limit, releases tracks and returns only an unsaved preview blob',async()=>{
  const setup=harness();const result=setup.recorder.start({consent:true});await Promise.resolve();
  setup.instances[0].ondataavailable({data:new Blob(['fixture not speech'],{type:'audio/webm'})});
  setup.timeout();const blob=await result;
  assert.ok(blob instanceof Blob);assert.equal(blob.type,'audio/webm;codecs=opus');
  assert.ok(setup.stopped()>0);assert.equal(setup.recorder.busy,false);
  assert.match(setup.messages.at(-1),/review before saving/);
});
test('cancelling while permission is pending stops any late stream without starting capture',async()=>{
  const setup=harness();let grant;
  setup.mediaDevices.getUserMedia=()=>new Promise(resolve=>{grant=resolve;});
  const result=setup.recorder.start({consent:true});setup.recorder.cancel();grant(setup.stream);
  assert.equal(await result,null);assert.equal(setup.instances.length,0);assert.ok(setup.stopped()>0);
});
test('oversized recordings are discarded, concurrent capture is rejected and cancellation resolves safely',async()=>{
  const setup=harness();const result=setup.recorder.start({consent:true});await Promise.resolve();
  await assert.rejects(setup.recorder.start({consent:true}),/already in progress/);
  setup.instances[0].ondataavailable({data:new Blob(['x'.repeat(1000001)],{type:'audio/webm'})});
  assert.equal(await result,null);assert.match(setup.messages.at(-1),/exceeded/);
  const next=setup.recorder.start({consent:true});await Promise.resolve();setup.recorder.cancel();
  assert.equal(await next,null);assert.equal(setup.recorder.busy,false);
});
test('permission denial leaves no active capture or claim that audio was saved',async()=>{
  const setup=harness();setup.mediaDevices.getUserMedia=async()=>{throw Error('denied');};
  assert.equal(await setup.recorder.start({consent:true}),null);
  assert.equal(setup.recorder.busy,false);assert.match(setup.messages.at(-1),/No recording was saved/);
});
test('Stop cancels a pending microphone request, and stale recorder errors cannot stop a newer capture',async()=>{
  const setup=harness();let grant;
  const original=setup.mediaDevices.getUserMedia;
  setup.mediaDevices.getUserMedia=()=>new Promise(resolve=>{grant=resolve;});
  const pending=setup.recorder.start({consent:true});setup.recorder.stop();grant(setup.stream);
  assert.equal(await pending,null);assert.equal(setup.instances.length,0);
  setup.mediaDevices.getUserMedia=original;
  const oldResult=setup.recorder.start({consent:true});await Promise.resolve();const old=setup.instances[0];
  setup.recorder.cancel();assert.equal(await oldResult,null);
  const next=setup.recorder.start({consent:true});await Promise.resolve();
  old.onerror();assert.equal(setup.recorder.busy,true);assert.equal(setup.instances[1].state,'recording');
  setup.recorder.cancel();assert.equal(await next,null);
});
test('platform timer functions retain the global receiver required by browser APIs',()=>{
  let cleared=false;
  const recorder=new PhonemeRecorder({setTimer:function(){assert.equal(this,globalThis);return 1;},clearTimer:function(){assert.equal(this,globalThis);cleared=true;}});
  assert.equal(recorder.setTimer(()=>{},1),1);recorder.cancel();assert.equal(cleared,true);
});
