(function(){
  const $ = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));

  // ----------------------------
  // 1) Issue type tiles
  // ----------------------------
  const tiles = $$(".grid .tile");
  if (tiles.length){
    tiles.forEach(tile => {
      const label = (tile.querySelector("strong")?.textContent || "").trim();
      tile.addEventListener("click", ()=> {
        localStorage.setItem("fixit_issue_type", label || "Other");
        hideError();
        tiles.forEach(t=>t.classList.remove("selected"));
        tile.classList.add("selected");
      });
      tile.addEventListener("keydown", e=>{
        if (e.key===" "||e.key==="Enter"){ e.preventDefault(); tile.click(); }
      });
      tile.setAttribute("tabindex","0");
    });
  }

  // ----------------------------
  // 2) Description counter
  // ----------------------------
  const desc = $("#desc");
  const cnt = $("#desc-count");
  if (desc && cnt){
    const max = +(desc.getAttribute("maxlength") || 240);
    const update = ()=>{
      cnt.textContent = `${max - desc.value.length} characters left`;
      saveDraft();
    };
    ["input","change"].forEach(ev=>desc.addEventListener(ev, update));
    update();
  }

  // ----------------------------
  // 3) Drag & drop photo
  // ----------------------------
  const drop = $("#drop"), file = $("#photo"), preview = $("#preview");
  if (drop && file && preview){
    const openPicker = ()=> file.click();
    drop.addEventListener("click", openPicker);
    drop.addEventListener("keydown", e=>{ if (e.key===" "||e.key==="Enter"){ e.preventDefault(); openPicker(); }});
    ["dragenter","dragover"].forEach(ev=>drop.addEventListener(ev, e=>{ e.preventDefault(); drop.classList.add("drag"); }));
    ["dragleave","drop"].forEach(ev=>drop.addEventListener(ev, e=>{ e.preventDefault(); drop.classList.remove("drag"); }));
    drop.addEventListener("drop", e=>{ const f = e.dataTransfer.files?.[0]; if (f) handle(f); });
    file.addEventListener("change", ()=>{ const f = file.files?.[0]; if (f) handle(f); });

    function handle(f){
      if (!f.type.startsWith("image/")){ preview.textContent = "Please use an image file."; return; }
      const img = new Image(); img.alt = "Selected photo preview"; img.src = URL.createObjectURL(f);
      preview.innerHTML = ""; preview.appendChild(img); saveDraft();
    }
  }

  // ----------------------------
  // 4) Draft save / restore
  // ----------------------------
  const key = "fixit_draft";
  function saveDraft(){
    const data = {
      issueType: localStorage.getItem("fixit_issue_type") || "",
      description: $("#desc")?.value || "",
      name: $("#name")?.value || "",
      email: $("#email")?.value || ""
    };
    try{ localStorage.setItem(key, JSON.stringify(data)); }catch{}
  }
  (function restore(){
    try{
      const d = JSON.parse(localStorage.getItem(key) || "null"); if (!d) return;
      if ($("#desc") && d.description) $("#desc").value = d.description;
      if ($("#name") && d.name) $("#name").value = d.name;
      if ($("#email") && d.email) $("#email").value = d.email;
      if (cnt && $("#desc")){
        const max = +($("#desc").getAttribute("maxlength") || 240);
        cnt.textContent = `${max - $("#desc").value.length} characters left`;
      }
    }catch{}
  })();
  $$("input,textarea").forEach(el => el.addEventListener("input", saveDraft));

  // ----------------------------
  // 5) Error banner helpers
  // ----------------------------
  function ensureErrorBanner(){
    let banner = document.getElementById("pageError");
    if (!banner){
      banner = document.createElement("div");
      banner.id = "pageError";
      banner.className = "error-banner";
      banner.setAttribute("role", "alert");
      banner.setAttribute("aria-live", "assertive");
      banner.hidden = true;
      const main = document.getElementById("main") || document.querySelector(".pane") || document.body;
      main.prepend(banner);
    }
    return banner;
  }
  function showError(msg){
    const b = ensureErrorBanner();
    b.textContent = msg;
    b.hidden = false;
    b.scrollIntoView({behavior:"smooth", block:"start"});
  }
  function hideError(){
    const b = document.getElementById("pageError");
    if (b){ b.hidden = true; b.textContent = ""; }
  }

  // ----------------------------
  // 6) Page-level validation
  // ----------------------------
  // IssueType page
  (function validateIssueTypePage(){
    if (!/issuetype\.html/i.test(location.pathname)) return;
    const next = document.querySelector('.rail a.btn.grow[href], .rail button.btn.grow, a.btn.grow[href*="details"]');
    if (!next) return;
    next.addEventListener("click", (e)=>{
      const chosen = localStorage.getItem("fixit_issue_type");
      if (!chosen){
        e.preventDefault();
        showError("Please choose an issue type before continuing.");
      } else hideError();
    }, true);
  })();

  // Details page
  (function validateDetailsPage(){
    if (!/details\.html/i.test(location.pathname)) return;
    const next = document.querySelector('.rail a.btn.grow[href], .rail button.btn.grow');
    if (!next) return;
    next.addEventListener("click", (e)=>{
      const text = $("#desc")?.value.trim();
      if (!text){
        e.preventDefault();
        showError("Please add a short description before continuing.");
        $("#desc")?.focus();
      } else hideError();
    });
  })();

  // Location page
  (function validateLocationPage(){
    if (!/location\.html/i.test(location.pathname)) return;
    const next = document.querySelector('a.btn.grow[href*="contact"], .rail .btn.grow');
    if (!next) return;
    next.addEventListener("click", (e)=>{
      const coords = $("#coords")?.value.trim();
      if (!coords){
        e.preventDefault();
        showError("Please place the pin (or use your location) so we have coordinates.");
        $("#locateBtn")?.focus();
      } else hideError();
    });
  })();

  // ----------------------------
  // 7) Submit → thank you page
  // ----------------------------
  const submitBtn = $("#submitReport");
  if (submitBtn){
    submitBtn.addEventListener("click", ()=>{
      const name = $("#name")?.value.trim();
      const email = $("#email")?.value.trim();
      const alert = $("#formAlert");
      const errs = [];
      if (!name) errs.push("Please add your name.");
      if (!email) errs.push("Please add your email.");
      if (errs.length){ if (alert) alert.textContent = errs.join(" "); return; }
      const rid = genRID();
      sessionStorage.setItem("fixit_last_rid", rid);
      sessionStorage.setItem("fixit_last_email", email);
      const qs = new URLSearchParams({rid, email}).toString();
      location.href = `thankyou.html?${qs}`;
    });
  }
  function genRID(){
    const ts = new Date().toISOString().replace(/[-:.TZ]/g,"").slice(0,14);
    const rand = Math.random().toString(36).slice(2,6).toUpperCase();
    return `FIX-${ts}-${rand}`;
  }
})();

