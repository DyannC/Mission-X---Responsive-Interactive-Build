(function(){
  const $  = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));

  // ----------------------------
  // 0) Small helpers
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
    b.textContent = msg || "Please fix the highlighted fields.";
    b.hidden = false;
    b.scrollIntoView({behavior:"smooth", block:"start"});
  }
  function hideError(){
    const b = document.getElementById("pageError");
    if (b){ b.hidden = true; b.textContent = ""; }
  }





  // ----------------------------
  // 2) Description character counter
  // ----------------------------
  const desc = $("#desc");
  const cnt  = $("#desc-count");
  if (desc && cnt){
    const max = +(desc.getAttribute("maxlength") || 240);
    const update = ()=>{
      cnt.textContent = `${max - (desc.value || "").length} characters left`;
      saveDraft();
    };
    ["input","change"].forEach(ev=>desc.addEventListener(ev, update));
    update();
  }

  // ----------------------------
  // 3) Draft save / restore (issue, desc, contact)
  // ----------------------------
  const DRAFT_KEY = "fixit_draft";
  function saveDraft(){
    const data = {
      issueType: localStorage.getItem("fixit_issue_type") || "",
      description: $("#desc")?.value || "",
      name: $("#name")?.value || "",
      email: $("#email")?.value || ""
    };
    try{ localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); }catch{}
  }
  (function restore(){
    try{
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); if (!d) return;
      if ($("#desc") && d.description) $("#desc").value = d.description;
      if ($("#name") && d.name)       $("#name").value = d.name;
      if ($("#email") && d.email)     $("#email").value = d.email;
      if (cnt && $("#desc")){
        const max = +($("#desc").getAttribute("maxlength") || 240);
        cnt.textContent = `${max - ($("#desc").value || "").length} characters left`;
      }
    }catch{}
  })();
  $$("input,textarea").forEach(el => el.addEventListener("input", saveDraft));

  // ----------------------------
  // 4) Page-level validation
  // ----------------------------

  // 4a) IssueType page – block Next until a tile is chosen
  (function validateIssueTypePage(){
    if (!/issuetype\.html/i.test(location.pathname)) return;

    // Find the Next control (covers anchor or button in the right rail)
    const next = document.querySelector(
      '.rail a.btn.grow[href], .rail button.btn.grow, a.btn.grow[href*="details"]'
    );
    if (!next) return;

    const guard = (e)=>{
      const chosen = localStorage.getItem("fixit_issue_type");
      if (!chosen){
        e.preventDefault();
        e.stopImmediatePropagation();
        showError("Please choose an issue type before continuing.");
        return false;
      }
      hideError();
      return true;
    };

    // Intercept both clicks and form submits (if Next is inside a form)
    next.addEventListener("click", guard, true);                      // capture phase wins
    const form = next.closest("form");
    if (form){ form.addEventListener("submit", (e)=>{ if(!guard(e)) e.preventDefault(); }, true); }
  })();

  // 4b) Details page – require a description
  (function validateDetailsPage(){
    if (!/details\.html/i.test(location.pathname)) return;
    const next = document.querySelector('.rail a.btn.grow[href], .rail button.btn.grow');
    if (!next) return;

    const guard = (e)=>{
      const text = $("#desc")?.value?.trim();
      if (!text){
        e.preventDefault();
        e.stopImmediatePropagation();
        showError("Please add a short description before continuing.");
        $("#desc")?.focus();
        return false;
      }
      hideError();
      return true;
    };

    next.addEventListener("click", guard, true);
    const form = next.closest("form");
    if (form){ form.addEventListener("submit", (e)=>{ if(!guard(e)) e.preventDefault(); }, true); }
  })();

  // 4c) Location page – require coordinates (pin or geolocation)
  (function validateLocationPage(){
    if (!/location\.html/i.test(location.pathname)) return;
    const next = document.querySelector('a.btn.grow[href*="contact"], .rail .btn.grow');
    if (!next) return;

    const guard = (e)=>{
      const coords = $("#coords")?.value?.trim();  // assumes you mirror marker to #coords
      if (!coords){
        e.preventDefault();
        e.stopImmediatePropagation();
        showError("Please place the pin (or use your location) so we have coordinates.");
        $("#locateBtn")?.focus();
        return false;
      }
      hideError();
      return true;
    };

    next.addEventListener("click", guard, true);
    const form = next.closest("form");
    if (form){ form.addEventListener("submit", (e)=>{ if(!guard(e)) e.preventDefault(); }, true); }
  })();
})();

// ----------------------------
// 5) Photo overlay (details page)
// ----------------------------
document.addEventListener("DOMContentLoaded", function(){
  const $ = (s,ctx=document)=>ctx.querySelector(s);

  // Only run if overlay exists on this page
  const overlay = $("#photoOverlay");
  if (!overlay) return;

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
  openBtn?.addEventListener("click", ()=> overlay.hidden = false);
  closeBtn?.addEventListener("click", ()=> overlay.hidden = true);
  overlay.addEventListener("click", (e)=>{ if(e.target === overlay) overlay.hidden = true; });

  // Camera/gallery → file inputs
  camBtn?.addEventListener("click", ()=> camInp?.click());
  galBtn?.addEventListener("click", ()=> galInp?.click());

  function showErr(m){ if(err) err.textContent = m || ""; }
  function validate(file){
    if(!file) return {ok:false, msg:"No file selected."};
    if(!["image/jpeg","image/png"].includes(file.type)) return {ok:false, msg:"Please choose a JPEG or PNG image."};
    if(file.size > 5*1024*1024) return {ok:false, msg:"That file is too large (max 5 MB)."};
    return {ok:true};
  }

  function handle(file){
    const v = validate(file);
    if(!v.ok){ showErr(v.msg); return; }
    showErr("");

    // Live preview in the modal
    if (preview){
      const img = new Image();
      img.alt = "Selected photo preview";
      img.src = URL.createObjectURL(file);
      preview.innerHTML = "";
      preview.appendChild(img);
    }

    // Persist as DataURL + show thumbnail under Add photo (on page)
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

  // Change/Remove under the thumbnail
  $("#changePhoto")?.addEventListener("click", ()=> overlay.hidden = false);
  $("#removePhoto")?.addEventListener("click", ()=>{
    sessionStorage.removeItem("fixit_photo_dataurl");
    if (thumb)   thumb.innerHTML = "";
    if (actions) actions.hidden = true;
    if (preview) preview.innerHTML = "";
    if (camInp)  camInp.value = "";
    if (galInp)  galInp.value = "";
  });

  // Restore saved thumb on load
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