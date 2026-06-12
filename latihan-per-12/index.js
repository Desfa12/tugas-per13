const REFRESH_INTERVAL = 30000;

const state = {
  activeTheme: "weather",
  timer: null,
  isLoading: false,
  charts: {
    main: null,
    side: null,
  },
  coords: {
    city: "Bogor",
    lat: -6.595,
    lon: 106.816666,
  },
  lastCityQuery: "Bogor",
  lastPayload: {},
};

const els = {
  menuLinks: [...document.querySelectorAll("[data-theme-key]")],
  sidebarSearch: document.querySelector("#sidebarSearch"),
  menuSearchEmpty: document.querySelector("#menuSearchEmpty"),
  sidebarToggle: document.querySelector("#sidebarToggle"),
  form: document.querySelector("#controlForm"),
  dynamicControls: document.querySelector("#dynamicControls"),
  interval: document.querySelector("#refreshInterval"),
  refreshBtn: document.querySelector("#refreshBtn"),
  submitBtn: document.querySelector("#submitBtn"),
  geoBtn: document.querySelector("#geoBtn"),
  statusBadge: document.querySelector("#statusBadge"),
  alertBox: document.querySelector("#alertBox"),
  logList: document.querySelector("#logList"),
  table: document.querySelector("#dataTable"),
  jsonPreview: document.querySelector("#jsonPreview"),
  topLastUpdated: document.querySelector("#topLastUpdated"),
  lastUpdated: document.querySelector("#lastUpdated"),
  pageTitle: document.querySelector("#pageTitle"),
  pageSubtitle: document.querySelector("#pageSubtitle"),
  breadcrumbTitle: document.querySelector("#breadcrumbTitle"),
  controlTitle: document.querySelector("#controlTitle"),
  controlSubtitle: document.querySelector("#controlSubtitle"),
  detailTitle: document.querySelector("#detailTitle"),
  detailSubtitle: document.querySelector("#detailSubtitle"),
  mainChartTitle: document.querySelector("#mainChartTitle"),
  mainChartBadge: document.querySelector("#mainChartBadge"),
  sideChartTitle: document.querySelector("#sideChartTitle"),
  sideChartSubtitle: document.querySelector("#sideChartSubtitle"),
  summaryList: document.querySelector("#summaryList"),
  mainChart: document.querySelector("#mainChart"),
  sideChart: document.querySelector("#sideChart"),
};

const metricEls = [1, 2, 3, 4].map((number) => ({
  value: document.querySelector(`#metric${number}Value`),
  label: document.querySelector(`#metric${number}Label`),
  meta: document.querySelector(`#metric${number}Meta`),
  icon: document.querySelector(`#metric${number}Icon`),
}));

const cities = [
  "Bogor", "Banda Aceh", "Medan", "Padang", "Pekanbaru", "Tanjung Pinang",
  "Jambi", "Bengkulu", "Palembang", "Pangkal Pinang", "Bandar Lampung",
  "Serang", "Jakarta", "Bandung", "Semarang", "Yogyakarta", "Surabaya",
  "Denpasar", "Mataram", "Kupang", "Pontianak", "Palangka Raya", "Banjarmasin",
  "Samarinda", "Tanjung Selor", "Manado", "Gorontalo", "Palu", "Mamuju",
  "Makassar", "Kendari", "Ambon", "Ternate", "Manokwari", "Sorong",
  "Jayapura", "Nabire", "Wamena", "Merauke",
];

