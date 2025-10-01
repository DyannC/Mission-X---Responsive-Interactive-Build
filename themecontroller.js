<script defer>
(function () {
  function ready(fn){ document.readyState==="loading" ? document.addEventListener("DOMContentLoaded",fn) : fn(); }

  ready(function () {
    var STORAGE_KEY = "fixit_theme";  // "day" | "night"
    var body = document.body;
    var toggle = document.getElementById("cb1");
    var dayIcon = document.getElementById("dayIcon");
    var nightIcon = document.getElementById("nightIcon");

    function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
    function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }

    function apply(mode){
      mode = (mode==="night") ? "night" : "day";
      body.classList.remove("day-background","night-background");
      body.classList.add(mode==="night" ? "night-background" : "day-background");
      document.documentElement.setAttribute("data-theme", mode);
      if (toggle){ toggle.checked = (mode==="night"); toggle.setAttribute("aria-checked", String(toggle.checked)); }
      lsSet(STORAGE_KEY, mode);
    }

    // Initial pick: stored → system preference → day
    (function init(){
      var saved = lsGet(STORAGE_KEY);
      if (!saved){
        var prefersDark = false;
        try { prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches; } catch(e){}
        saved = prefersDark ? "night" : "day";
      }
      apply(saved);
    })();

    // Wire controls (guards if elements are missing)
    if (toggle){ toggle.addEventListener("change", function(){ apply(toggle.checked ? "night" : "day"); }); }
    if (dayIcon){ dayIcon.addEventListener("click", function(){ apply("day"); }); }
    if (nightIcon){ nightIcon.addEventListener("click", function(){ apply("night"); }); }

    // Optional: react to system changes only if the user hasn’t chosen
    if (window.matchMedia){
      try{
        var mm = window.matchMedia("(prefers-color-scheme: dark)");
        var onChange = function(){
          if (!lsGet(STORAGE_KEY)){ apply(mm.matches ? "night":"day"); }
        };
        if (mm.addEventListener) mm.addEventListener("change", onChange);
        else if (mm.addListener) mm.addListener(onChange);
      }catch(e){}
    }
  });
})();
</script>
