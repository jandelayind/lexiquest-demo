export const sourceLinks = {
  programme: 'https://www.gov.uk/government/publications/letters-and-sounds',
  pdf: 'https://assets.publishing.service.gov.uk/media/5a7aa7b6e5274a34770e630c/Letters_and_Sounds_-_DFES-00281-2007.pdf',
  validation: 'https://www.gov.uk/government/publications/phonics-teaching-materials-core-criteria-and-self-assessment'
};

const soundRows = [
  ['p','p','p pp','pin','📍','Pin pops: press, then release.','Close both lips; release a brief puff. No extra uh.','stop'],
  ['b','b','b bb','bag','🎒','Bag bounce: lips meet, voice wakes.','Close both lips and release with voice.','stop'],
  ['t','t','t tt','tap','🚰','Tap tip: touch, then let go.','Touch the ridge behind the upper teeth; release briefly.','stop'],
  ['d','d','d dd','desk','🪑','Desk knock: a voiced tongue tap.','Touch the ridge behind the upper teeth; release with voice.','stop'],
  ['k','k','c k ck ch','key','🔑','Key click: the back unlocks.','Raise the back of the tongue, then release.','stop'],
  ['g','ɡ','g gg','gate','🚪','Gate opens with a voice.','Raise the back of the tongue; release with voice.','stop'],
  ['f','f','f ff ph','fan','🪭','Fan air: teeth meet lip.','Upper teeth touch the lower lip; let air flow.','air'],
  ['v','v','v ve','van','🚐','Van vibrates: feel the voice.','Use the fan position, with gentle voicing.','air'],
  ['th-air','θ','th','moth','🦋','Moth breath: tongue peeks, air flows.','Let the tongue tip touch between the teeth; blow gently.','air'],
  ['th-voice','ð','th','feather','🪶','Feather hum: tongue peeks, voice flows.','Use the moth position and add voice.','air'],
  ['s','s','s ss c ce','sun','☀️','Sun stream: a thin line of air.','Bring the tongue near the tooth ridge; let air hiss.','air'],
  ['z','z','z zz s se','zip','🤐','Zip buzz: switch your voice on.','Use the sun position with voice.','air'],
  ['sh','ʃ','sh ch ti ci','shell','🐚','Shell hush: send soft air.','Round the lips slightly; direct air over the tongue.','air'],
  ['zh','ʒ','s si ge','treasure','💎','Treasure shimmer: hush with a voice.','Use the shell position with voice, as in the middle of treasure.','air'],
  ['h','h','h','hat','🧢','Hat breath: warm your hand.','Let breath pass through an open mouth, without adding a vowel.','air'],
  ['ch','tʃ','ch tch','chip','🍟','Chip burst: stop, then rush.','Start with a tongue stop and release into a short sh-like sound.','joined'],
  ['j','dʒ','j g ge dge','jam','🫙','Jam jump: a voiced burst.','Use the chip position with voice.','joined'],
  ['m','m','m mm mb','map','🗺️','Map hum: lips together.','Close the lips and let voice pass through the nose.','hum'],
  ['n','n','n nn kn gn','net','🥅','Net hum: tongue up.','Touch the tooth ridge with the tongue; voice passes through the nose.','hum'],
  ['ng','ŋ','ng n','ring','💍','Ring hum: the back sings.','Raise the back of the tongue; let voice pass through the nose. Do not add g in ring.','hum'],
  ['l','l','l ll le','leaf','🍃','Leaf lift: lift the tongue tip.','Lift the tongue to the tooth ridge; air moves around its sides.','glide'],
  ['r','r','r rr wr','rope','🪢','Rope curve: curl, do not tap.','Bring the tongue back slightly without tapping the roof. English r varies by accent.','glide'],
  ['w','w','w wh','wave','🌊','Wave round: round, then open.','Round the lips, then glide into the following vowel.','glide'],
  ['y','j','y','yarn','🧶','Yarn glide: tongue high, then away.','Raise the front of the tongue, then glide into the vowel.','glide'],
  ['i','ɪ','i y','fish','🐟','Fish flick: a short, relaxed vowel.','Keep the tongue high-front but relaxed; lips are unrounded.','short'],
  ['e','e','e ea','tent','⛺','Tent opens: a small opening.','Open the mouth a little more than for fish. UK IPA also uses ɛ.','short'],
  ['a','æ','a','apple','🍎','Apple gap: open and forward.','Open the mouth; keep the tongue toward the front.','short'],
  ['o','ɒ','o a','sock','🧦','Sock round: short and open.','Open the jaw and round the lips in the UK reference accent.','short'],
  ['u','ʌ','u o ou','drum','🥁','Drum drop: relax the jaw.','Use an open central vowel. This contrast varies in northern UK accents.','short'],
  ['oo-short','ʊ','oo u ou','book','📚','Book nook: round but relaxed.','Round the lips lightly; keep this distinct from moon.','short'],
  ['ee','iː','ee ea e-e ie y','seed','🌱','Seed smile: a steady front vowel.','Keep the tongue high and forward; do not force a smile.','steady'],
  ['ar','ɑː','ar a al','palm','🌴','Palm calm: open and back.','Open the jaw with the tongue back. Do not pronounce a final r in a non-rhotic model.','steady'],
  ['or','ɔː','or aw au a','fork','🍴','Fork arc: round and steady.','Round the lips with an open back vowel.','steady'],
  ['oo-long','uː','oo ue ew u-e','moon','🌙','Moon tube: lips softly round.','Use a steady high vowel; UK and Australian tongue positions differ.','steady'],
  ['ur','ɜː','ur er ir ear','fern','🌿','Fern centre: a steady middle vowel.','Use a central vowel; non-rhotic models have no spoken r here.','steady'],
  ['schwa','ə','a e i o u er','balloon','🎈','Balloon relax: the unstressed first beat.','Relax the mouth in an unstressed syllable, as at the start of balloon.','weak'],
  ['ai','eɪ','ai ay a-e','train','🚆','Train trail: a vowel that travels.','Glide from a mid-front vowel toward fish.','moving'],
  ['igh','aɪ','igh ie i-e y','kite','🪁','Kite climb: open, then high.','Glide from an open vowel toward fish.','moving'],
  ['oa','əʊ','oa ow o-e oe','boat','⛵','Boat float: centre to round.','Glide toward rounded lips. Australian English often uses əʉ.','moving'],
  ['ow','aʊ','ow ou','cloud','☁️','Cloud curve: open, then round.','Start open and glide toward a rounded vowel.','moving'],
  ['oi','ɔɪ','oi oy','coin','🪙','Coin turn: round to front.','Start rounded and glide toward fish.','moving'],
  ['ear','ɪə','ear eer ere','ear','👂','Ear near: front, then centre.','Traditional UK reference glide; many speakers use a steadier vowel.','moving'],
  ['air','eə','air are ear','chair','🪑','Chair square: open-front to centre.','Traditional UK reference glide; many UK/Australian speakers use a long vowel instead.','moving'],
  ['ure','ʊə','ure our','tour','🧭','Tour detour: listen to your local model.','Traditional UK reference sound. Tour and poor often merge with fork; accept the learner’s local variety.','moving']
];

