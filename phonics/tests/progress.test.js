import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ProgressStore,PROGRESS_KEY,parseProgress} from '../progress.js';
import {historyView,lessonHistory,historyOverview} from '../history-views.js';
import {course} from '../course.js';

function storage(){const values=new Map([['other-classroom-demo','keep'],['sound-models','keep']]);return {values,getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};}
const complete={finished:true,accent:'en-AU',rounds:6,independentFirstCorrect:3,revealed:2,extraAttempts:4};
test('opening and inspecting plans do not write or mark learning progress',()=>{
  const backing=storage(),store=new ProgressStore({storage:backing});store.lessonRecord('p1-01');store.snapshot();
  assert.equal(backing.values.has(PROGRESS_KEY),false);assert.deepEqual(store.snapshot().lessons,{});
});
test('first reflection stays immutable across retries and survives a fresh store instance',()=>{
  const backing=storage(),store=new ProgressStore({storage:backing});
  store.reflection('p1-01',false);store.reflection('p1-01',true);
  const again=new ProgressStore({storage:backing});
  assert.deepEqual([again.lessonRecord('p1-01').firstCorrect,again.lessonRecord('p1-01').lastCorrect,again.lessonRecord('p1-01').attempts],[false,true,2]);
  assert.equal(again.lessonRecord('p1-01').practised,false);
  assert.throws(()=>store.reflection('__proto__',true),/Unknown/);
  assert.throws(()=>store.reflection('p1-01','true'),/true\/false/);
});
test('self-reported practice is separate from answered reflections and not rendered as mastery',()=>{
  const store=new ProgressStore({storage:storage()});store.practise('p1-01');const record=store.lessonRecord('p1-01');
  assert.equal(record.attempts,0);assert.equal(record.firstCorrect,null);assert.equal(record.practised,true);
  assert.match(lessonHistory(course[0],record),/self-reported/);assert.match(historyOverview(store.snapshot()),/not a proficiency/);
});
test('completed listening summaries are bounded, whitelisted and restricted to valid completed sessions',()=>{
  const store=new ProgressStore({storage:storage()});
  for(let index=0;index<55;index++)store.completeSession({...complete,privateName:'never store'});
  assert.equal(store.snapshot().sessions.length,50);assert.equal(store.snapshot().sessions[0].privateName,undefined);
  for(const invalid of [{...complete,finished:false},{...complete,rounds:99},{...complete,independentFirstCorrect:7},{...complete,revealed:7},{...complete,extraAttempts:-1}])assert.throws(()=>store.completeSession(invalid),/complete, valid/);
  assert.equal(parseProgress(JSON.stringify(store.snapshot())).sessions.length,50);
  assert.equal(store.completeSession({...complete,rounds:1,independentFirstCorrect:1,revealed:1}).saved,true);
});
test('corrupt or blocked storage is not silently overwritten and volatile first attempts remain honest',()=>{
  const backing=storage();backing.values.set(PROGRESS_KEY,'invalid-json');const store=new ProgressStore({storage:backing});
  assert.equal(store.reflection('p1-01',false).saved,false);store.reflection('p1-01',true);
  assert.equal(store.lessonRecord('p1-01').firstCorrect,false);assert.equal(backing.values.get(PROGRESS_KEY),'invalid-json');
  assert.match(historyView(store.snapshot(),{volatile:store.volatile,issue:store.issue}),/unreadable/);
  const blocked=new ProgressStore({storage:null});assert.equal(blocked.practise('p1-01').saved,false);assert.equal(blocked.reset().saved,false);
});
test('a full storage device retains transient state without claiming durability and can retry later',()=>{
  const backing=storage(),store=new ProgressStore({storage:backing});const set=backing.setItem;backing.setItem=()=>{throw Error('quota');};
  assert.equal(store.reflection('p1-01',false).saved,false);assert.equal(store.volatile,true);
  backing.setItem=set;assert.equal(store.reflection('p1-01',true).saved,true);assert.equal(store.volatile,false);
  assert.equal(new ProgressStore({storage:backing}).lessonRecord('p1-01').firstCorrect,false);
});
test('reset affects only the namespaced learning-history key and preserves other browser data',()=>{
  const backing=storage(),store=new ProgressStore({storage:backing});store.practise('p1-01');store.completeSession(complete);
  assert.equal(store.reset().saved,true);assert.deepEqual(store.snapshot(),{version:1,lessons:{},sessions:[]});
  assert.equal(backing.values.get('other-classroom-demo'),'keep');assert.equal(backing.values.get('sound-models'),'keep');assert.equal(backing.values.has(PROGRESS_KEY),false);
});
test('invalid persisted records fail closed, snapshots do not mutate live state, and failed reset preserves history',()=>{
  for(const raw of ['{}',JSON.stringify({version:1,lessons:{unknown:{}},sessions:[]}),JSON.stringify({version:1,lessons:[],sessions:[]})])assert.throws(()=>parseProgress(raw));
  const backing=storage(),store=new ProgressStore({storage:backing});store.practise('p1-01');
  const snapshot=store.snapshot();snapshot.lessons['p1-01'].practised=false;assert.equal(store.lessonRecord('p1-01').practised,true);
  backing.removeItem=()=>{throw Error('blocked');};assert.equal(store.reset().saved,false);assert.equal(store.lessonRecord('p1-01').practised,true);
  const markup=historyView(store.snapshot(),{issue:'<img src=x onerror=alert(1)>'});assert.ok(!markup.includes('<img'));assert.match(markup,/&lt;img/);assert.match(markup,/Scrollable lesson history/);
});
