async function t(t){let e;return await fetch(`https://kdmplatform.herokuapp.com${t}`).then((t=>t.json())).then((t=>e=t)),e}export{t as f};
