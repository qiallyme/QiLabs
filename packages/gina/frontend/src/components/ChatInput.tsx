import React,{useState}from'react'

interface Props{disabled?:boolean;onSend:(t:string)=>void}

export const ChatInput:React.FC<Props>=({disabled,onSend})=>{
  const[val,setVal]=useState('')
  const send=()=>{const t=val.trim();if(!t||disabled)return;onSend(t);setVal('')}
  const onKey:React.KeyboardEventHandler<HTMLInputElement>=e=>{if(e.key==='Enter'){e.preventDefault();send()}}
  return(
    <div style={s.f}>
      <div style={s.row}>
        <input style={s.in}placeholder="Describe a situation to simulate…"value={val}onChange={e=>setVal(e.target.value)}onKeyDown={onKey}disabled={disabled}/>
        <button type="button"style={s.btn}onClick={send}disabled={disabled}>Send</button>
      </div>
      <div style={s.meta}><strong>Note:</strong> Demo only – not real legal or emergency help.</div>
    </div>
  )
}

const s:Record<string,React.CSSProperties>={
  f:{padding:'6px 10px 10px',borderTop:'1px solid #e5e7eb'},
  row:{display:'flex',alignItems:'center',gap:6,borderRadius:999,border:'1px solid #d1d5db',padding:'5px 7px',background:'#f9fafb'},
  in:{border:'none',background:'transparent',flex:1,fontSize:'.78rem',color:'#374151',outline:'none'},
  btn:{border:'none',borderRadius:999,padding:'4px 10px',fontSize:'.75rem',fontWeight:600,background:'linear-gradient(135deg,#ff6b35,#ffb347)',color:'#111827',cursor:'pointer'},
  meta:{marginTop:4,fontSize:'.7rem',color:'#6b7280'}
}