export const sounds = soundRows.map(([id, ipa, spellings, word, graphic, mnemonic, mouth, group], index) => ({id, ipa, spellings:spellings.split(' '), word, graphic, mnemonic, mouth, group, category:index<24?'consonant':'vowel'}));
export const soundById = id => sounds.find(sound => sound.id === id);
export const phases = [
  {id:1,title:'Tune in',subtitle:'Listen, notice, remember',scope:'Seven listening strands: environmental sounds, instruments, body percussion, rhythm and rhyme, alliteration, voice play, oral blending and segmenting.'},
  {id:2,title:'First sound steps',subtitle:'Connect sounds to print',scope:'The five initial letter sets, short-vowel words, oral and written blending, segmenting, captions and early exception words.'},
  {id:3,title:'Sound teams',subtitle:'Two letters, one sound—and more',scope:'Remaining letters, consonant digraphs, vowel digraphs/trigraphs, letter names, two-syllable words and exception words.'},
  {id:4,title:'Keep every sound',subtitle:'Consonants beside consonants',scope:'No new grapheme set. Consolidate adjacent consonants, longer words, captions, fluent reading and spelling.'},
  {id:5,title:'Spelling choices',subtitle:'One sound, many spellings',scope:'New graphemes, split digraphs, alternative pronunciations and spellings, longer words and high-frequency word knowledge.'},
  {id:6,title:'Sound to fluent speech',subtitle:'Apply, spell, read, revise',scope:'Fluency, past tense, suffixes, longer words, spelling strategies, proofreading and independent application.'}
];

