/* ==========================================================================
   RESUME DATA — edit this file only to update the site.
   Everything on the page is rendered from this object.
   ========================================================================== */
window.RESUME = {
  name: "Mehdi Mehdiyev",
  firstName: "Mehdi",
  lastName: "Mehdiyev",
  role: "Data Scientist @ Yelo Bank",
  location: "Baku, Azerbaijan",
  avatar: "https://avatars.githubusercontent.com/u/98921340?v=4",
  available: "Data Scientist at Yelo Bank",

  /* PDF resume linked from the "Download CV" buttons (regenerate it after edits — see README). */
  cv: "cv.pdf",
  site: "https://mehdiyev.dev",

  /* "At a glance" strip under the hero — the 10-second summary for recruiters.
     Use {experienceSince} to insert the auto-computed length of experience. */
  experienceSince: "Jul 2025",
  glance: [
    { label: "Now", value: "Data Scientist · Yelo Bank" },
    { label: "Experience", value: "{experienceSince} in banking ML" },
    { label: "Focus", value: "Credit risk · production ML · LLM / RAG" },
    { label: "Core stack", value: "Python · SQL · LightGBM · FastAPI · Docker" },
    { label: "Languages", value: "RU · AZ · EN" },
  ],

  headline:
    "I build production ML for lending — and make it fast, monitored and reliable enough to run every day.",

  about: [
    "Data Scientist at Yelo Bank in Baku. I work on production ML systems the bank uses daily — personalized credit offers and micro-business pre-offer scoring — from the data access layer to the API and monitoring.",
    "My strongest ground is tabular ML for finance — credit scoring, probability-of-default models, interpretable WoE scorecards next to gradient boosting benchmarks. I'm now extending into LLM systems and retrieval-augmented generation.",
  ],

  links: {
    github: "https://github.com/Mekhty111",
    linkedin: "https://www.linkedin.com/in/mekhty-mekhtyev/",
    // email: "you@example.com",   // uncomment to show an email button
  },

  stats: [
    { value: 19, decimals: 0, suffix: "×", label: "Faster credit-offer pipeline: 14.5 h → 45 min for 5,000 clients" },
    { value: 0.762, decimals: 3, label: "Out-of-time AUC on a credit PD scorecard" },
    { value: 10, decimals: 0, suffix: "+", label: "ML, AI and SQL certificates" },
  ],

  /* Each skill can list project ids it was used in (see `projects` below).
     Hovering a skill highlights those project cards. */
  skills: [
    {
      group: "Machine Learning",
      items: [
        { name: "scikit-learn", projects: ["home-credit"] },
        { name: "LightGBM", projects: ["home-credit"] },
        { name: "XGBoost" },
        { name: "CatBoost" },
        { name: "Logistic Regression / Scorecards", projects: ["home-credit"] },
        { name: "Optuna" },
        { name: "SHAP", projects: ["home-credit"] },
        { name: "Clustering · K-means · DBSCAN" },
        { name: "Anomaly detection" },
      ],
    },
    {
      group: "Deep Learning & NLP",
      items: [
        { name: "PyTorch" },
        { name: "TensorFlow" },
        { name: "Keras" },
        { name: "LLMs", projects: ["tax-rag"] },
        { name: "RAG", projects: ["tax-rag"] },
        { name: "Embeddings / Vector search", projects: ["tax-rag"] },
        { name: "Topic modeling (LDA)" },
      ],
    },
    {
      group: "Data",
      items: [
        { name: "Python", projects: ["home-credit", "tax-rag"] },
        { name: "Pandas", projects: ["home-credit"] },
        { name: "NumPy", projects: ["home-credit"] },
        { name: "SQL / PostgreSQL" },
        { name: "Feature engineering", projects: ["home-credit"] },
        { name: "WoE / IV", projects: ["home-credit"] },
        { name: "PCA · t-SNE · UMAP" },
        { name: "Matplotlib · Plotly", projects: ["home-credit"] },
      ],
    },
    {
      group: "Engineering",
      items: [
        { name: "FastAPI", projects: ["home-credit"] },
        { name: "Flask" },
        { name: "Docker" },
        { name: "Grafana" },
        { name: "Prometheus" },
        { name: "CI/CD · GitLab" },
        { name: "Python multiprocessing" },
        { name: "Jinja2", projects: ["home-credit"] },
        { name: "Git" },
        { name: "Dataiku" },
        { name: "Jupyter", projects: ["home-credit"] },
      ],
    },
  ],

  /* Add a project = add an object here. `url` is where the card links. */
  projects: [
    {
      id: "tax-rag",
      title: "Tax_RAG",
      kicker: "LLM · Retrieval-Augmented Generation",
      description:
        "Question answering over tax documentation: documents are chunked and embedded, the most relevant passages are retrieved for each question, and an LLM answers grounded in those sources.",
      tags: ["Python", "LLM", "RAG", "Embeddings", "Vector search"],
      metrics: [],
      url: "https://github.com/Mekhty111/Tax_RAG",
      year: "2026",
    },
    {
      id: "home-credit",
      title: "Home Credit Default Risk",
      kicker: "Credit risk · PD model",
      description:
        "End-to-end probability-of-default pipeline on 7 Kaggle tables: EDA → WoE/IV feature selection → logistic-regression scorecard with a LightGBM benchmark → out-of-time validation, served through FastAPI with a Jinja2 UI.",
      tags: ["LightGBM", "Logistic Regression", "WoE / IV", "SHAP", "FastAPI"],
      metrics: [
        { label: "AUC OOT", value: "0.762" },
        { label: "Gini", value: "0.524" },
        { label: "KS", value: "0.399" },
        { label: "PSI", value: "0.0001" },
      ],
      url: "https://github.com/Mekhty111/Home-Credit-Default-Risk",
      year: "2026",
    },
  ],

  /* Logos: drop an image into assets/logos/ and put its file name in `logo`.
     Without a logo the organisation's initials are shown instead. */

  /* Work experience. Add entries like:
     { period: "Jan 2025 — Now", title: "Data Scientist", org: "Company", logo: "company.png", place: "Baku",
       points: ["Project — what you did, impact with a number"], stack: ["Python"] }
     Periods are "Mon YYYY — Mon YYYY" (or "— Now"); the duration is computed automatically.
     Text before " — " in a point is shown in bold. */
  experience: [
    {
      period: "Feb 2026 — Now",
      title: "Data Scientist",
      org: "Yelo Bank",
      logo: "yelo.png",
      place: "Baku",
      points: ["Full-time role after the internship, continuing work on the bank's production ML systems."],
      stack: ["Python", "SQL", "FastAPI", "Docker", "GitLab", "Grafana"],
    },
    {
      period: "Jul 2025 — Feb 2026",
      title: "Intern Data Scientist",
      org: "Yelo Bank",
      logo: "yelo.png",
      place: "Baku",
      points: [
        "Retail Personalized Offer — model that computes a maximum personalized credit offer per client and predicts whether they can handle it. Rewrote the DB layer, moved to parallel processing with Python multiprocessing (17–20× speedup), added decorator-based logging and automatic result persistence: 5,000 clients went from 14.5 hours to 45 minutes.",
        "Micro-scoring Pre-Offer — engine that finds micro-business clients with unused limits, runs Risk Rules / Stop Factors / Business Rules chains and auto-creates loan leads (refinancing or parallel top-up). Restored it end-to-end: fixed deprecated integrations, rewrote data access, vectorized and parallelized inference.",
        "Built a FastAPI interface with dynamic toggles for Risk Rules and lead creation. Both systems shipped containerized with Docker, versioned on GitLab and monitored in Grafana.",
      ],
      stack: ["Python", "multiprocessing", "SQL", "FastAPI", "Docker", "GitLab", "Grafana"],
    },
    {
      period: "Sep 2025 — Dec 2025",
      title: "Youth STEM Mentor",
      org: "Algorithmics Global",
      logo: "algorithmics.png",
      place: "National School Hackathon",
      points: [
        "Mentored five teams at the 48-hour National School Hackathon (Ministry of Science and Education × Algorithmics Global) — 300 finalists selected from 350,000+ participants.",
        "Three of my teams reached the Top 16; one took 3rd place overall.",
      ],
      stack: ["Mentoring", "Hackathon"],
    },
  ],

  education: [
    {
      period: "2024 — 2026",
      title: "Data Science & ML Engineer program",
      org: "Skillfactory",
      logo: "skillfactory.jpg",
      points: [
        "Applied ML track: classical ML, gradient boosting, neural networks, MLOps basics.",
        "Project-based: HH.ru vacancy analysis, Booking.com rating prediction, bank marketing, NYC taxi trip duration.",
      ],
    },
    {
      period: "2022 — 2026",
      title: "B.Sc. Computer Science",
      org: "Azerbaijan State Oil and Industrial University",
      logo: "adnsu.svg",
      points: ["Algorithms and data structures, databases, software engineering."],
    },
  ],

  /* Certificates. status: "done" | "progress"
     logo: file name in assets/logos/ (an array for co-issued certificates). */
  certificates: [
    { title: "Machine Learning Specialization", issuer: "DeepLearning.AI · Stanford", logo: ["deeplearning-ai.png", "stanford.png"], date: "Jul 2025", status: "done",
      url: "https://www.coursera.org/account/accomplishments/specialization/ORCCZ7UI5AJW" },
    { title: "Machine Learning in Production", issuer: "DeepLearning.AI", logo: "deeplearning-ai.png", date: "Jul 2025", status: "done",
      url: "https://www.coursera.org/account/accomplishments/records/RLCJMS8CFQBI" },
    { title: "OCI 2025 Certified AI Foundations Associate", issuer: "Oracle", logo: "oracle.png", date: "Jun 2025", status: "done",
      url: "https://catalog-education.oracle.com/pls/certview/sharebadge?id=6EC9954F8D8095AED23B275C3B101E8190C109B8C8F61A801A1D8707B828E408" },
    { title: "Advanced Learning Algorithms", issuer: "DeepLearning.AI · Stanford", logo: ["deeplearning-ai.png", "stanford.png"], date: "Jul 2025", status: "done",
      url: "https://www.coursera.org/account/accomplishments/records/S4DNLIBALI2T" },
    { title: "Supervised Machine Learning: Regression and Classification", issuer: "DeepLearning.AI · Stanford", logo: ["deeplearning-ai.png", "stanford.png"], date: "Jul 2025", status: "done",
      url: "https://www.coursera.org/account/accomplishments/records/BFMGJAN307ME" },
    { title: "Unsupervised Learning, Recommenders, Reinforcement Learning", issuer: "DeepLearning.AI · Stanford", logo: ["deeplearning-ai.png", "stanford.png"], date: "Jul 2025", status: "done",
      url: "https://www.coursera.org/account/accomplishments/records/QP86DQJS8U59" },
    { title: "AI & ML — AI Unleashed: From Basics to Neural Brilliance", issuer: "Coursera", logo: "coursera.png", date: "Jul 2025", status: "done",
      url: "https://www.coursera.org/account/accomplishments/badge/Q5PuhtqRSzeT7obakUs3Ag" },
    { title: "Dataiku Core Designer", issuer: "Dataiku", logo: "dataiku.png", date: "Jul 2025", status: "done",
      url: "https://verify.skilljar.com/c/onxu99h7vscy" },
    { title: "SQL (Advanced)", issuer: "HackerRank", logo: "hackerrank.jpg", date: "Jul 2024", status: "done",
      url: "https://www.hackerrank.com/certificates/2ef8c622fad3" },
    { title: "SQL (Intermediate)", issuer: "HackerRank", logo: "hackerrank.jpg", date: "Jul 2024", status: "done",
      url: "https://www.hackerrank.com/certificates/f732fcaea704" },
    { title: "Software Testing — 256 h, 94/100", issuer: "CodeForFuture · Ministry of Science and Education × Algorithmics", logo: "algorithmics.png", date: "", status: "done", url: "" },
    { title: "Data Science & ML Engineer", issuer: "Skillfactory", logo: "skillfactory.jpg", date: "2026", status: "progress", url: "" },
  ],

  languages: [
    { name: "Russian", level: "Native" },
    { name: "Azerbaijani", level: "Full professional" },
    { name: "English", level: "Advanced" },
  ],
};