const controls = {
  weather: () => `
    <label class="form-control">
      <span class="label-text">Kota</span>
      <div class="join w-full">
        <input id="cityInput" class="input input-bordered join-item w-full" type="text" value="${state.lastCityQuery}" minlength="2" maxlength="60" autocomplete="off" required />
        <button class="btn join-item btn-info text-white" type="button" id="useBogorBtn" title="Bogor">
          <i class="fa-solid fa-location-dot"></i>
        </button>
      </div>
      <span id="cityError" class="field-error hidden"></span>
    </label>
    <label class="form-control">
      <span class="label-text">Pilih kota Indonesia</span>
      <select id="citySelect" class="select select-bordered">
        <option value="">Cari manual</option>
        ${cities.map((city) => `<option value="${city}" ${city === state.lastCityQuery ? "selected" : ""}>${city}</option>`).join("")}
      </select>
    </label>
  `,
  currency: () => `
    <label class="form-control">
      <span class="label-text">Mata uang dasar</span>
      <select id="baseCurrency" class="select select-bordered">
        ${["USD", "EUR", "JPY", "SGD", "MYR", "AUD"].map((code) => `<option value="${code}" ${code === "USD" ? "selected" : ""}>${code}</option>`).join("")}
      </select>
    </label>
  `,
  population: () => `
    <label class="form-control">
      <span class="label-text">Negara</span>
      <select id="populationCountry" class="select select-bordered">
        <option value="IDN" selected>Indonesia</option>
        <option value="MYS">Malaysia</option>
        <option value="SGP">Singapura</option>
        <option value="THA">Thailand</option>
        <option value="PHL">Filipina</option>
      </select>
    </label>
  `,
  covid: () => `
    <label class="form-control">
      <span class="label-text">Negara</span>
      <select id="covidCountry" class="select select-bordered">
        <option value="Indonesia" selected>Indonesia</option>
        <option value="Malaysia">Malaysia</option>
        <option value="Singapore">Singapura</option>
        <option value="Thailand">Thailand</option>
        <option value="Philippines">Filipina</option>
      </select>
    </label>
  `,
  sales: () => `
    <label class="form-control">
      <span class="label-text">Kategori produk</span>
      <select id="salesCategory" class="select select-bordered">
        <option value="smartphones" selected>Smartphones</option>
        <option value="laptops">Laptops</option>
        <option value="fragrances">Fragrances</option>
        <option value="skincare">Skincare</option>
        <option value="groceries">Groceries</option>
      </select>
    </label>
  `,
};

const themes = {
  weather: {
    title: "Dashboard Cuaca",
    subtitle: "Monitoring suhu, kelembaban, angin, dan kondisi cuaca real-time.",
    controlTitle: "Kontrol Cuaca",
    controlSubtitle: "Cari kota sesuai tulisan atau pilih kota Indonesia. Auto refresh 30 detik.",
    detailTitle: "Detail Data Cuaca",
    detailSubtitle: "Sumber Open-Meteo REST API, diproses dari JSON.",
    mainChartTitle: "Grafik Suhu dan Kelembaban",
    sideChartTitle: "Grafik Angin",
    sideChartSubtitle: "Kecepatan angin per jam.",
    submitText: "Ambil Cuaca",
    icon: "fa-cloud-sun",
  },
  currency: {
    title: "Dashboard Kurs Mata Uang",
    subtitle: "Monitoring kurs mata uang real-time dengan konversi ke rupiah.",
    controlTitle: "Kontrol Kurs",
    controlSubtitle: "Pilih mata uang dasar. Auto refresh 30 detik.",
    detailTitle: "Detail Data Kurs",
    detailSubtitle: "Sumber ExchangeRate API, data terbaru ditampilkan sebagai chart.",
    mainChartTitle: "Grafik Nilai Tukar ke IDR",
    sideChartTitle: "Komposisi Kurs",
    sideChartSubtitle: "Perbandingan beberapa mata uang.",
    submitText: "Ambil Kurs",
    icon: "fa-sack-dollar",
  },
  population: {
    title: "Dashboard Statistik Penduduk",
    subtitle: "Monitoring statistik penduduk tahunan dari data publik World Bank.",
    controlTitle: "Kontrol Penduduk",
    controlSubtitle: "Pilih negara. Auto refresh 30 detik.",
    detailTitle: "Detail Statistik Penduduk",
    detailSubtitle: "Sumber World Bank API, indikator SP.POP.TOTL.",
    mainChartTitle: "Grafik Populasi Tahunan",
    sideChartTitle: "Pertumbuhan Penduduk",
    sideChartSubtitle: "Perubahan populasi per tahun.",
    submitText: "Ambil Statistik",
    icon: "fa-chart-column",
  },
  covid: {
    title: "Dashboard COVID",
    subtitle: "Monitoring ringkasan kasus COVID berdasarkan data publik.",
    controlTitle: "Kontrol COVID",
    controlSubtitle: "Pilih negara. Auto refresh 30 detik.",
    detailTitle: "Detail Data COVID",
    detailSubtitle: "Sumber Disease.sh API, kasus, sembuh, aktif, dan meninggal.",
    mainChartTitle: "Grafik Ringkasan Kasus",
    sideChartTitle: "Proporsi Kasus",
    sideChartSubtitle: "Aktif, sembuh, dan meninggal.",
    submitText: "Ambil COVID",
    icon: "fa-notes-medical",
  },
  sales: {
    title: "Dashboard Penjualan",
    subtitle: "Monitoring penjualan produk menggunakan dummy API.",
    controlTitle: "Kontrol Penjualan",
    controlSubtitle: "Pilih kategori produk. Auto refresh 30 detik.",
    detailTitle: "Detail Data Penjualan",
    detailSubtitle: "Sumber DummyJSON Products API, data produk sebagai simulasi penjualan.",
    mainChartTitle: "Grafik Stok Produk",
    sideChartTitle: "Diskon Produk",
    sideChartSubtitle: "Persentase diskon produk.",
    submitText: "Ambil Penjualan",
    icon: "fa-store",
  },
};