const lessons = [];
function add(phase, title, focus, words, instruction, sentence, task, answer, choices, extra={}) {
  const id=`p${phase}-${String(lessons.filter(lesson=>lesson.phase===phase).length+1).padStart(2,'0')}`;
  lessons.push({id,phase,title,focus,words,instruction,sentence,task,answer,choices,minutes:8,...extra});
}

const listening = [
  ['Sound detective','Notice a sound near you. Close your eyes if comfortable. Listen for ten seconds. Describe the sound without naming its source. Ask a partner what they noticed.','Which description tells us how a sound feels?','A soft, steady hum',['A soft, steady hum','My blue notebook','Yesterday']],
  ['Instrument echoes','Tap a cup softly, then tap a table softly. Listen to the difference in tone. Have a partner make one sound out of sight. Name the object after listening. Never use a loud sound near an ear.','What changes when two objects make different sounds?','Their tone',['Their tone','The spelling of a word','The number of letters']],
  ['Body beat studio','Make a quiet clap, tap, clap pattern. Leave space between each action. Ask a partner to echo the same order. Swap roles and invent a new pattern.','What should an echo pattern keep?','The same order',['The same order','A faster speed every time','Different actions only']],
  ['Rhythm and rhyme','Say light, night, train. Listen to the ends. Light and night rhyme. Tap the beats in music: mu, sic. Rhyme and syllable beats are different things.','Which word rhymes with light?','night',['night','train','leaf']],
  ['First-sound finder','Listen to map, moon, net. Map and moon begin with the same speech sound. Keep your lips together and feel the hum. Say another word that starts in the same way.','Which pair begins with the same sound?','map and moon',['map and moon','map and net','moon and fish']],
  ['Voice laboratory','Say a short sentence quietly, then with a questioning voice. Notice how your voice rises or falls. Touch your own throat gently while humming, then breathe out quietly. Notice vibration.','When you hum, what might you feel?','A gentle vibration',['A gentle vibration','A spelling change','An extra written letter']],
  ['Sound threads','Ask a teacher to say the separate sounds in map without letter names or extra vowels. Join the sounds to say the word. Then say map and count its three sounds on your fingers. Browser word speech is not a substitute for this clean teacher model.','How many speech sounds are in map?','3',['2','3','4']]
];
for(const [title,instruction,task,answer,choices] of listening)add(1,title,[],['map','moon','net'],instruction,'Listen first. Notice the pattern. Share what you heard.',task,answer,choices,{kind:'listening'});

