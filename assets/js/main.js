import { roadmapData } from "./data.js";

const state = {
    category: "All",
    status: "All",
    search: "",
    sort: "asc",
    page: 1,
    perPage: 6,
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const grid = $("#lessonGrid");
const emptyState = $("#emptyState");
const pagination = $("#pagination");
const searchInput = $("#searchInput");
const sortSelect = $("#sortSelect");
const filterPanel = $("#filterPanel");
const filterToggle = $("#filterToggle");

const publishedLessons = roadmapData.filter(
    (lesson) => lesson.status === "published",
);
const categories = [
    "All",
    ...new Set(roadmapData.map((lesson) => lesson.category)),
];
const statuses = ["All", "published", "in-progress", "planned"];

const pad = (value) => String(value).padStart(2, "0");
const escapeHTML = (value) =>
    String(value ?? "").replace(
        /[&<>"']/g,
        (char) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
            })[char],
    );

function categoryIcon(category) {
    return { HTML: "&lt;/&gt;", CSS: "✳", JavaScript: "JS" }[category] || "⌘";
}

function getFilteredLessons() {
    const query = state.search.trim().toLowerCase();
    return publishedLessons
        .filter(
            (lesson) =>
                state.category === "All" || lesson.category === state.category,
        )
        .filter(
            (lesson) =>
                state.status === "All" || lesson.status === state.status,
        )
        .filter((lesson) => {
            const searchable = [
                lesson.number,
                lesson.title,
                lesson.description,
                lesson.category,
                lesson.topic,
                lesson.difficulty,
                ...(lesson.tags || []),
            ]
                .join(" ")
                .toLowerCase();
            return searchable.includes(query);
        })
        .sort((a, b) => {
            if (state.sort === "desc") return b.id - a.id;
            if (state.sort === "az") return a.title.localeCompare(b.title);
            return a.id - b.id;
        });
}

function lessonCard(lesson, index) {
    const number = escapeHTML(lesson.number);
    const category = escapeHTML(lesson.category);
    const title = escapeHTML(lesson.title);
    const description = escapeHTML(lesson.description);
    const tags = (lesson.tags || [])
        .slice(0, 3)
        .map((tag) => `<span class="lesson-tag">${escapeHTML(tag)}</span>`)
        .join("");
    const preview = lesson.preview
        ? `<img class="preview-image" src="${escapeHTML(lesson.preview)}" alt="" loading="lazy">`
        : `<div class="preview-art preview-${category.toLowerCase()}">
        <span class="preview-watermark">${categoryIcon(lesson.category)}</span>
        <span class="preview-kicker">LESSON / ${number}</span>
        <span class="preview-code">${lesson.category === "HTML" ? "&lt;h1&gt;" : lesson.category === "CSS" ? "{ style }" : "const skill"}</span>
        <span class="preview-title">${title.replace(/&amp;/g, "&")}</span>
        <span class="preview-caption">FOUNDATIONS <i>↗</i></span>
      </div>`;
    return `
    <article class="lesson-card" style="--card-index:${index}">
      <div class="lesson-preview">${preview}<span class="lesson-number">${number}</span></div>
      <div class="lesson-card-content">
        <div class="lesson-card-meta"><span class="category-pill category-${category.toLowerCase()}">${categoryIcon(lesson.category)} <span>${category}</span></span><span class="difficulty">${escapeHTML(lesson.difficulty)}</span></div>
        <h3>${title}</h3>
        <p class="lesson-description">${description}</p>
        <div class="lesson-tags">${tags}</div>
        <div class="lesson-card-footer">
          <a class="resource-link resource-learn" href="${escapeHTML(lesson.learningDemo || lesson.learningUrl)}" target="_blank" rel="noopener noreferrer"><span class="resource-icon">↗</span><span>Open lesson</span></a>
          <a class="resource-link resource-test" href="${escapeHTML(lesson.testDemo || lesson.testUrl)}" target="_blank" rel="noopener noreferrer"><span class="resource-icon">✓</span><span>Skill check</span></a>
        </div>
      </div>
    </article>`;
}

function renderCategoryTabs() {
    const counts = Object.fromEntries(
        categories.map((category) => [
            category,
            publishedLessons.filter(
                (lesson) => category === "All" || lesson.category === category,
            ).length,
        ]),
    );
    $$("#categoryTabs [data-category]").forEach((tab) => {
        const category = tab.dataset.category;
        tab.classList.toggle("active", state.category === category);
        tab.setAttribute("aria-selected", String(state.category === category));
        const count = tab.querySelector("span");
        if (count)
            count.textContent = counts[category] ? pad(counts[category]) : "—";
    });
    $("#allCount").textContent = pad(publishedLessons.length);
}

function renderFilterChips() {
    $("#categoryFilters").innerHTML = categories
        .map(
            (category) => `
    <button class="filter-chip ${state.category === category ? "selected" : ""}" data-filter-category="${escapeHTML(category)}">${escapeHTML(category)}</button>
  `,
        )
        .join("");
    $("#statusFilters").innerHTML = statuses
        .map(
            (status) => `
    <button class="filter-chip ${state.status === status ? "selected" : ""}" data-filter-status="${escapeHTML(status)}">${status === "All" ? "All statuses" : status.replace("-", " ")}</button>
  `,
        )
        .join("");
    const count =
        Number(state.category !== "All") + Number(state.status !== "All");
    $("#filterCount").textContent = count;
    filterToggle.classList.toggle("has-filters", count > 0);
}