const endpoints = {
  weather: ({ lat, lon }) =>
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&forecast_days=1&timezone=auto`,
  geocoding: (city) =>
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=id&format=json`,
  currency: (base) => `https://open.er-api.com/v6/latest/${base}`,
  population: (country) =>
    `https://api.worldbank.org/v2/country/${country}/indicator/SP.POP.TOTL?format=json&per_page=12`,
  covid: (country) => `https://disease.sh/v3/covid-19/countries/${encodeURIComponent(country)}?strict=true`,
  sales: (category) => `https://dummyjson.com/products/category/${encodeURIComponent(category)}`,
};

function fetchJson(url, source) {
  return fetch(url, { cache: "no-store" }).then((response) => {
    if (!response.ok) throw new Error(`${source} gagal dimuat (${response.status})`);
    return response.json();
  });
}

function setStatus(isLoading, text = "Siap") {
  state.isLoading = isLoading;
  if (els.refreshBtn) els.refreshBtn.disabled = isLoading;
  if (els.submitBtn) els.submitBtn.disabled = isLoading;
  if (els.statusBadge) {
    els.statusBadge.innerHTML = isLoading
      ? '<i class="fa-solid fa-circle-notch fa-spin"></i> Memuat data'
      : `<i class="fa-solid fa-circle-check"></i> ${text}`;
  }
}

function showAlert(type, message) {
  if (!els.alertBox) return;
  els.alertBox.className = type === "error" ? "alert-error" : "alert-success";
  els.alertBox.textContent = message;
  els.alertBox.classList.remove("hidden");
}

function addLog(message) {
  if (!els.logList) return;
  const item = document.createElement("li");
  item.textContent = `${new Date().toLocaleTimeString("id-ID")} - ${message}`;
  els.logList.prepend(item);
  while (els.logList.children.length > 8) els.logList.lastElementChild.remove();
}

function row(label, data, ok = true) {
  return `
    <tr>
      <td class="font-semibold">${label}</td>
      <td>${data ?? "-"}</td>
      <td><span class="badge ${ok ? "badge-success" : "badge-error"} badge-outline">${ok ? "Sukses" : "Error"}</span></td>
    </tr>
  `;
}

function formatNumber(value, options = {}) {
  return Number(value).toLocaleString("id-ID", options);
}

function formatMoney(value, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatTemperature(value) {
  return `${formatNumber(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}°C`;
}

function weatherCodeLabel(code) {
  const labels = {
    0: "Cerah", 1: "Cerah berawan", 2: "Berawan sebagian", 3: "Berawan",
    45: "Berkabut", 48: "Kabut beku", 51: "Gerimis ringan", 53: "Gerimis",
    55: "Gerimis lebat", 61: "Hujan ringan", 63: "Hujan", 65: "Hujan lebat",
    80: "Hujan lokal", 95: "Badai petir",
  };
  return labels[code] || `Kode cuaca ${code}`;
}

function destroyCharts() {
  Object.values(state.charts).forEach((chart) => chart?.destroy());
  state.charts.main = null;
  state.charts.side = null;
}

function makeChart(target, key, config) {
  if (!window.Chart || !target) return;
  state.charts[key]?.destroy();
  state.charts[key] = new Chart(target, {
    ...config,
    options: {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "#475569",
            boxWidth: 12,
            font: { family: "Inter", weight: "700" },
          },
        },
        ...(config.options?.plugins || {}),
      },
      scales: config.options?.scales || {
        x: { grid: { color: "rgba(148, 163, 184, 0.16)" }, ticks: { color: "#475569", maxRotation: 0 } },
        y: { grid: { color: "rgba(148, 163, 184, 0.16)" }, ticks: { color: "#475569" } },
      },
    },
  });
}