const phaseTwo = [
  ['s','s','sat sit sun'],['a','a','sat at ant'],['t','t','sat tap tin'],['p','p','pat pin tap'],
  ['i','i','sit pin tip'],['n','n','nip tin pan'],['m','m','map mat man'],['d','d','dip dad dim'],
  ['g','g','gap dig tag'],['o','o','pot dog nod'],['c','k','cat cot cap'],['k','k','kit kid Ken'],['ck','k','sock sack neck'],
  ['e','e','net pen pet'],['u','u','sun cup mug'],['r','r','rat rip rug'],['h','h','hat hip hen'],['b','b','bag bat bed'],
  ['f','f','fan fit fog'],['ff','f','puff huff off'],['l','l','lip leg log'],['ll','l','bell hill doll'],['ss','s','miss hiss fuss']
];
export function phaseTwoDecoding(word, knownGraphemes) {
  const remaining = String(word).toLocaleLowerCase('en');
  const choices = [...new Set(knownGraphemes)].sort((first,second)=>second.length-first.length);
  const segments = [];
  let position = 0;
  while(position<remaining.length){
    const grapheme = choices.find(choice=>remaining.startsWith(choice,position));
    if(!grapheme)return null;
    segments.push(grapheme);
    position+=grapheme.length;
  }
  return segments.length?segments:null;
}
const knownPhaseTwoGraphemes = [];
for(const [grapheme,sound,bank] of phaseTwo){
  knownPhaseTwoGraphemes.push(grapheme);
  const listeningWords=bank.split(' ');
  const decoding=listeningWords.map(word=>({word,segments:phaseTwoDecoding(word,knownPhaseTwoGraphemes)})).filter(item=>item.segments);
  const decodeWords=decoding.map(item=>item.word);
  const instruction=`Listen to the whole words ${listeningWords.join(', ')} as teacher-supported vocabulary, not a reading test. Ask a teacher to model the sound represented by ${grapheme}; this is different from the letter name. ${decodeWords.length?`Blend only today's cumulative decoding words: ${decodeWords.join(', ')}.`:'This is sound discovery: no whole-word blending is expected yet.'} Picture anchors and other listening words may contain spellings not taught yet. Do not ask learners to guess those words from the picture.`;
  add(2,`Meet ${grapheme}`,[sound],listeningWords,instruction,`${listeningWords.join('. ')}.`,`Which spelling are we practising?`,grapheme,[grapheme,...['s','m','t','p','n','a'].filter(item=>item!==grapheme).slice(0,2)],{graphemes:[grapheme],kind:'gpc',listeningWords,decodeWords,decoding,knownGraphemes:[...knownPhaseTwoGraphemes],decodableText:decodeWords.join('. ')});
}
add(2,'Blend, then segment',['m','a','p'],['map','sat','pin'],'Look at m, a, p. Ask a teacher for three clean sounds. Join them smoothly into map. Say map again, move one counter for each sound, and write a spelling for each sound.','A map. A pin. A mat.','How many sounds are in map?','3',['2','3','4'],{segments:[['m','a','p'],['s','a','t'],['p','i','n']]});
add(2,'Words with a surprise',[],['the','to','I','no','go','into'],'Say each whole word. Notice the part you can decode and the unexpected part. Cover the word, say it, write it, then compare. Do not memorise the outline or use a picture to guess it.','I go into the hut.','Which word has an unexpected vowel spelling at this stage?','to',['to','sat','pin'],{kind:'exception'});
add(2,'Caption studio',[],['a','cat','on','a','mat'],'Read each small word, then read the caption smoothly. Ask a partner to read it back. Write it from dictation and check the spaces.','A cat on a mat.','What is the cat on?','a mat',['a mat','a bus','a desk'],{kind:'apply'});

