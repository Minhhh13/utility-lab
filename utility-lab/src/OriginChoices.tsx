import {useEffect,useId,useLayoutEffect,useMemo,useRef,useState,type KeyboardEvent} from 'react';
import {createPortal} from 'react-dom';
import {ChevronLeft,ChevronRight,Crosshair,UserRound,X} from 'lucide-react';
import type {OriginChoiceGroup} from './origin-options';
import {originChoiceLayout,ORIGIN_PAGE_SIZE} from './origin-choice-layout';
import type {UtilityReference} from './utility-data';
import './origin-choices.css';

/** A map-anchored visual choice for recipes sharing a small standing area. The
 * spokes are menu choices; the map's published standing coordinates stay put. */
export default function OriginChoices({group,anchor,trigger,mapImage,onChoose,onClose}:{
  group:OriginChoiceGroup;anchor:{x:number;y:number};trigger:SVGElement;
  mapImage:string;
  onChoose:(record:UtilityReference)=>void;onClose:()=>void;
}){
  const panel=useRef<HTMLDivElement>(null);
  const previewClip=useId();
  const close=useRef(onClose);close.current=onClose;
  const [page,setPage]=useState(0);
  const personal=group.kind==='personal';
  const [position,setPosition]=useState({left:0,top:0,width:328,ready:false});
  const pages=Math.ceil(group.options.length/ORIGIN_PAGE_SIZE);
  const {direct,options,points,sources,preview}=useMemo(()=>originChoiceLayout(group,position.width,page),[group,position.width,page]);
  const {start:previewStart,span:previewSpan}=preview;
  useLayoutEffect(()=>{
    function place(){
      if(!panel.current)return;
      const width=Math.min(328,innerWidth-24);
      panel.current.style.width=`${width}px`;
      const box=panel.current.getBoundingClientRect();
      const next={left:Math.max(12,Math.min(anchor.x-box.width/2,innerWidth-box.width-12)),
        top:Math.max(12,Math.min(anchor.y-box.height/2,innerHeight-box.height-12)),width:panel.current.clientWidth,ready:true};
      setPosition(old=>old.left===next.left&&old.top===next.top&&old.width===next.width&&old.ready?old:next);
    }
    place();const observer=new ResizeObserver(place);if(panel.current)observer.observe(panel.current);
    window.addEventListener('resize',place);
    return()=>{observer.disconnect();window.removeEventListener('resize',place);};
  },[anchor.x,anchor.y]);
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>panel.current?.querySelector<HTMLButtonElement>('.ul-origin-choice-option')?.focus({preventScroll:true}));
    return()=>cancelAnimationFrame(frame);
  },[page]);
  useEffect(()=>{
    function dismiss(){close.current();requestAnimationFrame(()=>trigger.isConnected&&trigger.focus({preventScroll:true}));}
    function outside(event:PointerEvent){
      if(panel.current?.contains(event.target as Node)||trigger.contains(event.target as Node))return;
      close.current();
      const control=event.target instanceof Element&&event.target.closest('button,input,textarea,select,a[href],[tabindex]:not([tabindex^="-"])');
      if(!control)requestAnimationFrame(()=>trigger.isConnected&&trigger.focus({preventScroll:true}));
    }
    function escape(event:globalThis.KeyboardEvent){if(event.key==='Escape'){event.preventDefault();event.stopPropagation();dismiss();}}
    document.addEventListener('pointerdown',outside,true);document.addEventListener('keydown',escape,true);
    return()=>{document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',escape,true);};
  },[trigger]);
  function focusOption(event:KeyboardEvent){
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
    event.preventDefault();event.stopPropagation();
    const buttons=Array.from(panel.current?.querySelectorAll<HTMLButtonElement>('.ul-origin-choice-option')||[]);
    const index=buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(['ArrowLeft','ArrowUp'].includes(event.key)?-1:1)+buttons.length)%buttons.length;
    buttons[next]?.focus({preventScroll:true});
  }
  return createPortal(<div ref={panel} className="ul-origin-choices" role="dialog" data-choice-kind={personal?'personal':'origin'} data-inset={direct?'positions':'spokes'}
    aria-label={personal?'Choose your lineup':`Choose throw from ${group.label}`}
    style={{left:position.left,top:position.top,visibility:position.ready?'visible':'hidden',maxHeight:'calc(100svh - 24px)'}}>
    <div className="ul-origin-choices-heading"><h2>{group.label}<span>{group.options.length} {personal?'lineups':'throws'}</span></h2>
      <button aria-label={personal?'Close your lineup choices':'Close throw choices'} onClick={()=>{onClose();requestAnimationFrame(()=>trigger.isConnected&&trigger.focus({preventScroll:true}));}}><X size={18}/></button></div>
    <div className="ul-origin-choice-options" role="group" aria-label={personal?'Your saved lineups':'Available throws'} style={{height:position.width}} onKeyDown={focusOption}>
      <svg className="ul-origin-choice-spokes" viewBox={`0 0 ${position.width} ${position.width}`} aria-hidden="true">
        <defs><clipPath id={previewClip}><rect x={previewStart} y={previewStart} width={preview.size} height={preview.size} rx="10"/></clipPath></defs>
        <g clipPath={`url(#${previewClip})`}>
        <svg className="ul-origin-choice-preview" x={previewStart} y={previewStart} width={preview.size} height={preview.size}
          viewBox={`${preview.x} ${preview.y} ${previewSpan} ${previewSpan}`}>
          <rect x={preview.x} y={preview.y} width={previewSpan} height={previewSpan} fill="var(--canvas)"/>
          <image href={mapImage} x="0" y="0" width="1000" height="1000"/>
        </svg>
        </g>
        <rect className="ul-origin-choice-preview-frame" x={previewStart} y={previewStart} width={preview.size} height={preview.size} rx="10"/>
        {!direct&&options.map((option,index)=><line key={option.record.id} data-recipe-id={option.record.id}
          x1={sources[index].x} y1={sources[index].y} x2={points[index].x} y2={points[index].y}/>)}
        {!direct&&sources.map((point,index)=>sources.findIndex(other=>other.x===point.x&&other.y===point.y)===index&&
          <circle key={options[index].record.id} className="ul-origin-choice-source" cx={point.x} cy={point.y} r="3"/>)}
      </svg>
      {options.map((option,index)=>{const {record}=option;const approximate='point' in option && option.point.precision!=='world';
        const point=points[index];
        const labelSide=point.y<position.width*.4?'top':point.y>position.width*.6?'bottom':point.x<position.width/2?'left':'right';
        return <button key={record.id} className="ul-origin-choice-option"
        style={{left:point.x-(direct?22:28),top:point.y-22}} data-label-side={direct?undefined:labelSide} data-lineup-id={record.id} data-spawn-slot={personal?undefined:record.spawn?.slot} data-approximate={approximate||undefined}
        title={personal?`${record.title} · your saved target`:`${record.from} · ${approximate?'Approximate area. Match the Position photo.':'Recorded start.'} ${record.throwType} · ${record.creator||'Original source'}`}
        aria-label={personal?`Open your lineup: ${record.title}`:`${record.from} — ${record.throwType}${record.spawn?` (${record.creator||'source'} numbering)`:''}`}
        onClick={()=>onChoose(record)}>
        <span className="ul-origin-choice-disc">{personal?<UserRound size={20}/>:record.spawn?<span>{record.spawn.slot}</span>:direct?<span>{/pillar/i.test(record.from)?'Pillar':'Area'}</span>:<Crosshair size={20}/>}</span>
        {!direct&&<span className="ul-origin-choice-label">{personal?record.title:record.spawn?record.spawn.label:record.from}</span>}
      </button>;})}
    </div>
    <div className="ul-origin-choice-footer">
      {pages>1?<><button aria-label={personal?'Previous lineups':'Previous throws'} disabled={!page} onClick={()=>setPage(value=>value-1)}><ChevronLeft size={18}/></button><span>{page*ORIGIN_PAGE_SIZE+1}–{Math.min((page+1)*ORIGIN_PAGE_SIZE,group.options.length)} of {group.options.length}</span><button aria-label={personal?'More lineups':'More throws'} disabled={page===pages-1} onClick={()=>setPage(value=>value+1)}><ChevronRight size={18}/></button></>:<span>{personal?'Open your lineup · target preview':direct?'Tap a spawn · numbers follow the creator':'Choose your standing position'}</span>}
    </div>
  </div>,document.body);
}
