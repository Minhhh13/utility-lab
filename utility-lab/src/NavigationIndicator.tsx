import {useLayoutEffect,useRef} from "react";

/** One underline retargets between tabs; content and map geometry stay still. */
export default function NavigationIndicator({activeView}:{activeView:string}) {
  const indicator=useRef<HTMLSpanElement>(null);
  const place=useRef<((animate:boolean)=>void)|undefined>(undefined);

  useLayoutEffect(()=>{
    const element=indicator.current,parent=element?.parentElement;
    if(!element||!parent)return;
    const position=(animate:boolean)=>{
      const active=parent.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      const bounds=active?.getBoundingClientRect(),container=parent.getBoundingClientRect();
      const motion=animate && document.documentElement.dataset.navigationInput==="pointer" &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches;
      element.style.transition=motion?"":"none";
      if(!bounds||!bounds.width) {element.style.opacity="0";return;}
      const inset=parent.classList.contains("phone-tabs")?12:0;
      element.style.transform=`translateX(${bounds.left-container.left+inset}px) scaleX(${Math.max(1,bounds.width-inset*2)})`;
      element.style.opacity="1";
    };
    place.current=position;
    position(false);
    // Resizing, loading fonts and revealing a hidden header fit immediately.
    // Keep this observer mounted across tab changes so it cannot restart motion.
    const observer=new ResizeObserver(()=>position(false));
    observer.observe(parent);
    parent.querySelectorAll('[role="tab"]').forEach(tab=>observer.observe(tab));
    return()=>{observer.disconnect();place.current=undefined;};
  },[]);

  useLayoutEffect(()=>{place.current?.(true);},[activeView]);
  return <span ref={indicator} className="nav-active-indicator" aria-hidden="true" />;
}