const phaseThree = [
  ['j','j','jam jet jog'],['v','v','van vet vivid'],['w','w','web win wet'],['x','k s','box six fox'],
  ['y','y','yes yet yell'],['z','z','zip zigzag zest'],['zz','z','buzz fizz jazz'],['qu','k w','quit quiz quick'],
  ['ch','ch','chip chin chat'],['sh','sh','ship shop shut'],['th','th-air th-voice','thin moth this'],['ng','ng','ring sing long'],
  ['ai','ai','rain sail tail'],['ee','ee','seed meet feet'],['igh','igh','night light high'],['oa','oa','boat road coat'],
  ['oo (long)','oo-long','moon food zoom'],['oo (short)','oo-short','book look foot'],['ar','ar','car park sharp'],['or','or','fork short sort'],
  ['ur','ur','turn hurt surf'],['ow','ow','cow now town'],['oi','oi','coin join soil'],['ear','ear','ear near hear'],['air','air','chair fair pair'],['ure','ure','tour pure cure'],['er','schwa ur','farmer her letter']
];
for(const [grapheme,focus,bank] of phaseThree){const words=bank.split(' ');const special=grapheme==='x'?'The letter x in these words usually represents two sounds: k and s.':grapheme==='qu'?'The pair qu in these words usually represents two sounds: k and w.':grapheme==='th'?'The spelling th represents two different sounds: the breath sound in thin and the voiced sound in this.':grapheme==='ure'?'Pronunciations vary: tour and poor may use the fork vowel; pure and cure may also begin with a y glide. Follow a consistent local teacher model.':grapheme==='er'?'An unstressed er often represents schwa; a stressed er in her uses the fern vowel in a non-rhotic model.':'A digraph has two letters; a trigraph has three. A sound team can represent one phoneme.';add(3,`Explore ${grapheme}`,focus.split(' '),words,`Listen to ${words.join(', ')}. ${special} Point to the matching sound tile. Ask for a clean model before trying to segment or blend.`,`${words.join('. ')}.`, 'Which item is in today’s word bank?',words[0],[words[0],'desk','map'].filter((item,index,array)=>array.indexOf(item)===index),{graphemes:[grapheme.replace(/ \(.+\)/,'')],kind:'gpc'});}
add(3,'Names and sounds',[],['A','a','B','b'],'Letters have names; words have speech sounds. Say the alphabet names with a partner, then point to a lower-case letter and give a sound it can represent. Do not confuse the name of a letter with its sound.','The letter name helps us talk about spelling.','What does a phoneme mean?','A speech sound',['A speech sound','A capital letter','A syllable every time'],{kind:'apply'});
add(3,'Two beats, all the sounds',[],['sunset','rooftop','farmyard'],'Say the word, find its syllable beats, and blend the phonemes within each part. Join the parts without losing a sound. Talk about its meaning before using it in a sentence.','At sunset, we meet at the rooftop.','Which word can be split into sun and set?','sunset',['sunset','moon','rain'],{kind:'apply'});
add(3,'Useful exception words',[],['he','she','we','me','be','was','you','they','all','are','my','her'],'Listen to each word in a short phrase. Explain its meaning. Mark the unexpected spelling for the accent you use. Say, cover, write and check; return to the word tomorrow.','You and I are here. They are with me.','Which word names a group of other people?','they',['they','was','my'],{kind:'exception'});

const clusters = [
  ['End sounds matter','tent hand milk','Say tent slowly. Keep both final consonants. Move one counter for each phoneme; do not add an extra vowel between n and t.','Which word ends with two adjacent consonant sounds?','tent',['tent','tea','go']],
  ['Start sounds matter','stop frog clap','Say stop, frog and clap. Keep both starting consonants; slide into the vowel without adding a syllable. A consonant cluster is not a new single phoneme.','How many sounds are at the start of stop before the vowel?','2',['1','2','3']],
  ['Both ends','stamp crisp plant','Listen, repeat, segment and spell. Keep every sound at both ends. Read the word once accurately, then once naturally.','Which word begins with the same two sounds as stamp?','step',['step','tap','map']],
  ['Three at the start','street spring scrap','Listen to a teacher model each starting cluster. Use fingers to track all three consonants. Add the rest of the word smoothly.','How many consonant sounds start spring before its vowel?','3',['1','2','3']],
  ['Longer word workshop','sandpit lunchbox windmill','Split into meaningful or syllable parts. Listen for the join between them. Blend the parts, then check the whole meaning.','Which word joins lunch and box?','lunchbox',['lunchbox','sandpit','windmill']],
  ['Sentence relay','frog pond tent','Read the sentence to a partner. Your partner repeats it, then writes it. Compare one sound or spelling at a time.','Where did the frog jump?','into the pond',['into the pond','onto a bus','over a desk']]
];
for(const [title,bank,instruction,task,answer,choices] of clusters)add(4,title,[],bank.split(' '),instruction,'The frog jumps into the pond.',task,answer,choices,{kind:'cluster'});
add(4,'Everyday word repair',[],['said','have','like','some','come','were','there','little','one','do','when','out','what'],'Practise each word in a spoken sentence. Explain the meaning, notice the unexpected spelling, then write it from memory. Check the exact spelling rather than guessing from the first letter.','Come and have some lunch.','Which word can complete: Come and ___ some lunch?','have',['have','one','there'],{kind:'exception'});

