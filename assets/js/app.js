(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  document.getElementById('y').textContent = new Date().getFullYear();

  // Render cards & panels from data
  fetch('data/kits.json')
    .then(r => r.json())
    .then(data => {
      const cardsWrap = document.getElementById('kitCards');
      const panelsWrap = document.getElementById('kitPanels');
      const kits = data.kits || [];

      cardsWrap.innerHTML = kits.map(k => `
        <div class="card" data-target="#kit-${k.id}" role="button" tabindex="0">
          <img src="${k.cardImage}" alt="${k.title}">
          <div class="caption">${k.title}</div>
        </div>
      `).join('');

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

        const grid = (k.items||[]).map(it => `
          <div class="grid-item">
            <img src="${it.image}" alt="${it.article}">
            <div class="caption">${it.name}<br><small>${it.desc.replace(/<[^>]*>/g, '')}</small></div>
          </div>
        `).join('');

        return `
          <div id="kit-${k.id}" class="panel">
            <h3>${k.title}</h3>
            <div class="view-toggle">
              <button data-view="list" class="active">Dạng danh sách</button>
              <button data-view="grid">Dạng hình ảnh</button>
            </div>
            <div class="table-wrap listView">
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
            <div class="grid-view gridView" style="display:none">${grid}</div>
          </div>
        `;
      }).join('');

      // Initially hide all panels
      $$('.panel').forEach(p => p.classList.remove('active'));

      // Card interactions: show only selected panel
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

      // Lightbox for product images (not for cards)
      const lb = $('#lightbox'), lbImg = $('#lightboxImg'), lbClose = $('#lightboxClose');
      function openLightbox(src){ lbImg.src = src; lb.classList.add('open'); document.body.style.overflow='hidden'; }
      function closeLightbox(){ lb.classList.remove('open'); lbImg.src=''; document.body.style.overflow=''; }

      document.addEventListener('click', e => {
        const img = e.target.closest('.panel .img img, .grid-item img');
        if(img){ openLightbox(img.src); }
      });
      lb.addEventListener('click', e => { if(e.target===lb||e.target===lbClose) closeLightbox(); });
      window.addEventListener('keydown', e=>{ if(e.key==='Escape' && lb.classList.contains('open')) closeLightbox(); });
    })
    .catch(err => {
      console.error('Lỗi tải dữ liệu kits.json:', err);
      document.getElementById('kitCards').innerHTML = '<p style="background:#fff;color:#b00020;padding:10px;border-radius:8px">Không tải được dữ liệu. Hãy kiểm tra <code>data/kits.json</code>.</p>';
    });
})();