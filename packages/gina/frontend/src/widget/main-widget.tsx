import React from'react'
import ReactDOM from'react-dom/client'
import{WidgetShell}from'../components/WidgetShell'
import'../index.css'

const App=()=>(
  <div style={s.root}>
    <div style={s.card}>
      <WidgetShell source="iframe-widget"/>
    </div>
  </div>
)

const s:Record<string,React.CSSProperties>={
  root:{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:10,background:'#fff'},
  card:{width:'100%',maxWidth:420,height:520}
}

ReactDOM.createRoot(document.getElementById('root')as HTMLElement).render(
  <React.StrictMode><App/></React.StrictMode>
)