function renderPagination(total) {
    const pages = Math.max(1, Math.ceil(total / state.perPage));
    state.page = Math.min(state.page, pages);
    if (total <= state.perPage) {
        pagination.innerHTML = `<span class="pagination-summary">${total ? `Showing ${total} ${total === 1 ? "lesson" : "lessons"}` : "No results to show"}</span>`;
        return;
    }
    const pageButtons = Array.from({ length: pages }, (_, i) => {
        const page = i + 1;
        return `<button class="page-number ${page === state.page ? "active" : ""}" data-page="${page}" aria-label="Page ${page}" ${page === state.page ? 'aria-current="page"' : ""}>${pad(page)}</button>`;
    }).join("");
    pagination.innerHTML = `
    <span class="pagination-summary">Showing <strong>${(state.page - 1) * state.perPage + 1}–${Math.min(state.page * state.perPage, total)}</strong> of <strong>${total}</strong></span>
    <div class="pagination-controls"><button class="page-arrow" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""} aria-label="Previous page">←</button>${pageButtons}<button class="page-arrow" data-page="${state.page + 1}" ${state.page === pages ? "disabled" : ""} aria-label="Next page">→</button></div>`;
}

function render() {
    const lessons = getFilteredLessons();
    const pages = Math.max(1, Math.ceil(lessons.length / state.perPage));
    if (state.page > pages) state.page = 1;
    const start = (state.page - 1) * state.perPage;
    const pageLessons = lessons.slice(start, start + state.perPage);

    grid.innerHTML = pageLessons.map(lessonCard).join("");
    grid.hidden = pageLessons.length === 0;
    emptyState.hidden = pageLessons.length !== 0;

    const total = lessons.length;
    $("#resultsLabel").textContent = total
        ? `Showing ${start + 1}–${Math.min(start + state.perPage, total)} of ${total} ${total === 1 ? "lesson" : "lessons"}`
        : "No matching lessons";
    $("#lessonTotal").textContent = pad(publishedLessons.length);
    renderCategoryTabs();
    renderFilterChips();
    renderPagination(total);
}

$("#categoryTabs").addEventListener("click", (event) => {
    const tab = event.target.closest("[data-category]");
    if (!tab) return;
    state.category = tab.dataset.category;
    state.page = 1;
    render();
});

document.addEventListener("click", (event) => {
    const categoryButton = event.target.closest("[data-filter-category]");
    const statusButton = event.target.closest("[data-filter-status]");
    const pageButton = event.target.closest("[data-page]");
    const sidebarCategory = event.target.closest("[data-category-link]");

    if (categoryButton) {
        state.category = categoryButton.dataset.filterCategory;
        state.page = 1;
        render();
    }
    if (statusButton) {
        state.status = statusButton.dataset.filterStatus;
        state.page = 1;
        render();
    }
    if (pageButton && !pageButton.disabled) {
        state.page = Number(pageButton.dataset.page);
        render();
        $("#roadmap").scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (sidebarCategory) {
        state.category = sidebarCategory.dataset.categoryLink;
        state.page = 1;
        render();
    }
});

searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    state.page = 1;
    render();
});
sortSelect.addEventListener("change", (event) => {
    state.sort = event.target.value;
    state.page = 1;
    render();
});
filterToggle.addEventListener("click", () => {
    const opening = filterPanel.hidden;
    filterPanel.hidden = !opening;
    filterToggle.setAttribute("aria-expanded", String(opening));
});
$("#clearFilters").addEventListener("click", resetFilters);
$("#emptyReset").addEventListener("click", resetFilters);

function resetFilters() {
    state.category = "All";
    state.status = "All";
    state.search = "";
    state.page = 1;
    searchInput.value = "";
    render();
}

document.addEventListener("keydown", (event) => {
    if (
        event.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
            document.activeElement.tagName,
        )
    ) {
        event.preventDefault();
        searchInput.focus();
    }
    if (event.key === "Escape") {
        searchInput.blur();
        closeMobileMenu();
    }
});

const sidebar = $("#sidebar");
const mobileMenu = $("#mobileMenu");
const mobileOverlay = $("#mobileOverlay");

function openMobileMenu() {
    sidebar.classList.add("is-open");
    mobileOverlay.classList.add("is-visible");
    mobileMenu.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
}
function closeMobileMenu() {
    sidebar.classList.remove("is-open");
    mobileOverlay.classList.remove("is-visible");
    mobileMenu.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
}
mobileMenu.addEventListener("click", () => {
    sidebar.classList.contains("is-open")
        ? closeMobileMenu()
        : openMobileMenu();
});
mobileOverlay.addEventListener("click", closeMobileMenu);
$$(".side-nav a").forEach((link) =>
    link.addEventListener("click", closeMobileMenu),
);

const sections = $$("main section[id], main#top");
const navLinks = $$(".side-nav a");
if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navLinks.forEach((link) => {
                    const href = link.getAttribute("href");
                    link.classList.toggle(
                        "active",
                        href === `#${entry.target.id}`,
                    );
                });
            });
        },
        { rootMargin: "-35% 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
}

$("#year").textContent = new Date().getFullYear();
render();