function setMetric(index, label, value, meta, icon) {
  const metric = metricEls[index];
  if (!metric) return;
  if (metric.label) metric.label.textContent = label;
  if (metric.value) metric.value.textContent = value ?? "-";
  if (metric.meta) metric.meta.textContent = meta ?? "Belum dimuat";
  if (metric.icon) metric.icon.className = `fa-solid ${icon}`;
}

function renderSummary(items) {
  if (!els.summaryList) return;
  els.summaryList.innerHTML = items
    .map(([label, value]) => `<div><strong>${label}</strong> <span>${value}</span></div>`)
    .join("");
}

function updateLayout(themeKey) {
  const theme = themes[themeKey];
  if (els.pageTitle) els.pageTitle.textContent = theme.title;
  if (els.pageSubtitle) els.pageSubtitle.textContent = theme.subtitle;
  if (els.breadcrumbTitle) els.breadcrumbTitle.textContent = theme.title;
  if (els.controlTitle) els.controlTitle.textContent = theme.controlTitle;
  if (els.controlSubtitle) els.controlSubtitle.textContent = theme.controlSubtitle;
  if (els.detailTitle) els.detailTitle.textContent = theme.detailTitle;
  if (els.detailSubtitle) els.detailSubtitle.textContent = theme.detailSubtitle;
  if (els.mainChartTitle) els.mainChartTitle.textContent = theme.mainChartTitle;
  if (els.sideChartTitle) els.sideChartTitle.textContent = theme.sideChartTitle;
  if (els.sideChartSubtitle) els.sideChartSubtitle.textContent = theme.sideChartSubtitle;
  if (els.submitBtn) els.submitBtn.innerHTML = `<i class="fa-solid ${theme.icon}"></i> ${theme.submitText}`;
  if (els.dynamicControls) els.dynamicControls.innerHTML = controls[themeKey]();
  if (els.geoBtn) els.geoBtn.classList.toggle("hidden", themeKey !== "weather");
  if (els.mainChartBadge) els.mainChartBadge.textContent = themeKey === "covid" ? "Doughnut Chart" : "Line / Bar Chart";
  bindDynamicControls();
}

function renderLoadingTheme() {
  metricEls.forEach((metric, index) => {
    if (metric.label) metric.label.textContent = `Data ${index + 1}`;
    if (metric.value) metric.value.textContent = "-";
    if (metric.meta) metric.meta.textContent = "Memuat data...";
  });
  if (els.table) els.table.innerHTML = "";
  if (els.jsonPreview) els.jsonPreview.textContent = "Memuat data...";
  if (els.summaryList) els.summaryList.innerHTML = "";
  destroyCharts();
}