const phaseFive = [
  ['ay','ai','day play stay'],['ou','ow','out cloud shout'],['ie','igh','pie tie lie'],['ea','ee','sea team dream'],['oy','oi','boy toy enjoy'],['ir','ur','bird shirt girl'],
  ['ue','oo-long y','blue glue cue'],['aw','or','saw claw dawn'],['wh','w','when which wheel'],['ph','f','photo phone graph'],['ew','oo-long y','grew new few'],['oe','oa','toe goes hoe'],['au','or','haul launch autumn'],['ey','ee','key donkey valley'],
  ['a-e','ai','make shape brave'],['e-e','ee','these theme complete'],['i-e','igh','kite time smile'],['o-e','oa','home hope stone'],['u-e','oo-long y','rule cube tune']
];
for(const [grapheme,focus,bank] of phaseFive){const words=bank.split(' ');add(5,`Another spelling: ${grapheme}`,focus.split(' '),words,`Listen to ${words.join(', ')}. Compare this spelling with the sound atlas. ${grapheme.includes('-')?'The dash marks a consonant between the two vowel letters, not a spoken pause.':''} ${['ue','ew','u-e'].includes(grapheme)?'Some words include a y glide before the moon vowel; the glide can vary by accent.':''} Write each word, underline the focus spelling, then say a sentence that makes its meaning clear.`,`${words.join('. ')}.`, 'Which word uses the spelling we are studying?',words[0],[words[0],'map','net'],{graphemes:[grapheme],kind:'gpc'});}

const alternatives = [
  ['i','fish find','The vowel spelling i can represent the short fish vowel or the kite vowel. Try a pronunciation, then check the spoken word and meaning.','Which word has the kite vowel?','find',['find','fish','sit']],
  ['o','hot cold','The spelling o can represent different vowels. Say both words and compare the vowel movement.','Which word has the boat vowel?','cold',['cold','hot','sock']],
  ['c','cat city','Before e, i or y, c often represents the sun sound. It is not an exception-free rule.','Which word starts with the sun sound?','city',['city','cat','cup']],
  ['g','go giant','Compare the hard sound in go and the jam sound in giant. Word-specific knowledge matters.','Which word starts with the jam sound?','giant',['giant','go','gate']],
  ['u','cup put','Compare the vowel in cup and put. Many northern UK speakers do not use the same contrast as a southern UK model.','In the reference model, which word uses the book vowel?','put',['put','cup','sun']],
  ['ow','cow snow','The same spelling can represent the cloud glide or the boat glide. Listen to the whole word.','Which word has the boat vowel?','snow',['snow','cow','now']],
  ['ie','tie field','Compare the kite vowel in tie and the seed vowel in field.','Which word has the seed vowel?','field',['field','tie','pie']],
  ['ea','team bread','Compare the seed vowel and the tent vowel represented by ea.','Which word has the tent vowel?','bread',['bread','team','sea']],
  ['er','her farmer','Stress changes the model: her is stressed; the last syllable of farmer is often a weak schwa.','Which word has an unstressed final syllable?','farmer',['farmer','her','fern']],
  ['a','hat what','The vowel changes in these words. Listen to the word in your selected accent and compare with your teacher.','Which word is a question word?','what',['what','hat','cat']],
  ['y','yes my happy','The spelling y can be a consonant glide, the kite vowel or a final seed-like vowel.','Which word starts with a consonant y glide?','yes',['yes','my','happy']],
  ['ch','chip school chef','Compare three common pronunciations of ch. The word and its history help determine the sound.','Which word starts with the shell sound?','chef',['chef','chip','school']],
  ['ou','out shoulder could you','One spelling has several possible pronunciations. Learn each spoken word with its meaning.','Which word uses the book vowel in the reference model?','could',['could','out','shoulder']]
];
for(const [grapheme,bank,instruction,task,answer,choices] of alternatives)add(5,`One spelling, different sounds: ${grapheme}`,[],bank.split(' '),instruction,`${bank.split(' ').join('. ')}.`,task,answer,choices,{kind:'alternative'});
const spellingGroups = [
  ['f','fan puff phone'],['l','leaf bell table'],['m','map summer comb'],['n','net dinner knee'],['ng','ring sink'],['r','rope carry write'],['s','sun miss city'],['z','zip fizz rose'],['sh','shell chef station'],['j','jam giant bridge'],['k','cat key sock school'],['ch','chip match'],
  ['ee','seed team these happy'],['ai','rain day make'],['igh','night tie kite my'],['oa','boat snow home toe'],['oo-long','moon blue grew rule'],['oo-short','book put could'],['or','fork saw haul'],['ur','turn fern shirt'],['ow','cow out'],['oi','coin toy'],['ear','ear deer here'],['air','chair care bear'],['ar','park palm'],['zh','treasure vision']
];
for(const [sound,bank] of spellingGroups){const words=bank.split(' ');add(5,`Spelling family: /${soundById(sound).ipa}/`,[sound],words,`Listen to ${words.join(', ')}. Find the shared target sound. Sort the words by the letters representing that sound. Explain the word meanings, cover each word and write it from memory. ${sound==='ng'?'In sink, the n sound is followed by a separate k sound.':''}`,`${words.join('. ')}.`, 'Which word belongs to this spelling-family practice?',words[0],[words[0],...['map','zip','coin','book'].filter(item=>!words.includes(item)).slice(0,2)],{kind:'spelling'});}
add(5,'Useful words in real speech',[],['oh','their','people','Mr','Mrs','looked','called','asked','water','where','who','again','thought','through','work','mouse','many','laughed','because','different','any','eyes','friends','once','please'],'Listen to these useful words, expand abbreviated titles when speaking them, and use them in meaningful sentences. Mark unexpected spellings and practise spaced recall. Words become easier through repeated accurate encounters, not guessing.','Please ask their friends where people work.','Which word refers to people you know and like?','friends',['friends','through','once'],{kind:'exception'});

