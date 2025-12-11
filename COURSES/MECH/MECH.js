/* course.js
   مدیریت سلکتورها، تولید کارت‌ها و جستجو
*/

document.addEventListener("DOMContentLoaded", () => {

  /* ----- نمونهٔ داده‌ها (قابل توسعه) ----- 
     ساختار: برای هر درس در هر ترم لیستی از مدرس + لینک جزوه داریم
     تو می‌توانی این آرایه را از سرور بگیری یا تغییرش بدهی.
  */
  const data = {
    // key: term number as string -> lessons object
    "1": {
      "درس1": [
        { teacher: "استاد احمدی", url: "#" },
        { teacher: "استاد موسوی", url: "#" }
      ],
      "درس2": [
        { teacher: "استاد رضایی", url: "#" }
      ],
      "درس3": [
        { teacher: "استاد صادقی", url: "#" }
      ]
    },
    "2": {
      "درس1": [
        { teacher: "استاد کریمی", url: "#" },
        { teacher: "استاد مهاجر", url: "#" }
      ],
      "درس2": [
        { teacher: "استاد حیدری", url: "#" }
      ],
      "درس3": [
        { teacher: "استاد فراهانی", url: "#" }
      ]
    },
    // برای ترم‌های بعد نمونه مشابه
    "3": {"درس1":[{teacher:"استاد x", url:"#"}],"درس2":[{teacher:"استاد y", url:"#"}],"درس3":[{teacher:"استاد z", url:"#"}]},
    "4": {"درس1":[{teacher:"استاد a", url:"#"}],"درس2":[{teacher:"استاد b", url:"#"}],"درس3":[{teacher:"استاد c", url:"#"}]},
    "5": {"درس1":[{teacher:"استاد d", url:"#"}],"درس2":[{teacher:"استاد e", url:"#"}],"درس3":[{teacher:"استاد f", url:"#"}]},
    "6": {"درس1":[{teacher:"استاد g", url:"#"}],"درس2":[{teacher:"استاد h", url:"#"}],"درس3":[{teacher:"استاد i", url:"#"}]},
    "7": {"درس1":[{teacher:"استاد j", url:"#"}],"درس2":[{teacher:"استاد k", url:"#"}],"درس3":[{teacher:"استاد l", url:"#"}]},
    "8": {"درس1":[{teacher:"استاد m", url:"#"}],"درس2":[{teacher:"استاد n", url:"#"}],"درس3":[{teacher:"استاد o", url:"#"}]}
  };

  /* المان‌ها */
  const termSelect = document.getElementById("termSelect");
  const lessonSelect = document.getElementById("lessonSelect");
  const cardsContainer = document.getElementById("cardsContainer");

  const searchInput = document.getElementById("pageSearch");
  const resultsBox = document.getElementById("searchResults");

  /* ساختار دادهٔ قابل جستجو (به‌صورت فلت) */
  function buildSearchIndex() {
    const items = [];

    // ترم‌ها
    Object.keys(data).forEach(term => {
      items.push({
        type: "term",
        label: `ترم ${term}`,
        value: term
      });

      // دروس هر ترم
      Object.keys(data[term]).forEach(lesson => {
        items.push({
          type: "lesson",
          label: lesson,
          term: term,
          value: lesson
        });

        // مدرس‌ها برای آن درس
        data[term][lesson].forEach(entry => {
          items.push({
            type: "teacher",
            label: entry.teacher,
            term: term,
            lesson: lesson,
            url: entry.url,
            value: entry.teacher
          });
        });
      });
    });

    return items;
  }

  let searchIndex = buildSearchIndex();

  /* ---------- منطقی که سلکتور درس فعال شود ---------- */
  termSelect.addEventListener("change", () => {
    const t = termSelect.value;
    if (t) {
      lessonSelect.disabled = false;
      // در صورت نیاز میتوان در اینجا مقدارهای درس را بر اساس ترم پر کرد
      // در این مثال درسها ثابت (درس1..3) هستند، ولی اگر خواستی می‌توان آنها را از `data[t]` پر کرد.
      // انتخاب خودکار به حالت پیش‌فرض برگردد
      lessonSelect.value = "";
      clearCards();
    } else {
      lessonSelect.disabled = true;
      lessonSelect.value = "";
      clearCards();
    }
  });

  /* ---------- وقتی درس انتخاب شد کارت‌ها تولید شوند ---------- */
  lessonSelect.addEventListener("change", () => {
    const term = termSelect.value;
    const lesson = lessonSelect.value;
    if (term && lesson) {
      renderCardsFor(term, lesson);
    } else {
      clearCards();
    }
  });

  function clearCards(){
    cardsContainer.innerHTML = `<div class="helper">لطفاً ابتدا ترم و درس را انتخاب کنید.</div>`;
  }

  /* ---------- نمایش کارت‌ها ---------- */
  function renderCardsFor(term, lesson){
    cardsContainer.innerHTML = "";
    const entries = (data[term] && data[term][lesson]) ? data[term][lesson] : [];

    if (entries.length === 0){
      cardsContainer.innerHTML = `<div class="helper">هیچ محتوایی برای این ترکیب یافت نشد.</div>`;
      return;
    }

    entries.forEach((e, idx) => {
      const card = document.createElement("article");
      card.className = "card";
      card.dataset.teacher = e.teacher;
      card.innerHTML = `
        <div class="teacher">${e.teacher}</div>
        <div class="meta">درس: ${lesson} — ترم ${term}</div>
        <div class="actions">
          <a href="${e.url}" class="download" role="link" aria-label="دانلود جزوه ${e.teacher}">دانلود جزوه</a>
          <a class="download secondary" href="#">نمایش جزئیات</a>
        </div>
      `;
      cardsContainer.appendChild(card);
    });

    // scroll to results
    cardsContainer.scrollIntoView({behavior:"smooth", block:"start"});
  }

  /* بار اولیه */
  clearCards();

  /* ------------------ جستجو (debounce + فیلتر) ------------------ */
  let debounceTimer = null;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    const q = searchInput.value.trim();
    if (q.length === 0) {
      resultsBox.hidden = true;
      resultsBox.innerHTML = "";
      return;
    }
    debounceTimer = setTimeout(() => performSearch(q), 180);
  });

  function performSearch(q){
    const ql = q.toLowerCase();
    const results = searchIndex.filter(item => item.label.toLowerCase().includes(ql));

    renderSearchResults(results.slice(0, 12));
  }

  function renderSearchResults(items){
    resultsBox.innerHTML = "";
    if (!items || items.length === 0){
      resultsBox.innerHTML = `<div class="search-item noresult" role="option">نتیجه‌ای یافت نشد</div>`;
      resultsBox.hidden = false;
      return;
    }

    items.forEach(it => {
      const row = document.createElement("div");
      row.className = "search-item";
      row.setAttribute("role","option");
      row.innerHTML = `<strong>${it.label}</strong> <small>${it.type}</small>`;

      row.addEventListener("click", () => {
        // رفتار کلیک بر اساس نوع
        if (it.type === "term") {
          termSelect.value = it.value;
          termSelect.dispatchEvent(new Event('change'));
          // fokus روی lesson select
          lessonSelect.focus();
        } else if (it.type === "lesson") {
          // اگر ترم متفاوت است، ستش کن
          if (termSelect.value !== it.term) {
            termSelect.value = it.term;
            termSelect.dispatchEvent(new Event('change'));
          }
          lessonSelect.value = it.value;
          lessonSelect.dispatchEvent(new Event('change'));
        } else if (it.type === "teacher") {
          // تلاش برای نمایش کارت استاد: اگر هنوز کارت‌ها تولید نشده باشند، تولید کن
          if (!termSelect.value || !lessonSelect.value) {
            // اگر ترم/درس مشخص نیست، از خود دیتا، ترم و درس مربوطه را تنظیم کن
            termSelect.value = it.term;
            termSelect.dispatchEvent(new Event('change'));
            lessonSelect.value = it.lesson;
            lessonSelect.dispatchEvent(new Event('change'));
            // سپس هایلایت
            setTimeout(() => highlightTeacher(it.teacher), 260);
          } else {
            // کارت‌ها ممکن است وجود داشته باشد: اگر کارت‌ها هنوز تولید نشده‌اند، تولید کن
            if (!cardsContainer.querySelector(`[data-teacher="${it.teacher}"]`)) {
              // سعی کن درس را روی مربوطه قرار دهی
              termSelect.value = it.term;
              termSelect.dispatchEvent(new Event('change'));
              lessonSelect.value = it.lesson;
              lessonSelect.dispatchEvent(new Event('change'));
              setTimeout(()=> highlightTeacher(it.teacher), 260);
            } else {
              highlightTeacher(it.teacher);
            }
          }
        }

        // بستن نتایج جستجو و پاکسازی focus
        resultsBox.hidden = true;
      });

      resultsBox.appendChild(row);
    });

    resultsBox.hidden = false;
  }

  function highlightTeacher(name){
    // پاک کردن هایلایت قبلی
    document.querySelectorAll(".card").forEach(c => c.classList.remove("highlight"));
    const el = document.querySelector(`.card[data-teacher="${name}"]`);
    if (el) {
      el.classList.add("highlight");
      el.scrollIntoView({behavior:"smooth", block:"center"});
      // remove highlight after a while
      setTimeout(()=> el.classList.remove("highlight"), 2500);
    } else {
      // اگر یافت نشد، اعلام کن
      alert("کارت‌ معلم مورد نظر یافت نشد.");
    }
  }

  /* کلیک خارج از باکس جستجو نتایج را ببندد */
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap")) {
      resultsBox.hidden = true;
    }
  });

  /* دسترسی کیبورد: انتخاب نتایج با Enter در input */
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // اگر فقط یک نتیجه موجود است، روی آن کلیک کن
      const first = resultsBox.querySelector(".search-item");
      if (first) first.click();
    }
  });

});