async function loadWeather() {
  const cityInput = document.querySelector("#cityInput");
  const city = cityInput?.value.trim() || state.lastCityQuery;
  if (!/^[a-zA-Z\s.'-]{2,60}$/.test(city)) throw new Error("Nama kota wajib 2-60 huruf dan tidak boleh angka/simbol aneh.");

  if (city !== state.lastCityQuery) await searchCity(city);

  const weather = await fetchJson(endpoints.weather(state.coords), "Open-Meteo");
  const current = weather.current_weather;
  const index = Math.max(0, weather.hourly.time.indexOf(current.time));
  const humidity = weather.hourly.relativehumidity_2m[index];
  const wind = current.windspeed;
  const condition = weatherCodeLabel(current.weathercode);
  const labels = weather.hourly.time.slice(0, 12).map((time) => new Date(time).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));

  setMetric(0, "Suhu Saat Ini", formatTemperature(current.temperature), state.coords.city, "fa-cloud-sun");
  setMetric(1, "Kelembaban", `${formatNumber(humidity)}%`, "Kelembaban udara", "fa-droplet");
  setMetric(2, "Kecepatan Angin", `${formatNumber(wind, { maximumFractionDigits: 1 })} km/jam`, "Data jam ini", "fa-wind");
  setMetric(3, "Kondisi Cuaca", condition, "Status cuaca", "fa-cloud");

  makeChart(els.mainChart, "main", {
    type: "line",
    data: {
      labels,
      datasets: [
        { label: "Suhu (C)", data: weather.hourly.temperature_2m.slice(0, 12), borderColor: "#00c0ef", backgroundColor: "rgba(0, 192, 239, 0.16)", borderWidth: 3, fill: true, tension: 0.38 },
        { label: "Kelembaban (%)", data: weather.hourly.relativehumidity_2m.slice(0, 12), borderColor: "#00a65a", borderWidth: 2, tension: 0.38 },
      ],
    },
  });
  makeChart(els.sideChart, "side", {
    type: "bar",
    data: {
      labels: labels.slice(0, 8),
      datasets: [{ label: "Angin", data: weather.hourly.windspeed_10m.slice(0, 8), backgroundColor: "#f39c12", borderRadius: 6 }],
    },
    options: { plugins: { legend: { display: false } } },
  });

  renderSummary([
    ["Kota", state.coords.city],
    ["Suhu", formatTemperature(current.temperature)],
    ["Angin", `${formatNumber(wind, { maximumFractionDigits: 1 })} km/jam`],
    ["Kondisi", condition],
  ]);
  if (els.table) {
    els.table.innerHTML = [
      row("Lokasi", `${state.coords.city} (${state.coords.lat}, ${state.coords.lon})`),
      row("Suhu", formatTemperature(current.temperature)),
      row("Kelembaban", `${formatNumber(humidity)}%`),
      row("Angin", `${formatNumber(wind, { maximumFractionDigits: 1 })} km/jam`),
      row("Kondisi", condition),
    ].join("");
  }
  return { params: state.coords, weather };
}

async function loadCurrency() {
  const base = document.querySelector("#baseCurrency")?.value || "USD";
  const data = await fetchJson(endpoints.currency(base), "ExchangeRate API");
  const codes = ["IDR", "EUR", "JPY", "SGD", "MYR", "AUD"].filter((code) => code !== base && data.rates[code]);
  const idr = data.rates.IDR;

  setMetric(0, `1 ${base} ke IDR`, idr ? formatMoney(idr) : "-", "Kurs rupiah", "fa-rupiah-sign");
  setMetric(1, "EUR", data.rates.EUR ? formatNumber(data.rates.EUR, { maximumFractionDigits: 3 }) : "-", `Per 1 ${base}`, "fa-euro-sign");
  setMetric(2, "JPY", data.rates.JPY ? formatNumber(data.rates.JPY, { maximumFractionDigits: 3 }) : "-", `Per 1 ${base}`, "fa-yen-sign");
  setMetric(3, "Update", data.time_last_update_utc?.split(" ").slice(0, 4).join(" "), "ExchangeRate API", "fa-clock");

  makeChart(els.mainChart, "main", {
    type: "bar",
    data: {
      labels: codes,
      datasets: [{ label: `Kurs dari ${base}`, data: codes.map((code) => data.rates[code]), backgroundColor: ["#00c0ef", "#00a65a", "#f39c12", "#dd4b39", "#6366f1", "#14b8a6"], borderRadius: 6 }],
    },
  });
  makeChart(els.sideChart, "side", {
    type: "doughnut",
    data: {
      labels: codes.slice(0, 4),
      datasets: [{ data: codes.slice(0, 4).map((code) => data.rates[code]), backgroundColor: ["#00c0ef", "#00a65a", "#f39c12", "#dd4b39"] }],
    },
    options: { scales: {} },
  });

  renderSummary(codes.slice(0, 4).map((code) => [`1 ${base} ke ${code}`, code === "IDR" ? formatMoney(data.rates[code]) : formatNumber(data.rates[code], { maximumFractionDigits: 3 })]));
  if (els.table) els.table.innerHTML = codes.map((code) => row(code, code === "IDR" ? formatMoney(data.rates[code]) : formatNumber(data.rates[code], { maximumFractionDigits: 4 }))).join("");
  return { params: { base }, currency: data };
}

async function loadPopulation() {
  const country = document.querySelector("#populationCountry")?.value || "IDN";
  const data = await fetchJson(endpoints.population(country), "World Bank API");
  const rows = (data[1] || []).filter((item) => item.value).reverse();
  const latest = rows.at(-1);
  const previous = rows.at(-2);
  const growth = latest && previous ? latest.value - previous.value : 0;

  setMetric(0, "Populasi Terbaru", latest ? formatNumber(latest.value) : "-", latest?.date || "-", "fa-users");
  setMetric(1, "Pertumbuhan", formatNumber(growth), "Dari tahun sebelumnya", "fa-arrow-trend-up");
  setMetric(2, "Negara", latest?.country?.value || country, "World Bank", "fa-earth-asia");
  setMetric(3, "Tahun Data", latest?.date || "-", "Data terbaru API", "fa-calendar");

  makeChart(els.mainChart, "main", {
    type: "line",
    data: {
      labels: rows.map((item) => item.date),
      datasets: [{ label: "Populasi", data: rows.map((item) => item.value), borderColor: "#00a65a", backgroundColor: "rgba(0, 166, 90, 0.14)", borderWidth: 3, fill: true, tension: 0.35 }],
    },
  });
  makeChart(els.sideChart, "side", {
    type: "bar",
    data: {
      labels: rows.slice(1).map((item) => item.date),
      datasets: [{ label: "Pertumbuhan", data: rows.slice(1).map((item, index) => item.value - rows[index].value), backgroundColor: "#00c0ef", borderRadius: 6 }],
    },
    options: { plugins: { legend: { display: false } } },
  });

  renderSummary([
    ["Negara", latest?.country?.value || country],
    ["Tahun", latest?.date || "-"],
    ["Populasi", latest ? formatNumber(latest.value) : "-"],
    ["Pertumbuhan", formatNumber(growth)],
  ]);
  if (els.table) els.table.innerHTML = rows.slice(-6).reverse().map((item) => row(item.date, `${item.country.value}: ${formatNumber(item.value)}`)).join("");
  return { params: { country }, population: data };
}

async function loadCovid() {
  const country = document.querySelector("#covidCountry")?.value || "Indonesia";
  const data = await fetchJson(endpoints.covid(country), "Disease.sh API");

  setMetric(0, "Total Kasus", formatNumber(data.cases), data.country, "fa-virus-covid");
  setMetric(1, "Sembuh", formatNumber(data.recovered), "Total recovered", "fa-heart-pulse");
  setMetric(2, "Aktif", formatNumber(data.active), "Kasus aktif", "fa-bed-pulse");
  setMetric(3, "Meninggal", formatNumber(data.deaths), "Total deaths", "fa-book-medical");

  makeChart(els.mainChart, "main", {
    type: "bar",
    data: {
      labels: ["Kasus", "Sembuh", "Aktif", "Meninggal"],
      datasets: [{ label: data.country, data: [data.cases, data.recovered, data.active, data.deaths], backgroundColor: ["#00c0ef", "#00a65a", "#f39c12", "#dd4b39"], borderRadius: 6 }],
    },
    options: { plugins: { legend: { display: false } } },
  });
  makeChart(els.sideChart, "side", {
    type: "doughnut",
    data: {
      labels: ["Sembuh", "Aktif", "Meninggal"],
      datasets: [{ data: [data.recovered, data.active, data.deaths], backgroundColor: ["#00a65a", "#f39c12", "#dd4b39"] }],
    },
    options: { scales: {} },
  });

  renderSummary([
    ["Negara", data.country],
    ["Hari Ini", formatNumber(data.todayCases)],
    ["Tes", formatNumber(data.tests)],
    ["Populasi", formatNumber(data.population)],
  ]);
  if (els.table) {
    els.table.innerHTML = [
      row("Total kasus", formatNumber(data.cases)),
      row("Kasus hari ini", formatNumber(data.todayCases)),
      row("Sembuh", formatNumber(data.recovered)),
      row("Aktif", formatNumber(data.active)),
      row("Meninggal", formatNumber(data.deaths)),
    ].join("");
  }
  return { params: { country }, covid: data };
}

async function loadSales() {
  const category = document.querySelector("#salesCategory")?.value || "smartphones";
  const data = await fetchJson(endpoints.sales(category), "DummyJSON API");
  const products = data.products || [];
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const totalValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);
  const avgDiscount = products.reduce((sum, product) => sum + product.discountPercentage, 0) / Math.max(1, products.length);
  const top = [...products].sort((a, b) => b.rating - a.rating)[0];

  setMetric(0, "Total Produk", formatNumber(products.length), category, "fa-boxes-stacked");
  setMetric(1, "Total Stok", formatNumber(totalStock), "Simulasi penjualan", "fa-warehouse");
  setMetric(2, "Nilai Stok", formatMoney(totalValue, "USD"), "Harga dummy API", "fa-cash-register");
  setMetric(3, "Diskon Rata-rata", `${formatNumber(avgDiscount, { maximumFractionDigits: 1 })}%`, "Promosi produk", "fa-tags");

  makeChart(els.mainChart, "main", {
    type: "bar",
    data: {
      labels: products.slice(0, 8).map((product) => product.title),
      datasets: [{ label: "Stok", data: products.slice(0, 8).map((product) => product.stock), backgroundColor: "#00c0ef", borderRadius: 6 }],
    },
    options: { plugins: { legend: { display: false } } },
  });
  makeChart(els.sideChart, "side", {
    type: "line",
    data: {
      labels: products.slice(0, 8).map((product) => product.title),
      datasets: [{ label: "Diskon (%)", data: products.slice(0, 8).map((product) => product.discountPercentage), borderColor: "#dd4b39", backgroundColor: "rgba(221, 75, 57, 0.14)", fill: true, tension: 0.35 }],
    },
  });

  renderSummary([
    ["Kategori", category],
    ["Produk terbaik", top?.title || "-"],
    ["Rating", top ? formatNumber(top.rating, { maximumFractionDigits: 2 }) : "-"],
    ["Total stok", formatNumber(totalStock)],
  ]);
  if (els.table) els.table.innerHTML = products.slice(0, 8).map((product) => row(product.title, `${formatMoney(product.price, "USD")} | stok ${product.stock} | rating ${product.rating}`)).join("");
  return { params: { category }, sales: data };
}

