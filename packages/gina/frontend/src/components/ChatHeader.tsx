import React from 'react'

interface Props{subtitle?:string}

export const ChatHeader:React.FC<Props>=({subtitle})=>(
  <header style={s.header}>
    <div style={s.avatar} aria-hidden="true" />
    <div>
      <div style={s.row}>
        <span style={s.name}>Lina</span>
        <span style={s.badge}>Lumara Navigator</span>
      </div>
      <div style={s.sub}>{subtitle || 'Demo · Not real legal or emergency help.'}</div>
    </div>
  </header>
)

const s:Record<string,React.CSSProperties>={
  header:{display:'flex',gap:10,alignItems:'center',padding:'8px 10px',borderBottom:'1px solid #e5e7eb',background:'linear-gradient(135deg,#fff7ef,#fffaf6)'},
  avatar:{width:32,height:32,borderRadius:999,background:'radial-gradient(circle at 30% 0%,#ffe5de 0,#ff6b35 40%,#d84315 100%)',boxShadow:'0 0 12px rgba(255,107,53,.55)',position:'relative'},
  row:{display:'flex',alignItems:'center',gap:8},
  name:{fontSize:'.9rem',fontWeight:600},
  badge:{fontSize:'.7rem',color:'#6b7280'},
  sub:{fontSize:'.72rem',color:'#6b7280',marginTop:2}
}
