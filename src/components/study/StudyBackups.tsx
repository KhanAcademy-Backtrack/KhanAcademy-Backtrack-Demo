'use client';
import {useEffect,useState} from 'react';
import {listStudyBackups} from '@/lib/study-storage';
export function StudyBackups(){
 const [items,setItems]=useState<ReturnType<typeof listStudyBackups>>([]),[message,setMessage]=useState('');
 useEffect(()=>{const refresh=()=>{try{setItems(listStudyBackups(localStorage));}catch{setItems([]);}};refresh();window.addEventListener('storage',refresh);window.addEventListener('backtrack:cleared',refresh);return()=>{window.removeEventListener('storage',refresh);window.removeEventListener('backtrack:cleared',refresh);};},[]);
 if(!items.length)return null;
 return <details className="study-backups"><summary>Saved backups</summary><p>Download an earlier save before making further changes.</p>{items.map(item=><div key={item.key}><span>{item.kind==='before-restore'?'Before a restore':'Earlier save'} · {new Date(item.at).toLocaleString()}</span><button className="button-text" onClick={()=>{try{const raw=localStorage.getItem(item.key);if(raw===null){setMessage('That backup is no longer available.');return;}const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`dunlo-backup-${item.at}.json`;a.click();URL.revokeObjectURL(url);setMessage('Backup downloaded.');}catch{setMessage('This browser could not read the backup.');}}}>Download backup</button></div>)}<p role="status">{message}</p></details>;
}
