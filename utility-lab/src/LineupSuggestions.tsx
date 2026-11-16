import {useRef,useState} from 'react';
import {MessageSquarePlus, X, Download, Check} from 'lucide-react';
import type {GameMap} from './maps';
import {safeSource,UTILITY_TYPES,type UtilityType} from './utility-data';
import {exportFile} from './file-transfer';
import './lineup-suggestions.css';
const KEY='utility-lab:suggestions:v1';
type Suggestion={id:string;mapId:string;side:'T'|'CT';type:UtilityType;target:string;from:string;notes:string;source:string;createdAt:string};
function readSuggestions():Suggestion[]{
 try {const values:unknown=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(values)?values.filter((item):item is Suggestion=>item&&typeof item==='object'&&['id','mapId','target','from','notes','source','createdAt'].every(key=>typeof item[key]==='string'&&item[key].length<=2000)&&['T','CT'].includes(item.side)&&UTILITY_TYPES.includes(item.type)).slice(-50):[];}catch{return [];}
}
export default function LineupSuggestions({map,side,onNotify}:{map:GameMap;side:'T'|'CT';onNotify:(message:string)=>void}){
 const dialog=useRef<HTMLDialogElement>(null),form=useRef<HTMLFormElement>(null);
 const [error,setError]=useState(''),[saved,setSaved]=useState(false),[count,setCount]=useState(0);
 async function download(){try{await exportFile(new Blob([JSON.stringify({format:'utility-lab-suggestions',version:1,suggestions:readSuggestions()},null,2)],{type:'application/json'}),'utility-lab-suggestions.json');}catch{setError('Couldn’t export suggestions. Try again.');}}
 return <>
  <button className="ul-suggest-trigger" aria-label="Suggest a lineup" title="Suggest a lineup" onClick={()=>{setError('');setSaved(false);setCount(readSuggestions().length);dialog.current?.showModal();}}><MessageSquarePlus size={17}/><span>Suggest a lineup</span></button>
  <dialog className="ul-suggestion-dialog" ref={dialog} aria-labelledby="suggest-lineup-title" onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}}>
   <header><h2 id="suggest-lineup-title">Suggest a lineup</h2><button type="button" aria-label="Close suggestion" onClick={()=>dialog.current?.close()}><X size={20}/></button></header>
   {saved?<div className="ul-suggestion-saved"><Check size={24}/><h3>Suggestion saved</h3><p>Kept on this device. Export it to share it.</p><button type="button" onClick={()=>{setSaved(false);setError('');}}>Suggest another</button></div>:<form ref={form} onSubmit={event=>{event.preventDefault();setError('');const data=new FormData(event.currentTarget);let source='';try{source=safeSource(String(data.get('source')||''));if(source&&!source.startsWith('https://'))throw Error('Use an https source link.');const queue=readSuggestions();if(queue.length>=50)throw Error('Your local suggestion list is full. Export it first.');const suggestion:Suggestion={id:crypto.randomUUID?.()||`suggestion-${Date.now()}-${Math.random().toString(36).slice(2)}`,mapId:map.id,side,type:String(data.get('type')) as UtilityType,target:String(data.get('target')||'').trim(),from:String(data.get('from')||'').trim(),notes:String(data.get('notes')||'').trim(),source,createdAt:new Date().toISOString()};if(!suggestion.target)throw Error('Enter the target callout.');localStorage.setItem(KEY,JSON.stringify([...queue,suggestion]));setCount(queue.length+1);setSaved(true);onNotify('Suggestion saved on this device.');}catch(reason){setError(reason instanceof Error?reason.message:'Couldn’t save this suggestion. Try again.');}}}>
    <p className="ul-suggestion-context">{map.name} · {side} side</p>
    <label>Utility<select name="type" defaultValue="Smoke">{UTILITY_TYPES.map(type=><option key={type} value={type}>{type==='Molotov'?'Molly':type}</option>)}</select></label>
    <label>Target callout<input name="target" placeholder="e.g. Window" maxLength={100} required autoComplete="off"/></label>
    <label>Throw from <span>(optional)</span><input name="from" placeholder="e.g. T spawn" maxLength={100} autoComplete="off"/></label>
    <label>Photo or video link <span>(optional)</span><input name="source" type="url" placeholder="https://" maxLength={2000} autoCapitalize="none" autoCorrect="off"/></label>
    <label>Details <span>(optional)</span><textarea name="notes" rows={2} maxLength={600} placeholder="What should this lineup cover?"/></label>
    {error&&<p role="alert">{error}</p>}
    <button className="ul-primary-button" type="submit">Save suggestion</button><p className="ul-suggestion-local">Saved locally on this device.</p>
   </form>}
   {saved&&error&&<p role="alert">{error}</p>}
   {count>0&&<footer><span>{count} local {count===1?'suggestion':'suggestions'}</span><button type="button" onClick={()=>void download()}><Download size={16}/>Export suggestions</button></footer>}
  </dialog>
 </>;
}