const loaders = {
  weather: loadWeather,
  currency: loadCurrency,
  population: loadPopulation,
  covid: loadCovid,
  sales: loadSales,
};

async function searchCity(city) {
  const data = await fetchJson(endpoints.geocoding(city), "Geocoding");
  const match = data.results?.find((item) => item.country_code === "ID") || data.results?.[0];
  if (!match) throw new Error("Kota tidak ditemukan oleh API geocoding.");

  const cityLabel = [match.name, match.admin1, match.country].filter(Boolean).join(", ");
  state.coords = {
    city: cityLabel,
    lat: match.latitude,
    lon: match.longitude,
  };
  state.lastCityQuery = match.name;
  const cityInput = document.querySelector("#cityInput");
  if (cityInput) cityInput.value = match.name;
}

async function loadActiveTheme() {
  if (state.isLoading) return;
  setStatus(true);
  renderLoadingTheme();

  try {
    const payload = await loaders[state.activeTheme]();
    state.lastPayload = { theme: state.activeTheme, ...payload };
    if (els.jsonPreview) els.jsonPreview.textContent = JSON.stringify(state.lastPayload, null, 2);
    const updatedText = `Update terakhir: ${new Date().toLocaleString("id-ID")} | Refresh 30 detik`;
    if (els.lastUpdated) els.lastUpdated.textContent = updatedText;
    if (els.topLastUpdated) els.topLastUpdated.innerHTML = `<i class="fa-regular fa-clock"></i> ${updatedText}`;
    showAlert("success", `${themes[state.activeTheme].title} berhasil dimuat.`);
    addLog(`${themes[state.activeTheme].title} berhasil diperbarui.`);
    setStatus(false, "Data terbaru");
  } catch (err) {
    if (els.table) els.table.innerHTML = row("Error", err.message, false);
    if (els.jsonPreview) els.jsonPreview.textContent = JSON.stringify({ theme: state.activeTheme, error: err.message }, null, 2);
    showAlert("error", err.message);
    addLog(err.message);
    setStatus(false, "Data gagal");
  }
}

