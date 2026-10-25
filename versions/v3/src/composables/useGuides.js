import { ref,onMounted,onBeforeUnmount } from 'vue'
export function useGuides(){
  const bounds=ref(null);let hovered=null,focused=null,control=null,frame=0,timer=0,observer,disposed=false
  function clear(){clearTimeout(timer);cancelAnimationFrame(frame);frame=0;hovered=focused=control=null;observer?.disconnect();bounds.value=null}
  function measure(){frame=0;if(!control?.isConnected||control.closest('[inert]')){clear();return}const {left,right,top,bottom}=control.getBoundingClientRect();bounds.value={left,right,top,bottom}}
  function request(){if(!disposed&&control&&!frame)frame=requestAnimationFrame(measure)}
  function choose(){clearTimeout(timer);const target=[hovered,focused].find(c=>c?.isConnected&&!c.disabled&&!c.closest('[inert]'))
    if(!target){timer=setTimeout(clear,150);return}
    if(control!==target){observer?.disconnect();control=target;observer?.observe(control)}request()
  }
  function enter(e){const target=e.target.closest?.('[data-guide]');if(e.type==='focusin'){focused=target?.matches(':focus-visible')?target:null;if(focused)hovered=null}else hovered=target;choose()}
  function leave(e){let target=e.relatedTarget?.closest?.('[data-guide]');if(target===e.target.closest?.('[data-guide]'))return;if(target&&!e.currentTarget.contains(target))target=null;if(e.type==='focusout')focused=target?.matches(':focus-visible')?target:null;else hovered=target;choose()}
  function exit(){hovered=null;choose()}
  onMounted(()=>{observer=new ResizeObserver(request);window.addEventListener('resize',request,{passive:true});window.addEventListener('scroll',request,{passive:true});document.fonts.ready.then(request)})
  onBeforeUnmount(()=>{disposed=true;clear();window.removeEventListener('resize',request);window.removeEventListener('scroll',request)})
  return {bounds,clear,enter,leave,exit}
}