const phaseSix = [
  ['Past tense, three endings','helped played wanted','Listen to the final sound in helped, played and wanted. The spelling ed can be pronounced t, d, or a new syllable id. Use voice and the preceding sound to notice the pattern.','Which word adds a syllable for ed?','wanted',['wanted','helped','played']],
  ['Present to past','walk walked jump jumped','Tell a partner what you do today and what you did yesterday. Listen to the endings, then write the past-tense forms and read them back.','What is the regular past tense of jump?','jumped',['jumped','jumping','jumps']],
  ['Past tense surprises','go went come came see saw','Say an irregular verb pair. Use both forms in meaningful sentences. The past does not always use ed. Revisit the spelling and meaning over several days.','Which word is the past tense of go?','went',['went','going','goes']],
  ['Plural sounds','cats dogs buses','Listen for s, z and iz at the ends. The letters s and es do not always have one pronunciation. Say each word naturally before spelling it.','Which word adds a syllable for its plural ending?','buses',['buses','cats','dogs']],
  ['Suffix meaning','help helpful helpless','A suffix adds to a word and may change its meaning or job. Explain the difference between helpful and helpless before writing them in sentences.','Which word means without help?','helpless',['helpless','helpful','helping']],
  ['Double the last consonant','hop hopping hopped','In short stressed words like hop, we often double a final consonant before a vowel suffix. Compare hop and hope carefully. Longer words need attention to stress.','Which spelling is correct?','hopping',['hopping','hopingg','hoppping']],
  ['Drop the final e','hope hoping hoped','Before a vowel suffix, a final silent e is often dropped. Compare hoping and hopping. Do not apply this mechanically to every word.','Which spelling means continuing to hope?','hoping',['hoping','hopping','hopeing']],
  ['Change y to i','happy happier happiest','When a consonant comes before final y, many suffixes change y to i. Compare happy with happier. Before ing, y is usually kept, as in carrying.','Which comparative form is correct?','happier',['happier','happyer','happyyer']],
  ['Keep the y after a vowel','play playing played','When a vowel comes before final y, keep the y in these common examples. Say the base word, add the ending, and check the spelling.','Which past-tense spelling is correct?','played',['played','plaied','playd']],
  ['Listen for syllable stress','photograph photographer','Say the words naturally. Tap syllables and notice the strongest beat. Vowels in weak syllables may reduce to schwa. Do not treat every written vowel as a full strong vowel.','What is word stress?','A stronger syllable',['A stronger syllable','A capital letter','An extra consonant']],
  ['Long-word routes','remember remembering unforgettable','Break a longer word into meaningful parts and syllables. Say each part, write it, rebuild the word and check against a reliable model.','Which strategy helps spell a longer word?','Break it into parts',['Break it into parts','Guess its outline','Ignore the ending']],
  ['Prefix explorer','unfair replay dislike','Add a meaningful beginning to a base word. Discuss what changes: unfair is not fair; replay means play again. Say the new word in a sentence.','What does replay mean?','Play again',['Play again','Never play','Play quietly']],
  ['Homophone detective','sea see right write','Listen to words that sound the same but have different spellings and meanings. Use the sentence, not sound alone, to choose a spelling.','Choose the word: I can ___ the moon.','see',['see','sea','seed']],
  ['Soft c and g','city race giant gentle','Explore common spelling patterns, then look for exceptions such as get and give. A helpful pattern is not a rule with no exceptions.','Which word begins with the jam sound?','gentle',['gentle','get','give']],
  ['Word-ending choices','match badge table','Notice common endings such as tch, dge and consonant-le. Segment the spoken word, then investigate the conventional spelling. Not every letter adds a new sound.','Which word ends with consonant-le?','table',['table','match','badge']],
  ['A spelling log that works','because different favourite','Choose a useful word, explain its meaning, identify its difficult part and write a memory cue. Revisit it tomorrow and later in the week. Personal entries stay on this device only.','What should a useful spelling log include?','The difficult part and a memory cue',['The difficult part and a memory cue','Only a score','Only the first letter']],
  ['Dictation with meaning','We played in the park.','Listen to the whole sentence before writing. Say it quietly to yourself, write it, then check sounds, spellings, spaces and punctuation.','Which word is in the past tense?','played',['played','park','in']],
  ['Read for expression','Could you help me? I found it!','Read once accurately, then again for expression. Let your voice reflect the meaning and punctuation. Ask a partner whether your message was clear, not whether your accent matches theirs.','Which sentence asks for help?','Could you help me?',['Could you help me?','I found it!','The moon is bright.']],
  ['Proofread in layers','I went to the park.','First check the meaning. Then check each sentence and punctuation. Finally inspect uncertain spellings. Use a dictionary or trusted word bank to confirm, not guess.','What can you use to confirm a spelling?','A trusted dictionary',['A trusted dictionary','The shape of a word only','A random guess']],
  ['Independent sound mission','Listen. Speak. Read. Reflect.','Choose an unfamiliar but useful word from a real topic. Listen to a reliable model, explain its meaning, map its sounds and spellings, speak a sentence and revisit it later. Ask your teacher which parts you can now do independently.','What is the goal of phonics practice?','Use sounds and spellings to read and communicate',['Use sounds and spellings to read and communicate','Match every accent exactly','Guess from pictures']]
];
for(const [title,bank,instruction,task,answer,choices] of phaseSix)add(6,title,[],bank.includes('.')?[bank]:bank.split(' '),instruction,bank.includes('.')?bank:`${bank.split(' ').join('. ')}.`,task,answer,choices,{kind:'application'});

export const course = lessons;
export const progression = {phase2:phaseTwo.map(row=>row[0]),phase3:phaseThree.map(row=>row[0]),phase5:phaseFive.map(row=>row[0])};
export const mnemonic = 'Hear it. Feel it. Find it. Say it.';
export function lessonById(id){return course.find(lesson=>lesson.id===id);}
export function normaliseAnswer(value){return String(value??'').normalize('NFKC').trim().toLocaleLowerCase('en').replace(/\s+/g,' ');}
export function checkAnswer(lesson,value){return normaliseAnswer(value)===normaliseAnswer(lesson.answer);}
export function shuffle(items,random=Math.random){const result=[...items];for(let index=result.length-1;index>0;index--){const other=Math.floor(random()*(index+1));[result[index],result[other]]=[result[other],result[index]];}return result;}
export function makeRound(pool,random=Math.random){if(pool.length<2)throw Error('Choose at least two sounds.');const target=pool[Math.floor(random()*pool.length)];return {target,options:shuffle([target,...shuffle(pool.filter(sound=>sound.id!==target.id),random).slice(0,5)],random)};}
