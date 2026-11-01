import {sounds,soundById} from './course.js';
import {escapeHtml} from './views.js';
import {LocalClipStore,SoundClipPlayer,audioTypedFile,inspectClip,reviewedClip} from './clips.js';
import {PhonemeRecorder} from './recording.js';

export function clipLibraryMarkup(){
  return `<h2>Your local sound-model library</h2><p>Supply a teacher model for one isolated phoneme, not its letter name or a whole word. No recordings are supplied with this draft. Your review labels the clip; the app does not verify pronunciation.</p><p class="notice">Local to this browser and website address only. No upload to a server, cross-device sharing or backup. Clearing browser data may remove these models. Do not include learners’ voices, names or private information.</p><div class="clip-fields"><label for="clip-sound">Reference sound</label><select id="clip-sound">${sounds.map(sound=>`<option value="${sound.id}">/${escapeHtml(sound.ipa)}/ · ${escapeHtml(sound.word)}</option>`).join('')}</select><label for="clip-accent">Model accent</label><select id="clip-accent"><option value="en-AU">Australian English</option><option value="en-GB">UK English</option><option value="other">Other / not specified</option></select></div><label class="check-row"><input type="checkbox" id="clip-consent"> I have permission to use this audio. It will contain only my own or an authorised adult’s sound model, with no student personal information.</label><div class="clip-actions"><label class="file-label" for="clip-file">Choose existing audio (1 MB maximum)</label><input type="file" id="clip-file" accept="audio/webm,audio/ogg,audio/mp4,audio/x-m4a,audio/m4a,.m4a,audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/wave" disabled><button type="button" data-clip-record disabled>Record my sound</button><button type="button" data-clip-stop disabled>Stop recording / permission request</button><button type="button" data-clip-discard>Discard unsaved preview</button></div><p class="small">Recording asks for microphone permission only after you select Record. Maximum 10 seconds; aim for a short clean sound. Stop/cancel or leaving this view turns capture off. The browser must decode the result as 0.1–10 seconds before saving.</p><p id="clip-message" role="status" aria-live="polite">Select a sound and grant consent before choosing or recording audio.</p><audio id="clip-preview" hidden controls preload="metadata" aria-label="Sound-model preview"></audio><label class="check-row"><input type="checkbox" id="clip-reviewed"> I have listened to this entire preview and judge it an appropriate isolated sound for the selected tile and accent, without an added vowel or letter name.</label><button type="button" data-clip-save disabled>Save reviewed model on this browser</button><h3>Saved models <span id="clip-total"></span></h3><button type="button" data-clip-refresh>Refresh saved models</button><div id="clip-saved" class="saved-models"><p>Checking local storage…</p></div>`;
}
export function savedClipRows(clips){
  return clips.length?clips.map(clip=>{
    const sound=soundById(clip.id);
    if(!sound)return '';
    return `<article class="saved-model"><div><strong>/${escapeHtml(sound.ipa)}/ · ${escapeHtml(sound.word)}</strong><small>${escapeHtml(clip.accent)} · ${Number(clip.duration).toFixed(1)} seconds · teacher-reviewed locally, not independently verified</small></div><button type="button" data-clip-load="${sound.id}">Load saved model</button><button type="button" data-clip-delete="${sound.id}">Delete local model</button></article>`;
  }).join(''):'<p>No reviewed sound models saved here yet. Upload or record your own permitted model; missing models never become synthetic phonemes.</p>';
}

