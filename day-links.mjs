import {ritualDetails,articlePath} from './articles.mjs';
export function dayLinks(n){
 return [
  ...ritualDetails.filter(r=>r.days.includes(n)).map(r=>({url:'/'+articlePath(r),title:'細讀：'+r.title})),
  {url:'/guide/night-patrol.html',title:'夜間科儀：溫王查夜'},
  {url:'/guide/daily-offerings.html',title:'晨昏作紙與祀王'},
  ...(n===1?[{url:'/guide/jialian-sails.html',title:'請水前：嘉蓮宮升帆'},{url:'/guide/invitation-palace.html',title:'進表與代天府上樑'}]:[]),
  ...(n===2?[{url:'/guide/jialian-visit.html',title:'夜訪嘉蓮與清晨接駕'}]:[]),
  ...(n===6?[{url:'/guide/night-petitions.html',title:'夜間放告科儀'}]:[])
 ];
}
