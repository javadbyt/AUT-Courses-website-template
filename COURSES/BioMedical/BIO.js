document.addEventListener("DOMContentLoaded", () => {
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
    "3": {"درس1":[{teacher:"استاد x", url:"#"}],"درس2":[{teacher:"استاد y", url:"#"}],"درس3":[{teacher:"استاد z", url:"#"}]},
    "4": {"درس1":[{teacher:"استاد a", url:"#"}],"درس2":[{teacher:"استاد b", url:"#"}],"درس3":[{teacher:"استاد c", url:"#"}]},
    "5": {"درس1":[{teacher:"استاد d", url:"#"}],"درس2":[{teacher:"استاد e", url:"#"}],"درس3":[{teacher:"استاد f", url:"#"}]},
    "6": {"درس1":[{teacher:"استاد g", url:"#"}],"درس2":[{teacher:"استاد h", url:"#"}],"درس3":[{teacher:"استاد i", url:"#"}]},
    "7": {"درس1":[{teacher:"استاد j", url:"#"}],"درس2":[{teacher:"استاد k", url:"#"}],"درس3":[{teacher:"استاد l", url:"#"}]},
    "8": {"درس1":[{teacher:"استاد m", url:"#"}],"درس2":[{teacher:"استاد n", url:"#"}],"درس3":[{teacher:"استاد o", url:"#"}]}
  };

  /* elements */
  const termSelect = document.getElementById("termSelect");
  const lessonSelect = document.getElementById("lessonSelect");
  const cardsContainer = document.getElementById("cardsContainer");

  const searchInput = document.getElementById("pageSearch");
  const resultsBox = document.getElementById("searchResults");

  function buildSearchIndex() {
    const items = [];

    // terms
    Object.keys(data).forEach(term => {
      items.push({
        type: "term",
        label: `ترم ${term}`,
        value: term
      });

      //lessons
      Object.keys(data[term]).forEach(lesson => {
        items.push({
          type: "lesson",
          label: lesson,
          term: term,
          value: lesson
        });

        // teachers
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

  termSelect.addEventListener("change", () => {
    const t = termSelect.value;
    if (t) {
      lessonSelect.disabled = false;
      lessonSelect.value = "";
      clearCards();
    } else {
      lessonSelect.disabled = true;
      lessonSelect.value = "";
      clearCards();
    }
  });

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

    cardsContainer.scrollIntoView({behavior:"smooth", block:"start"});
  }

  clearCards();

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
        if (it.type === "term") {
          termSelect.value = it.value;
          termSelect.dispatchEvent(new Event('change'));
          lessonSelect.focus();
        } else if (it.type === "lesson") {
          if (termSelect.value !== it.term) {
            termSelect.value = it.term;
            termSelect.dispatchEvent(new Event('change'));
          }
          lessonSelect.value = it.value;
          lessonSelect.dispatchEvent(new Event('change'));
        } else if (it.type === "teacher") {
          if (!termSelect.value || !lessonSelect.value) {
            termSelect.value = it.term;
            termSelect.dispatchEvent(new Event('change'));
            lessonSelect.value = it.lesson;
            lessonSelect.dispatchEvent(new Event('change'));
            setTimeout(() => highlightTeacher(it.teacher), 260);
          } else {
            if (!cardsContainer.querySelector(`[data-teacher="${it.teacher}"]`)) {
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

        resultsBox.hidden = true;
      });

      resultsBox.appendChild(row);
    });

    resultsBox.hidden = false;
  }

  function highlightTeacher(name){
    document.querySelectorAll(".card").forEach(c => c.classList.remove("highlight"));
    const el = document.querySelector(`.card[data-teacher="${name}"]`);
    if (el) {
      el.classList.add("highlight");
      el.scrollIntoView({behavior:"smooth", block:"center"});
      setTimeout(()=> el.classList.remove("highlight"), 2500);
    } else {
      alert("کارت‌ معلم مورد نظر یافت نشد.");
    }
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrap")) {
      resultsBox.hidden = true;
    }
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const first = resultsBox.querySelector(".search-item");
      if (first) first.click();
    }
  });

});
