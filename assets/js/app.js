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

      // Render panels (default Image view first with single hero image)
      panelsWrap.innerHTML = kits.map(k => {
        const rows = (k.items||[]).map(it => `
          <tr>
            <td class="num">${it.no}</td>
            <td>${it.article}</td>
            <td>${it.name}</td>
            <td>${it.desc}</td>
            <td>${it.qty}</td>
            <td>${it.unit}</td>
            <td class="img"><img src="\${it.image}" alt="\${it.article}"></td>
          </tr>
        `).join('');

        return `
          <div id="kit-${k.id}" class="panel">
            <h3>${k.title}</h3>
            <div class="view-toggle">
              <button data-view="list">Dạng danh sách</button>
              <button data-view="grid" class="active">Dạng hình ảnh</button>
            </div>

            <!-- GRID default (hero image) -->
            <div class="grid-view gridView" style="display:grid">
              <div class="kit-hero">
                <img src="${k.detailImage || k.cardImage}" alt="${k.title}">
              </div>
            </div>

            <!-- LIST hidden by default -->
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
        }
        card.addEventListener('click', openTarget);
        card.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' ') { e.preventDefault(); openTarget(); }});
      });

      // Toggle list/grid per panel
      $$('.panel').forEach(panel=>{
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

      // Lightbox includes hero and table images (not cards)
      const lb = $('#lightbox'), lbImg = $('#lightboxImg'), lbClose = $('#lightboxClose');
      function openLightbox(src){ lbImg.src = src; lb.classList.add('open'); document.body.style.overflow='hidden'; }
      function closeLightbox(){ lb.classList.remove('open'); lbImg.src=''; document.body.style.overflow=''; }

      document.addEventListener('click', e => {
        const img = e.target.closest('.panel .img img, .grid-item img, .kit-hero img');
        if(img){ openLightbox(img.src); }
      });
      lb.addEventListener('click', e => { if(e.target===lb||e.target===lbClose) closeLightbox(); });
      window.addEventListener('keydown', e=>{ if(e.key==='Escape' && lb.classList.contains('open')) closeLightbox(); });
    });
})();