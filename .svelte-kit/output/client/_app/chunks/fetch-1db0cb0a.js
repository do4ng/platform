async function h(n){let e;return await fetch(`http://localhost:4000${n}`).then(t=>t.json()).then(t=>e=t),e}export{h as f};
