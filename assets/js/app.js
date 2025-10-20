(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  $('#y').textContent = new Date().getFullYear();

  fetch('data/kits.json')
    .then(r => r.json())
    .then(data => {
      const cardsWrap = $('#kitCards');
      const panelsWrap = $('#kitPanels');
      const kits = data.kits || [];

      // Render cards
      cardsWrap.innerHTML = kits.map(k => `
        <div class="card" data-target="#kit-${k.id}" role="button" tabindex="0">
          <img src="${k.cardImage}" alt="${k.title}">
          <div class="caption">${k.title}</div>
        </div>
      `).join('');

      // Render panels (gallery first)
      panelsWrap.innerHTML = kits.map(k => {
        const rows = (k.items||[]).map(it => `
          <tr>
            <td class="num">${it.no}</td>
            <td>${it.article}</td>
            <td>${it.name}</td>
            <td>${it.desc}</td>
            <td>${it.qty}</td>
            <td>${it.unit}</td>
            <td class="img"><img src="${it.image}" alt="${it.article}"></td>
          </tr>
        `).join('');

        const imgs = (k.detailImages && k.detailImages.length ? k.detailImages : [k.cardImage]);

        return `
          <div id="kit-${k.id}" class="panel">
            <h3>${k.title}</h3>
            <div class="view-toggle">
              <button data-view="list">Dạng danh sách</button>
              <button data-view="grid" class="active">Dạng hình ảnh</button>
            </div>

            <div class="grid-view gridView" style="display:grid">
              <div class="gallery" data-images='${JSON.stringify(imgs).replace(/"/g,'&quot;')}' data-index="0">
                <div class="kit-hero">
                  <img src="${imgs[0]}" alt="${k.title}">
                </div>
                <div class="gallery-controls">
                  <button class="btn prev" aria-label="Ảnh trước">‹</button>
                  <span class="count">1 / ${imgs.length}</span>
                  <button class="btn next" aria-label="Ảnh tiếp theo">›</button>
                </div>
              </div>
            </div>

            <div class="table-wrap listView" style="display:none">
              <table class="cci">
                <thead>
                  <tr>
                    <th class="num">No.</th>
                    <th>Article No.</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Image</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </div>
        `;
      }).join('');

      // Hide all panels initially
      $$('.panel').forEach(p => p.classList.remove('active'));

      // Card interactions
      $$('.card[data-target]').forEach(card=>{
        function openTarget(){
          const sel = card.getAttribute('data-target');
          $$('.panel').forEach(p=>p.classList.remove('active'));
          const panel = $(sel);
          if(panel){ panel.classList.add('active'); panel.scrollIntoView({behavior:'smooth', block:'start'}); }
          initGalleries(panel);
        }
        card.addEventListener('click', openTarget);
        card.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' ') { e.preventDefault(); openTarget(); }});
      });

      // Toggle list/grid per panel
      function bindToggles(root=document){
        $$('.panel', root).forEach(panel=>{
          const listBtn = panel.querySelector('button[data-view="list"]');
          const gridBtn = panel.querySelector('button[data-view="grid"]');
          const listView = panel.querySelector('.listView');
          const gridView = panel.querySelector('.gridView');
          if(!listBtn || !gridBtn) return;
          const activate = (mode)=>{
            if(mode==='list'){
              listBtn.classList.add('active'); gridBtn.classList.remove('active');
              listView.style.display='block'; gridView.style.display='none';
            }else{
              gridBtn.classList.add('active'); listBtn.classList.remove('active');
              gridView.style.display='grid'; listView.style.display='none';
            }
          };
          listBtn.addEventListener('click', ()=>activate('list'));
          gridBtn.addEventListener('click', ()=>activate('grid'));
        });
      }
      bindToggles();

      // Gallery init + navigation
      const lb = $('#lightbox'), lbImg = $('#lightboxImg'), lbClose = $('#lightboxClose');
      let __lbImages = null, __lbIndex = 0;

      function openLightbox(src){ __lbImages=null; lbImg.src = src; lb.classList.add('open'); document.body.style.overflow='hidden'; }
      function openLightboxWithSet(arr, index){ __lbImages = arr.slice(); __lbIndex = index||0; lbImg.src = __lbImages[__lbIndex]; lb.classList.add('open'); document.body.style.overflow='hidden'; }
      function closeLightbox(){ lb.classList.remove('open'); lbImg.src=''; document.body.style.overflow=''; }

      function initGalleries(scope=document){
        $$('.gallery', scope).forEach(gal => {
          const data = gal.getAttribute('data-images');
          let images = [];
          try { images = JSON.parse(data.replace(/&quot;/g,'"')); } catch(e){ images = []; }
          if(!images.length) return;
          let idx = parseInt(gal.getAttribute('data-index')||'0', 10);
          const hero = gal.querySelector('.kit-hero img');
          const count = gal.querySelector('.gallery-controls .count');
          const prev = gal.querySelector('.gallery-controls .prev');
          const next = gal.querySelector('.gallery-controls .next');

          function render(){
            if(idx < 0) idx = images.length-1;
            if(idx >= images.length) idx = 0;
            hero.src = images[idx];
            count.textContent = (idx+1) + ' / ' + images.length;
            gal.setAttribute('data-index', idx);
          }
          prev.addEventListener('click', ()=>{ idx--; render(); });
          next.addEventListener('click', ()=>{ idx++; render(); });
          hero.addEventListener('click', ()=> openLightboxWithSet(images, idx));
          render();
        });
      }
      initGalleries();

      // Lightbox general clicks (table images)
      document.addEventListener('click', e => {
        const img = e.target.closest('.panel .img img');
        if(img){ openLightbox(img.src); }
      });
      lb.addEventListener('click', e => { if(e.target===lb||e.target===lbClose) closeLightbox(); });
      window.addEventListener('keydown', e=>{
        if(!lb.classList.contains('open')) return;
        if(e.key==='Escape') closeLightbox();
        if(__lbImages){
          if(e.key==='ArrowRight'){ __lbIndex = (__lbIndex+1)%__lbImages.length; lbImg.src = __lbImages[__lbIndex]; }
          if(e.key==='ArrowLeft'){ __lbIndex = (__lbIndex-1+__lbImages.length)%__lbImages.length; lbImg.src = __lbImages[__lbIndex]; }
        }
      });

    });
})();