export class ClipLibrary{
  constructor(root,{store=new LocalClipStore(),inspect=inspectClip,Player=SoundClipPlayer,Recorder=PhonemeRecorder,confirm=message=>globalThis.confirm(message),stopNarration=()=>{}}={}){
    this.root=root;this.store=store;this.inspect=inspect;this.confirm=confirm;this.stopNarration=stopNarration;
    this.generation=0;this.disposed=false;this.busy=false;this.operation='';this.candidate=null;
    root.innerHTML=clipLibraryMarkup();
    this.field=id=>root.querySelector('#'+id);
    this.player=new Player(this.field('clip-preview'),{onStatus:message=>{this.message(message);this.update();},onPlay:()=>{this.stopNarration();this.field('clip-reviewed').checked=false;this.update();}});
    this.recorder=new Recorder({onStatus:message=>{this.message(message);this.update();}});
    this.clickListener=event=>{this.handleClick(event).catch(error=>{this.message(error.message);this.update();});};
    this.changeListener=event=>{this.handleChange(event).catch(error=>{this.message(error.message);this.update();});};
    root.addEventListener('click',this.clickListener);root.addEventListener('change',this.changeListener);
    this.update();this.refresh().catch(error=>this.message(error.message));
  }
  message(text){if(!this.disposed)this.field('clip-message').textContent=text;}
  update(){
    if(this.disposed)return;
    const consent=this.field('clip-consent').checked;
    this.field('clip-file').disabled=!consent||this.busy;
    this.root.querySelector('[data-clip-record]').disabled=!consent||this.busy||!this.recorder?.supported;
    this.root.querySelector('[data-clip-stop]').disabled=!this.recorder?.busy;
    this.root.querySelector('[data-clip-discard]').disabled=this.operation==='saving';
    this.root.querySelector('[data-clip-save]').disabled=this.busy||!consent||!this.candidate||!this.player?.playbackCompleted||!this.field('clip-reviewed').checked;
    this.field('clip-sound').disabled=this.busy;this.field('clip-accent').disabled=this.busy;
  }
  clear(message='Unsaved preview discarded. Saved models were not changed.'){
    this.generation++;this.candidate=null;this.busy=false;this.operation='';
    this.recorder.cancel();this.player.clear();this.field('clip-preview').hidden=true;this.field('clip-reviewed').checked=false;this.field('clip-file').value='';
    this.message(message);this.update();
  }
  async refresh(){
    const clips=await this.store.list();
    if(this.disposed)return;
    this.field('clip-saved').innerHTML=savedClipRows(clips);this.field('clip-total').textContent=`(${clips.length}/44)`;
  }
  async prepare(blob,source,generation){
    const metadata=await this.inspect(blob);
    if(this.disposed||generation!==this.generation)return;
    this.candidate={blob,duration:metadata.duration,source};
    this.field('clip-reviewed').checked=false;this.player.load(blob);this.field('clip-preview').hidden=false;
    this.message('Unsaved preview ready. Play it to the end, review the sound, then explicitly save.');
  }
  async upload(blob){
    if(!this.field('clip-consent').checked)throw Error('Confirm permission and privacy consent first.');
    if(this.busy)return;
    this.clear('Inspecting local audio…');const generation=this.generation;
    this.busy=true;this.operation='decoding';this.update();
    try{await this.prepare(audioTypedFile(blob),'upload',generation);}finally{if(!this.disposed&&generation===this.generation){this.busy=false;this.operation='';this.update();}}
  }
  async record(){
    if(!this.field('clip-consent').checked)throw Error('Confirm permission and privacy consent first.');
    if(this.busy)return;
    this.clear('Preparing voluntary recording…');const generation=this.generation;
    this.busy=true;this.operation='recording';this.stopNarration();this.update();
    try{
      const blob=await this.recorder.start({consent:true});
      if(blob&&!this.disposed&&generation===this.generation){this.operation='decoding';this.update();await this.prepare(blob,'recording',generation);}
    }finally{if(!this.disposed&&generation===this.generation){this.busy=false;this.operation='';this.update();}}
  }
  async save(){
    if(this.busy)return;
    const input={...this.candidate,soundId:this.field('clip-sound').value,accent:this.field('clip-accent').value,consent:this.field('clip-consent').checked,reviewed:this.field('clip-reviewed').checked,playbackCompleted:this.player.playbackCompleted};
    reviewedClip(input);
    const generation=this.generation;this.busy=true;this.operation='saving';this.update();
    try{
      const existing=await this.store.get(input.soundId);
      if(this.disposed||generation!==this.generation)return;
      if(existing&&!this.confirm('Replace the saved local model for '+soundById(input.soundId).word+'? The previous local clip will be overwritten.'))return;
      if(this.disposed||generation!==this.generation)return;
      await this.store.save(input);
      if(this.disposed||generation!==this.generation)return;
      this.candidate=null;this.field('clip-reviewed').checked=false;
      try{await this.refresh();this.message('Reviewed model saved on this browser only. It has not been independently verified or uploaded.');}
      catch{this.message('Model saved, but the list could not refresh. Try Refresh saved models.');}
    }finally{if(!this.disposed&&generation===this.generation){this.busy=false;this.operation='';this.update();}}
  }
  async loadSaved(id){
    if(this.busy)return;
    this.clear('Loading a saved model for local playback…');const generation=this.generation;
    const clip=await this.store.get(id);
    if(this.disposed||generation!==this.generation)return;
    if(!clip)throw Error('That model is no longer available. Refresh the saved list.');
    this.field('clip-sound').value=id;this.field('clip-accent').value=clip.accent;
    this.player.load(clip.blob);this.field('clip-preview').hidden=false;this.message('Saved teacher-labelled model loaded. Use Play to listen; this is not an unsaved replacement.');this.update();
  }
  async remove(id){
    if(this.busy)return;
    const sound=soundById(id);if(!sound)return;
    if(!this.confirm('Permanently delete the saved sound model for '+sound.word+' from this browser? No other sounds or classroom demo data will be removed.'))return;
    const generation=this.generation;await this.store.remove(id);
    if(this.disposed||generation!==this.generation)return;
    this.clear('Local sound model deleted. Other models and classroom data are unchanged.');await this.refresh();
  }
  async handleClick(event){
    const button=event.target.closest('button');if(!button||this.disposed)return;
    if(button.hasAttribute('data-clip-record'))return this.record();
    if(button.hasAttribute('data-clip-stop')){this.recorder.stop();return;}
    if(button.hasAttribute('data-clip-discard'))return this.clear();
    if(button.hasAttribute('data-clip-save'))return this.save();
    if(button.hasAttribute('data-clip-load'))return this.loadSaved(button.dataset.clipLoad);
    if(button.hasAttribute('data-clip-delete'))return this.remove(button.dataset.clipDelete);
    if(button.hasAttribute('data-clip-refresh'))return this.refresh();
  }
  async handleChange(event){
    if(this.disposed)return;
    if(event.target.id==='clip-file'&&event.target.files?.[0])return this.upload(event.target.files[0]);
    if(event.target.id==='clip-sound'||event.target.id==='clip-accent')return this.clear('Target changed. Prepare a new preview and review it for this sound and accent.');
    if(event.target.id==='clip-consent'&&!event.target.checked)return this.clear('Consent withdrawn. Capture and unsaved audio have been cleared; saved models were not deleted.');
    this.update();
  }
  pause(){this.field('clip-preview').pause();}
  destroy(){
    this.disposed=true;this.generation++;this.recorder.cancel();this.player.dispose();this.candidate=null;
    this.root.removeEventListener('click',this.clickListener);this.root.removeEventListener('change',this.changeListener);
    this.store.close().catch(()=>{});
  }
}
