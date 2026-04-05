import React,{useEffect,useRef}from 'react'
import type{ChatMessage}from'../models/chat'

interface Props{messages:ChatMessage[]}

export const MessageList:React.FC<Props>=({messages})=>{
  const ref=useRef<HTMLDivElement|null>(null)
  useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight},[messages])
  return(
    <div ref={ref} style={s.c}>
      {messages.map(m=>(
        <div key={m.id} style={{...s.b,...(m.role==='assistant'?s.lina:s.user)}}>
          <div style={s.lbl}>{m.role==='assistant'?'Lina':'You'}</div>
          <div dangerouslySetInnerHTML={{__html:m.content.replace(/\n/g,'<br />')}}/>
        </div>
      ))}
    </div>
  )
}

const s:Record<string,React.CSSProperties>={
  c:{flex:1,overflowY:'auto',padding:'10px 10px 8px',display:'flex',flexDirection:'column',gap:8},
  b:{maxWidth:'100%',padding:'8px 10px',borderRadius:14,fontSize:'.8rem',lineHeight:1.5},
  lina:{alignSelf:'flex-start',background:'#fff',border:'1px solid #e5e7eb',color:'#374151'},
  user:{alignSelf:'flex-end',background:'linear-gradient(135deg,rgba(96,165,250,.2),rgba(56,189,248,.35))',border:'1px solid rgba(56,189,248,.6)',color:'#111827'},
  lbl:{fontSize:'.68rem',textTransform:'uppercase',letterSpacing:'.08em',color:'#9ca3af',marginBottom:4}
}