function switchTheme(themeKey) {
  state.activeTheme = themeKey;
  els.menuLinks.forEach((link) => link.classList.toggle("active", link.dataset.themeKey === themeKey));
  updateLayout(themeKey);
  resetTimer();
  loadActiveTheme();
  if (els.sidebarToggle) els.sidebarToggle.checked = false;
}

function resetTimer() {
  clearInterval(state.timer);
  state.timer = setInterval(loadActiveTheme, REFRESH_INTERVAL);
  if (els.interval) els.interval.value = String(REFRESH_INTERVAL);
}

function bindDynamicControls() {
  const cityInput = document.querySelector("#cityInput");
  const citySelect = document.querySelector("#citySelect");
  const useBogorBtn = document.querySelector("#useBogorBtn");

  cityInput?.addEventListener("input", () => {
    const error = document.querySelector("#cityError");
    const valid = /^[a-zA-Z\s.'-]{2,60}$/.test(cityInput.value.trim());
    cityInput.classList.toggle("input-error", !valid);
    if (error) {
      error.textContent = valid ? "" : "Nama kota wajib 2-60 huruf dan tidak boleh angka/simbol aneh.";
      error.classList.toggle("hidden", valid);
    }
  });

  citySelect?.addEventListener("change", () => {
    if (!citySelect.value) return;
    cityInput.value = citySelect.value;
    state.lastCityQuery = "";
    loadActiveTheme();
  });

  useBogorBtn?.addEventListener("click", () => {
    state.coords = { city: "Bogor", lat: -6.595, lon: 106.816666 };
    state.lastCityQuery = "Bogor";
    if (cityInput) cityInput.value = "Bogor";
    if (citySelect) citySelect.value = "Bogor";
    loadActiveTheme();
  });
}

function bindSidebarSearch() {
  if (!els.sidebarSearch) return;
  els.sidebarSearch.addEventListener("input", () => {
    const query = els.sidebarSearch.value.trim().toLowerCase();
    let visibleCount = 0;

    els.menuLinks.forEach((link) => {
      const text = link.textContent.toLowerCase();
      const isVisible = text.includes(query);
      link.classList.toggle("hidden", !isVisible);
      if (isVisible) visibleCount += 1;
    });

    if (els.menuSearchEmpty) els.menuSearchEmpty.classList.toggle("hidden", visibleCount > 0);
  });

  els.sidebarSearch.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const firstVisible = els.menuLinks.find((link) => !link.classList.contains("hidden"));
    if (firstVisible) switchTheme(firstVisible.dataset.themeKey);
  });
}

