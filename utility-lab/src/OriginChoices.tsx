import {useEffect,useId,useLayoutEffect,useMemo,useRef,useState,type KeyboardEvent} from 'react';
import {createPortal} from 'react-dom';
import {ChevronLeft,ChevronRight,Crosshair,UserRound,X} from 'lucide-react';
import {numberedSpawnSections,type OriginChoiceGroup} from './origin-options';
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
  const [inspected,setInspected]=useState('');
  const personal=group.kind==='personal';
  const [position,setPosition]=useState({left:0,top:0,width:328,ready:false});
  const sections=useMemo(()=>numberedSpawnSections(group,position.width),[group,position.width]);
  const pages=sections?1+Math.ceil(sections.nearby.options.length/ORIGIN_PAGE_SIZE):Math.ceil(group.options.length/ORIGIN_PAGE_SIZE);
  const visiblePage=Math.min(page,pages-1);
  const section=sections?(visiblePage===0?sections.spawns:sections.nearby):group;
  const sectionPage=sections?Math.max(0,visiblePage-1):visiblePage;
  const {direct,options,points,sources,preview,oneLeader}=useMemo(()=>originChoiceLayout(section,position.width,sectionPage),[section,position.width,sectionPage]);
  const activeIndex=Math.max(0,options.findIndex(option=>option.record.id===inspected));
  const active=options[activeIndex]?.record.id;
  const activeSource=sources[activeIndex];
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
    const frame=requestAnimationFrame(()=>{
      const chosen = panel.current?.querySelector('.ul-origin-choice-option:focus');
      if (!chosen) panel.current?.querySelector<HTMLButtonElement>('.ul-origin-choice-option')?.focus({preventScroll:true});
    });
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
  function traceFromInset(clientX:number,clientY:number,inset:SVGRectElement){
    const matrix=inset.getScreenCTM();
    if(!matrix)return;
    const point=new DOMPoint(clientX,clientY).matrixTransform(matrix.inverse());
    const distances=sources.map(source=>Math.hypot(source.x-point.x,source.y-point.y));
    const nearest=Math.min(...distances);
    // Repeated taps at one shared start cycle its recipes. The outer badges
    // always open their own guide immediately, including on touchscreens.
    const indices=distances.flatMap((distance,index)=>Math.abs(distance-nearest)<.001?[index]:[]);
    const index=indices[(indices.indexOf(activeIndex)+1)%indices.length];
    if(index!==undefined)setInspected(options[index].record.id);
  }
  return createPortal(<div ref={panel} className="ul-origin-choices" role="dialog" data-choice-kind={personal?'personal':'origin'} data-inset={direct?'positions':'spokes'} data-leaders={direct?'none':oneLeader?'active':'all'}
    aria-label={personal?'Choose your lineup':`Choose throw from ${section.label}`}
    style={{left:position.left,top:position.top,visibility:position.ready?'visible':'hidden',maxHeight:'calc(100svh - 24px)'}}>
    <div className="ul-origin-choices-heading"><h2>{section.label}<span>{section.options.length} {personal?'lineups':'throws'}</span></h2>
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
        {oneLeader&&<rect x={previewStart} y={previewStart} width={preview.size} height={preview.size}
          className="ul-origin-choice-trace-surface" fill="transparent" pointerEvents="all"
          onPointerDown={event=>{event.preventDefault();traceFromInset(event.clientX,event.clientY,event.currentTarget);}}/>}
        {!direct&&options.map((option,index)=><line key={option.record.id} data-recipe-id={option.record.id}
          data-active={option.record.id===active||undefined} visibility={oneLeader&&option.record.id!==active?'hidden':undefined}
          x1={sources[index].x} y1={sources[index].y} x2={points[index].x} y2={points[index].y}/>)}
        {!direct&&sources.map((point,index)=>sources.findIndex(other=>other.x===point.x&&other.y===point.y)===index&&
          <circle key={options[index].record.id} className="ul-origin-choice-source" cx={point.x} cy={point.y} r="3"/>)}
        {!direct&&activeSource&&<circle className="ul-origin-choice-active-dot" cx={activeSource.x} cy={activeSource.y} r="4.5"/>}
      </svg>
      {options.map((option,index)=>{const {record}=option;const approximate='point' in option && option.point.precision!=='world';
        const point=points[index];
        const labelSide=point.y<position.width*.4?'top':point.y>position.width*.6?'bottom':point.x<position.width/2?'left':'right';
        return <button key={record.id} className="ul-origin-choice-option"
        data-traced={!direct&&record.id===active||undefined}
        style={{left:point.x-(direct?22:28),top:point.y-22}} data-label-side={direct?undefined:labelSide} data-lineup-id={record.id} data-spawn-slot={personal?undefined:record.spawn?.slot} data-approximate={approximate||undefined}
        title={personal?`${record.title} · your saved target`:`${record.from} · ${approximate?'Approximate area. Match the Position photo.':'Recorded start.'} ${record.throwType} · ${record.creator||'Original source'}`}
        aria-label={personal?`Open your lineup: ${record.title}`:`${record.from} — ${record.throwType}${record.spawn?` (${record.creator||'source'} numbering)`:''}`}
        onFocus={()=>setInspected(record.id)} onPointerEnter={()=>setInspected(record.id)}
        onPointerDown={()=>setInspected(record.id)} onClick={()=>onChoose(record)}>
        <span className="ul-origin-choice-disc">{personal?<UserRound size={20}/>:record.spawn?<span>{record.spawn.slot}</span>:direct?<span>{/pillar/i.test(record.from)?'Pillar':'Area'}</span>:<Crosshair size={20}/>}</span>
        {!direct&&<span className="ul-origin-choice-label">{personal?record.title:record.spawn?record.spawn.label:record.from}</span>}
      </button>;})}
    </div>
    <div className="ul-origin-choice-footer">
      {sections&&pages===2
        ? <button className="ul-origin-section-switch" aria-label={visiblePage===0?'More throws':'Previous throws'} onClick={()=>setPage(visiblePage===0?1:0)}>
            {visiblePage!==0&&<ChevronLeft size={16}/>}
            {visiblePage===0?`Nearby throws (${sections.nearby.options.length})`:`Spawn positions (${sections.spawns.options.length})`}
            {visiblePage===0&&<ChevronRight size={16}/>}
          </button>
        : pages>1?<><button aria-label={personal?'Previous lineups':'Previous throws'} disabled={!visiblePage} onClick={()=>setPage(visiblePage-1)}><ChevronLeft size={18}/></button><span>{sections&&visiblePage===0?'Spawn positions':`${sectionPage*ORIGIN_PAGE_SIZE+1}–${Math.min((sectionPage+1)*ORIGIN_PAGE_SIZE,section.options.length)} of ${section.options.length}`}</span><button aria-label={personal?'More lineups':'More throws'} disabled={visiblePage===pages-1} onClick={()=>setPage(visiblePage+1)}><ChevronRight size={18}/></button></>:<span>{oneLeader?'Tap the inset to trace a throw':personal?'Open your lineup · target preview':direct?'Tap a spawn · numbers follow the creator':'Choose your standing position'}</span>}
    </div>
  </div>,document.body);
}
