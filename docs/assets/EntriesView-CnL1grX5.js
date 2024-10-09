import{u as D,a as b,d as S}from"./vuedraggable.umd-CU4l6tQn.js";import{o as f,c as x,a as e,d as v,m as j,u as B,j as E,w as d,k as s,e as o,l as _,G as L,V as M,b as i,Y as N,S as R,r as V,g as y,p as T,F as I,t as C}from"./index-BawjudfB.js";import{_ as P}from"./TabReference.vue_vue_type_script_setup_true_lang-BNm6UJaQ.js";function F(c,l){return f(),x("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor","aria-hidden":"true","data-slot":"icon"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"})])}function k(c,l){return f(),x("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor","aria-hidden":"true","data-slot":"icon"},[e("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"})])}const U=["placeholder","value"],h=v({__name:"InputText",props:{placeholder:{},value:{}},emits:["change"],setup(c,{emit:l}){const a=l;return(m,r)=>(f(),x("div",null,[r[1]||(r[1]=e("label",{for:"input",class:"sr-only"},"Input",-1)),e("input",{type:"text",name:"input",id:"input",class:"block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",placeholder:m.placeholder,value:m.value,onChange:r[0]||(r[0]=n=>a("change",n.target.value))},null,40,U)]))}}),z={class:"fixed inset-0 z-10 w-screen overflow-y-auto"},A={class:"flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"},G={class:"sm:flex sm:items-start"},H={class:"mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"},Y={class:"mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left"},Z={class:"mt-5 sm:mt-4 sm:flex sm:flex-row-reverse"},$=v({__name:"DialogDelete",props:{showing:{type:Boolean,default:!1},showingModifiers:{}},emits:j(["delete"],["update:showing"]),setup(c,{emit:l}){const a=B(c,"showing"),m=l;return(r,n)=>(f(),E(s(R),{as:"template",show:a.value},{default:d(()=>[o(s(N),{class:"relative z-50",onClose:n[2]||(n[2]=w=>a.value=!1)},{default:d(()=>[o(s(_),{as:"template",enter:"ease-out duration-300","enter-from":"opacity-0","enter-to":"opacity-100",leave:"ease-in duration-200","leave-from":"opacity-100","leave-to":"opacity-0"},{default:d(()=>n[3]||(n[3]=[e("div",{class:"fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"},null,-1)])),_:1}),e("div",z,[e("div",A,[o(s(_),{as:"template",enter:"ease-out duration-300","enter-from":"opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95","enter-to":"opacity-100 translate-y-0 sm:scale-100",leave:"ease-in duration-200","leave-from":"opacity-100 translate-y-0 sm:scale-100","leave-to":"opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"},{default:d(()=>[o(s(L),{class:"relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"},{default:d(()=>[e("div",G,[e("div",H,[o(s(F),{class:"h-6 w-6 text-red-600","aria-hidden":"true"})]),e("div",Y,[o(s(M),{as:"h3",class:"text-base font-semibold leading-6 text-gray-900"},{default:d(()=>n[4]||(n[4]=[i("Delete row")])),_:1}),n[5]||(n[5]=e("div",{class:"mt-2"},[e("p",{class:"text-sm text-gray-500"},"Are you sure you want to delete this? It will be permanently removed. This action cannot be undone.")],-1))])]),e("div",Z,[e("button",{type:"button",class:"inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto",onClick:n[0]||(n[0]=w=>{a.value=!1,m("delete")})},"Delete"),e("button",{type:"button",class:"mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto",onClick:n[1]||(n[1]=w=>a.value=!1),ref:"cancelButtonRef"},"Cancel",512)])]),_:1})]),_:1})])])]),_:1})]),_:1},8,["show"]))}}),q={class:"flex justify-center rounded-md border border-dashed border-gray-900/25 px-6 py-2"},W={class:"text-center"},J={class:"flex text-sm leading-6 text-gray-600"},K={for:"file-upload",class:"relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"},O=v({__name:"InputFile",emits:["change"],setup(c,{emit:l}){const a=l;return(m,r)=>(f(),x("div",q,[e("div",W,[e("div",J,[e("label",K,[e("span",null,[V(m.$slots,"default")]),e("input",{id:"file-upload",name:"file-upload",type:"file",class:"sr-only",onChange:r[0]||(r[0]=n=>a("change",n))},null,32)])])])]))}}),Q={class:"px-4 sm:px-6 lg:px-8"},X={class:"sm:flex sm:items-center"},ee={class:"sm:flex-auto"},te={class:"mt-2 text-sm text-gray-700"},se={class:"mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex flex-row gap-2"},oe={class:"mt-8 flow-root"},le={class:"-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8"},ne={class:"inline-block min-w-full py-2 align-middle"},ae={class:"handle"},re={class:"whitespace-nowrap py-2 lg:pl-4 lg:pr-3 text-sm font-medium text-gray-900"},ie={class:"whitespace-nowrap lg:px-3 py-2 text-sm text-gray-500"},de={class:"whitespace-nowrap lg:px-3 py-2 text-sm text-gray-500"},me={class:"whitespace-nowrap lg:px-3 py-2 text-sm text-gray-500"},ue={class:"relative whitespace-nowrap lg:pl-3 lg:pr-4 text-right text-sm font-medium"},pe=["onClick"],ce={class:"sr-only"},ge={class:"flex flex-row justify-center mt-4"},fe={class:"grow flex flex-row justify-end"},ve=v({__name:"EntriesView",setup(c){const l=D(),a=y(!1),m=y(!1),r=y(0),n=y();return T(()=>{}),(w,t)=>(f(),x(I,null,[e("div",Q,[e("div",X,[e("div",ee,[t[9]||(t[9]=e("h1",{class:"text-base font-semibold leading-6 text-gray-900"},"Entries",-1)),e("p",te,[t[7]||(t[7]=i("Enter all the entries in your show including their title, event type, and people. These can be in any order. Show Sequence Creator does not save anything for you! Download your entries to get them back later. When you are done adding your entries go to the ")),o(P,{to:"/show"},{default:d(()=>t[6]||(t[6]=[i("Show")])),_:1}),t[8]||(t[8]=i(" tab to generate an order that spaces out items in your show."))])]),e("div",se,[o(O,{onChange:s(l).uploadCsv},{default:d(()=>t[10]||(t[10]=[i("Upload csv file")])),_:1},8,["onChange"]),o(b,{type:"button",onClick:t[0]||(t[0]=u=>s(l).downloadCsv())},{default:d(()=>t[11]||(t[11]=[i("Download")])),_:1})])]),e("div",oe,[e("div",le,[e("div",ne,[e("table",{class:"min-w-full divide-y divide-gray-300",ref_key:"tableRef",ref:n},[t[12]||(t[12]=e("thead",null,[e("tr",null,[e("th",{scope:"col"},[e("span",{class:"sr-only"},"Number")]),e("th",{scope:"col",class:"py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"},[i("Name "),e("span",{class:"text-gray-500 text.sm"},"(optional)")]),e("th",{scope:"col",class:"px-3 py-3.5 text-left text-sm font-semibold text-gray-900"},"Event Type"),e("th",{scope:"col",class:"px-3 py-3.5 text-left text-sm font-semibold text-gray-900"},[i("People "),e("span",{class:"text-gray-500 text-sm"},"(Seperated by comma)")]),e("th",{scope:"col",class:"py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"},[i("Lock Location Percent "),e("span",{class:"text-gray-500 text-sm"},"(optional)")]),e("th",{scope:"col",class:"relative py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8"},[e("span",{class:"sr-only"},"Remove")])])],-1)),o(s(S),{class:"divide-y divide-gray-200 bg-white",list:s(l).entries,"item-key":"id",tag:"tbody",handle:".handle"},{item:d(({element:u,index:g})=>[e("tr",null,[e("td",ae,C(g+1),1),e("td",re,[o(h,{placeholder:"name",value:u.name,onChange:p=>s(l).updateName(g,p)},null,8,["value","onChange"])]),e("td",ie,[o(h,{placeholder:"event",value:u.event,onChange:p=>s(l).updateEvent(g,p)},null,8,["value","onChange"])]),e("td",de,[o(h,{placeholder:"person, person",value:u.people,onChange:p=>s(l).updatePeople(g,p)},null,8,["value","onChange"])]),e("td",me,[o(h,{placeholder:"100",value:u.percentage,onChange:p=>s(l).updatePercentage(g,p)},null,8,["value","onChange"])]),e("td",ue,[e("button",{onClick:()=>{r.value=g,m.value=!0},tabindex:"-1",class:"text-red-500 hover:text-red-900"},[o(s(k),{class:"w-6 h-6"}),e("span",ce,"Remove, "+C(u.name),1)],8,pe)])])]),_:1},8,["list"])],512),e("div",ge,[t[15]||(t[15]=e("div",{class:"grow"},null,-1)),o(b,{onClick:s(l).addEntry},{default:d(()=>t[13]||(t[13]=[i("Add entry")])),_:1},8,["onClick"]),e("div",fe,[e("button",{onClick:t[1]||(t[1]=()=>{a.value=!0}),tabindex:"-1",class:"text-red-500 hover:text-red-900 flex flex-row gap-2 border border-red-500 hover:border-red-900 rounded p-2"},[t[14]||(t[14]=i(" Delete Show")),o(s(k),{class:"w-6 h-6"})])])])])])])]),o($,{showing:m.value,"onUpdate:showing":t[2]||(t[2]=u=>m.value=u),onDelete:t[3]||(t[3]=()=>s(l).removeEntry(r.value))},null,8,["showing"]),o($,{showing:a.value,"onUpdate:showing":t[4]||(t[4]=u=>a.value=u),onDelete:t[5]||(t[5]=()=>s(l).clear())},null,8,["showing"])],64))}});export{ve as default};
