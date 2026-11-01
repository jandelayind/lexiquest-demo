import {escapeHtml} from './views.js';
import {LocalClipStore,SoundClipPlayer} from './clips.js';
import {drillClips,ListeningSession} from './drill.js';

export function listeningMarkup(){
  return `<h2>Listen & point practice</h2><p>Six untimed rounds. Use teacher-reviewed clips with one accent label. Models are human-labelled, not independently verified; valid accent differences are not an ability score.</p><label for="drill-accent">Model accent</label><select id="drill-accent"><option value="en-AU">Australian English</option><option value="en-GB">UK English</option></select><p id="drill-availability" role="status">Checking local sound models…</p><div class="drill-actions"><button type="button" data-drill-refresh>Refresh models</button><button type="button" data-drill-start disabled>Start six sounds</button><button type="button" data-view="teacher">Add teacher sound models</button></div><p class="notice">No sound models ship with this draft. Add at least two permitted models with the same accent label on Teacher desk. Missing clips never become TTS letter names or guessed phonemes. Completed practice can be saved locally when storage is available; no shared classroom records.</p><section id="drill-round" hidden aria-label="Current listening round"><h3 id="drill-title">Listen first</h3><p id="drill-status" role="status" aria-live="polite"></p><audio id="drill-audio" controls preload="metadata" aria-label="Mystery sound model"></audio><div class="drill-actions"><button type="button" data-drill-replay>Replay sound</button><button type="button" data-drill-reveal>Show the model</button><button type="button" data-drill-next disabled>Next sound</button></div><div id="drill-options" class="drill-grid"></div><div id="drill-hint" class="reading-panel" hidden></div></section><section id="drill-summary" class="reading-panel" hidden aria-label="Practice summary"></section>`;
}
export function drillOptions(round,{heard=false,resolved=false}={}){
  return round.options.map(sound=>`<button type="button" class="sound-tile ${sound.category}" data-drill-answer="${sound.id}" ${!heard||resolved?'disabled':''} ><span class="sr-only">Choose </span><span class="picture" aria-hidden="true">${sound.graphic}</span><strong>/${escapeHtml(sound.ipa)}/</strong><span>${escapeHtml(sound.word)}</span></button>`).join('');
}
export class ListeningLab{
  constructor(root,{store=new LocalClipStore(),Player=SoundClipPlayer,stopNarration=()=>{},confirm=message=>globalThis.confirm(message),onComplete=()=>{}}={}){
    this.root=root;this.store=store;this.stopNarration=stopNarration;this.confirm=confirm;this.onComplete=onComplete;
    this.disposed=false;this.generation=0;this.clips=[];this.session=null;this.reported=false;
    root.innerHTML=listeningMarkup();this.field=id=>root.querySelector('#'+id);
    this.player=new Player(this.field('drill-audio'),{onPlay:()=>{this.stopNarration();this.session?.replay();this.draw();},onStatus:message=>{
      if(this.disposed)return;
      if(this.player.playbackCompleted){this.session?.markHeard();this.message('Sound finished. Choose a tile, or replay.');this.draw();}
      else this.message(message);
    }});
    this.clickListener=event=>{this.handleClick(event).catch(error=>this.message(error.message));};
    this.changeListener=event=>{if(event.target.id==='drill-accent')this.changeAccent();};
    root.addEventListener('click',this.clickListener);root.addEventListener('change',this.changeListener);
    this.refresh().catch(error=>{if(!this.disposed)this.field('drill-availability').textContent=error.message;});
  }
  message(text){if(!this.disposed){this.field('drill-status').textContent=text;if(text&&this.field('drill-round').hidden)this.field('drill-availability').textContent=text;}}
  available(){return drillClips(this.clips,this.field('drill-accent').value);}
  updateAvailability(){
    if(this.disposed)return;
    const available=this.available();
    this.field('drill-availability').textContent=`${available.length} reviewed sound model${available.length===1?'':'s'} for this accent label. ${available.length<2?'Add at least two to begin.':'Ready for practice.'}`;
    this.root.querySelector('[data-drill-start]').disabled=available.length<2;
  }
  reset(){
    this.generation++;this.player.clear();this.session=null;this.reported=false;
    this.field('drill-round').hidden=true;this.field('drill-summary').hidden=true;this.field('drill-hint').hidden=true;
    this.field('drill-options').innerHTML='';this.message('');
  }
  changeAccent(){
    if(this.session&&!this.session.finished&&!this.confirm('End this unsaved practice and change the model accent?')){this.field('drill-accent').value=this.session.accent;return;}
    if(this.session)this.reset();this.updateAvailability();
  }
  async refresh(){
    if(this.session&&!this.session.finished&&!this.confirm('End this unsaved practice and reload the sound models?'))return;
    this.reset();const generation=this.generation;
    this.clips=[];this.updateAvailability();
    this.field('drill-availability').textContent='Checking local sound models…';
    const clips=await this.store.list();
    if(this.disposed||generation!==this.generation)return;
    this.clips=clips;this.updateAvailability();
  }
  start(){
    if(this.session&&!this.session.finished&&!this.confirm('End the current unsaved practice and start again?'))return;
    this.reset();this.session=new ListeningSession(this.clips,{accent:this.field('drill-accent').value});
    this.next();
  }
  next(){
    const round=this.session?.next();this.player.clear();
    if(!this.session)return;
    if(!round){this.finish();return;}
    this.field('drill-round').hidden=false;this.field('drill-hint').hidden=true;
    this.field('drill-title').textContent=`Sound ${this.session.history.length} of ${this.session.total} · listen, then point`;
    this.player.load(this.session.clip().blob);this.draw();
    this.message('Press the audio Play control. Choices unlock after the complete clip.');
  }
  draw(){
    if(this.disposed||!this.session?.round)return;
    this.field('drill-options').innerHTML=drillOptions(this.session.round,{heard:this.session.heard,resolved:this.session.record.correct});
    this.root.querySelector('[data-drill-next]').disabled=!this.session.record.correct&&!this.session.record.revealed;
  }
  answer(id){
    const result=this.session.answer(id);this.draw();
    this.message(result.correct?'That matches this supplied model. Say the sound with your teacher, then continue.':'Not this model. Listen again or show the model for support.');
    const focusTarget=result.correct?this.root.querySelector('[data-drill-next]'):this.root.querySelector(`[data-drill-answer="${id}"]`);
    focusTarget?.focus();
  }
  reveal(){
    const sound=this.session.reveal();this.field('drill-hint').hidden=false;
    this.field('drill-hint').innerHTML=`<h3>/${escapeHtml(sound.ipa)}/ · ${escapeHtml(sound.word)}</h3><p>${escapeHtml(sound.mnemonic)}</p><p>${escapeHtml(sound.mouth)}</p><p class="small">Model revealed: this is supported practice, not an independent first-try success.</p>`;
    this.draw();this.message('Model shown for support. Replay, practise or move to the next sound.');
  }
  async replay(){
    if(!this.session?.round)return;
    this.session.replay();this.draw();this.field('drill-audio').currentTime=0;
    try{await this.field('drill-audio').play();}catch{this.message('Playback could not start. Try the native audio Play control or check this model with a teacher.');}
  }
  finish(){
    if(this.reported)return;
    this.field('drill-round').hidden=true;const summary=this.session.summary();
    this.field('drill-summary').hidden=false;
    this.field('drill-summary').innerHTML=`<h3>Practice, not a verdict.</h3><p>${summary.rounds} rounds finished. Independently correct on the first try: ${summary.independentFirstCorrect}. Models revealed for support: ${summary.revealed}. Extra attempts: ${summary.extraAttempts}.</p><p>No accent, ability or mastery judgement is made. Revisit any sound with your teacher.</p>`;
    if(!this.reported){this.reported=true;let message='This practice is not saved yet.';try{message=this.onComplete(summary)?.message||message;}catch{message='Practice finished, but its history could not be saved.';}this.field('drill-summary').innerHTML+=`<p role="status">${escapeHtml(message)}</p>`;}
  }
  async handleClick(event){
    const button=event.target.closest('button');if(!button||this.disposed)return;
    if(button.hasAttribute('data-drill-start'))return this.start();
    if(button.hasAttribute('data-drill-refresh'))return this.refresh();
    if(button.hasAttribute('data-drill-replay'))return this.replay();
    if(button.hasAttribute('data-drill-reveal'))return this.reveal();
    if(button.hasAttribute('data-drill-next'))return this.next();
    if(button.hasAttribute('data-drill-answer'))return this.answer(button.dataset.drillAnswer);
  }
  pause(){this.field('drill-audio').pause();}
  destroy(){
    this.disposed=true;this.generation++;this.player.dispose();this.session=null;
    this.root.removeEventListener('click',this.clickListener);this.root.removeEventListener('change',this.changeListener);this.store.close().catch(()=>{});
  }
}