// ----------------------------
// 8) Photo overlay wiring
// ----------------------------
document.addEventListener("DOMContentLoaded", function(){
  const $ = (s,ctx=document)=>ctx.querySelector(s);

  const overlay = $("#photoOverlay");
  const openBtn = $("#openPhotoOverlay");
  const closeBtn= $("#closePhotoOverlay");

  const camBtn  = $("#pickCamera");
  const galBtn  = $("#pickGallery");
  const camInp  = $("#cameraFile");
  const galInp  = $("#galleryFile");

  const preview = $("#preview");
  const thumb   = $("#thumbWrap");
  const actions = $("#thumbActions");
  const err     = $("#photoError");

  // Open/close overlay
  openBtn?.addEventListener("click", ()=> overlay && (overlay.hidden=false));
  closeBtn?.addEventListener("click", ()=> overlay && (overlay.hidden=true));
  overlay?.addEventListener("click", e=>{ if(e.target===overlay) overlay.hidden=true; });

  // Camera/gallery buttons
  camBtn?.addEventListener("click", ()=> camInp?.click());
  galBtn?.addEventListener("click", ()=> galInp?.click());

  function validate(file){
    if(!file) return {ok:false, msg:"No file selected."};
    if(!["image/jpeg","image/png"].includes(file.type)) return {ok:false, msg:"Please choose a JPEG or PNG image."};
    if(file.size > 5*1024*1024) return {ok:false, msg:"That file is too large (max 5 MB)."};
    return {ok:true};
  }
  function showErr(m){ if(err) err.textContent = m || ""; }

  function handle(file){
    const v = validate(file); if(!v.ok){ showErr(v.msg); return; } showErr("");

    if (preview){
      const img = new Image();
      img.alt = "Selected photo preview";
      img.src = URL.createObjectURL(file);
      preview.innerHTML = "";
      preview.appendChild(img);
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      sessionStorage.setItem("fixit_photo_dataurl", dataUrl);

      if (thumb){
        const t = new Image();
        t.alt = "Attached photo";
        t.src = dataUrl;
        Object.assign(t.style,{maxWidth:"140px",maxHeight:"100px",borderRadius:"8px"});
        thumb.innerHTML = "";
        thumb.appendChild(t);
      }
      if (actions) actions.hidden = false;
    };
    reader.readAsDataURL(file);
  }

  camInp?.addEventListener("change", ()=> handle(camInp.files?.[0]));
  galInp?.addEventListener("change", ()=> handle(galInp.files?.[0]));

  $("#changePhoto")?.addEventListener("click", ()=> overlay && (overlay.hidden=false));
  $("#removePhoto")?.addEventListener("click", ()=>{
    sessionStorage.removeItem("fixit_photo_dataurl");
    if (thumb) thumb.innerHTML = "";
    if (actions) actions.hidden = true;
    if (preview) preview.innerHTML = "";
    if (camInp) camInp.value = "";
    if (galInp) galInp.value = "";
  });

  // Restore saved thumb
  (function restoreThumb(){
    const data = sessionStorage.getItem("fixit_photo_dataurl");
    if (data && thumb){
      const t = new Image();
      t.alt = "Attached photo";
      t.src = data;
      Object.assign(t.style,{maxWidth:"140px",maxHeight:"100px",borderRadius:"8px"});
      thumb.innerHTML = "";
      thumb.appendChild(t);
      if (actions) actions.hidden = false;
    }
  })();
});