// Inisialisasi Event Listeners Utama
els.menuLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    switchTheme(link.dataset.themeKey);
  });
});

if (els.form) {
  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    state.lastCityQuery = state.activeTheme === "weather" ? "" : state.lastCityQuery;
    resetTimer();
    loadActiveTheme();
  });
}

if (els.refreshBtn) els.refreshBtn.addEventListener("click", loadActiveTheme);
if (els.interval) els.interval.value = String(REFRESH_INTERVAL);

if (els.geoBtn) {
  els.geoBtn.addEventListener("click", () => {
    if (state.activeTheme !== "weather") return;
    if (!navigator.geolocation) {
      showAlert("error", "Browser tidak mendukung geolocation.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        state.coords = {
          city: "Lokasi Saya",
          lat: Number(position.coords.latitude.toFixed(6)),
          lon: Number(position.coords.longitude.toFixed(6)),
        };
        state.lastCityQuery = "Lokasi Saya";
        const cityInput = document.querySelector("#cityInput");
        const citySelect = document.querySelector("#citySelect");
        if (cityInput) cityInput.value = "Lokasi Saya";
        if (citySelect) citySelect.value = "";
        loadActiveTheme();
      },
      () => showAlert("error", "Izin lokasi ditolak atau lokasi tidak tersedia."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// Bootstrapping App
if (window.AOS) {
  AOS.init({ duration: 650, once: true, offset: 60 });
}

bindSidebarSearch();
updateLayout(state.activeTheme);
resetTimer();
loadActiveTheme();