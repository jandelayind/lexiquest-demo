import {lessonById,soundById,phases,checkAnswer} from './course.js';
import {journeyView,phaseView,lessonView,atlasView,soundCards,soundDetail,filterSounds,practiceView,teacherView} from './views.js';
import {WordNarrator} from './narration.js';
import {ClipLibrary} from './clip-library.js';
import {ListeningLab} from './listening-lab.js';
import {ProgressStore} from './progress.js';
import {lessonHistory,historyOverview,historyView} from './history-views.js';

const main=document.querySelector('#main');
const status=document.querySelector('#status');
let currentLesson=null;
let clipLibrary=null;
let listeningLab=null;
const learningProgress=new ProgressStore();
const voiceSelect=document.querySelector('#narration-voice');
const pauseButton=document.querySelector('[data-narration-pause]');
const stopButton=document.querySelector('[data-narration-stop]');
const narrator=new WordNarrator({onVoices:refreshVoiceChoices,onStatus:(message,state)=>{
  document.querySelector('#narration-status').textContent=message;
  pauseButton.disabled=!state.playing;stopButton.disabled=!state.playing;
  pauseButton.textContent=state.paused?'Resume':'Pause';
}});
function refreshVoiceChoices(){
  const previous=voiceSelect.value;
  const voices=narrator.voices();
  voiceSelect.replaceChildren();
  for(const voice of voices){
    const option=document.createElement('option');option.value=voice.voiceURI;
    option.textContent=`${voice.name} · ${voice.lang} · ${voice.localService?'device reports local':'may use online processing'}`;
    voiceSelect.append(option);
  }
  if(voices.some(voice=>voice.voiceURI===previous))voiceSelect.value=previous;
  if(!voices.length){const option=document.createElement('option');option.textContent='No English voice loaded';option.value='';voiceSelect.append(option);}
  voiceSelect.disabled=!voices.length;
}
function narrate(text){clipLibrary?.pause();listeningLab?.pause();narrator.speak(text,{voiceURI:voiceSelect.value,rate:document.querySelector('#narration-rate').value});}

function announce(message){status.textContent=message;}
function recordResult(result){announce(result.message);return result;}
function updateLessonHistory(){
  const panel=main.querySelector('#lesson-progress');
  if(panel&&currentLesson)panel.innerHTML=lessonHistory(currentLesson,learningProgress.snapshot().lessons[currentLesson.id],learningProgress.volatile);
}
function render(markup,section='lesson',focus=true){
  clipLibrary?.destroy();clipLibrary=null;
  listeningLab?.destroy();listeningLab=null;
  narrator.stop(false);
  pauseButton.disabled=true;stopButton.disabled=true;pauseButton.textContent='Pause';
  document.querySelector('#narration-status').textContent='Ready for word narration · Not a pure phoneme model';
  currentLesson=null;
  main.innerHTML=markup;
  const libraryRoot=main.querySelector('#clip-library');
  if(libraryRoot)clipLibrary=new ClipLibrary(libraryRoot,{stopNarration:()=>narrator.stop()});
  const listeningRoot=main.querySelector('#listening-lab');
  if(listeningRoot)listeningLab=new ListeningLab(listeningRoot,{stopNarration:()=>narrator.stop(),onComplete:summary=>recordResult(learningProgress.completeSession(summary))});
  if(section==='home')main.insertAdjacentHTML('beforeend',historyOverview(learningProgress.snapshot(),learningProgress.volatile));
  for(const button of document.querySelectorAll('nav [data-view]')){
    if(button.dataset.view===(section==='lesson'?'home':section))button.setAttribute('aria-current','page');
    else button.removeAttribute('aria-current');
  }
  if(focus){main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
  status.textContent='';
}
function openView(view){
  const views={home:journeyView,atlas:atlasView,practice:practiceView,teacher:teacherView,progress:()=>historyView(learningProgress.snapshot(),{volatile:learningProgress.volatile,issue:learningProgress.issue})};
  if(views[view])render(views[view](),view);
}
function updateAtlas(){
  const query=document.querySelector('#sound-search').value;
  const category=document.querySelector('#sound-category').value;
  const matches=filterSounds(query,category);
  document.querySelector('#sound-grid').innerHTML=soundCards(matches);
  document.querySelector('#sound-count').textContent=`${matches.length} sound${matches.length===1?'':'s'}`;
}
document.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button)return;
  if(button.hasAttribute('data-narration-refresh')){refreshVoiceChoices();announce('Device voice list refreshed.');return;}
  if(button.hasAttribute('data-narration-pause')){narrator.togglePause();return;}
  if(button.hasAttribute('data-narration-stop')){narrator.stop();return;}
  if(button.hasAttribute('data-read-lesson')&&currentLesson){narrate(currentLesson.instruction);return;}
  if(button.hasAttribute('data-read-examples')&&currentLesson){narrate(currentLesson.sentence);return;}
  if(button.hasAttribute('data-read-anchor')){const sound=soundById(button.dataset.readAnchor);if(sound)narrate(sound.word);return;}
  if(button.hasAttribute('data-mark-practised')&&currentLesson){recordResult(learningProgress.practise(currentLesson.id));updateLessonHistory();return;}
  if(button.hasAttribute('data-reset-progress')){
    if(window.confirm('Reset only Sound Studio learning history on this browser? Sound models, classroom-demo data and school records will not be deleted.')){const result=learningProgress.reset();openView('progress');recordResult(result);}
    return;
  }
  if(button.hasAttribute('data-view'))return openView(button.dataset.view);
  if(button.hasAttribute('data-phase')){
    const phase=phases.find(item=>item.id===Number(button.dataset.phase));
    if(phase)render(phaseView(phase));
    return;
  }
  if(button.hasAttribute('data-lesson')){
    const lesson=lessonById(button.dataset.lesson);
    if(lesson){render(lessonView(lesson));currentLesson=lesson;updateLessonHistory();}
    return;
  }
  if(button.hasAttribute('data-answer')&&currentLesson){
    const correct=checkAnswer(currentLesson,button.dataset.answer);
    recordResult(learningProgress.reflection(currentLesson.id,correct));updateLessonHistory();
    document.querySelector('#answer-feedback').textContent=correct?'That matches the teaching idea. Try explaining it in your own words.':'Try again. Revisit the teaching notes or ask for another model.';
    return;
  }
  if(button.hasAttribute('data-sound')){
    const sound=soundById(button.dataset.sound);
    if(!sound)return;
    for(const tile of document.querySelectorAll('[data-sound]'))tile.setAttribute('aria-pressed',String(tile===button));
    const detail=document.querySelector('#sound-detail');
    detail.innerHTML=soundDetail(sound);
    detail.focus({preventScroll:true});
    detail.scrollIntoView({block:'nearest',behavior:'instant'});
    announce(`${sound.word}: ${sound.mnemonic}`);
    return;
  }
  if(button.hasAttribute('data-print')){
    document.querySelector('#sound-search').value='';
    document.querySelector('#sound-category').value='all';
    updateAtlas();
    window.print();
  }
});
document.addEventListener('input',event=>{if(event.target.id==='sound-search')updateAtlas();});
document.addEventListener('change',event=>{if(event.target.id==='sound-category')updateAtlas();});
window.addEventListener('pagehide',()=>{narrator.stop();clipLibrary?.destroy();clipLibrary=null;listeningLab?.destroy();listeningLab=null;});
window.addEventListener('pageshow',event=>{if(event.persisted&&main.querySelector('#clip-library'))openView('teacher');else if(event.persisted&&main.querySelector('#listening-lab'))openView('practice');});
refreshVoiceChoices();
render(journeyView(),'home',false);
