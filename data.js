/* ==========================================================================
   RESUME DATA — edit this file only to update the site.
   Everything on the page is rendered from this object.
   ========================================================================== */
window.RESUME = {
  name: "Mehdi Mehdiyev",
  role: "Data Scientist",
  company: "Yelo Bank",
  location: "Baku, Azerbaijan",
  avatar: "https://avatars.githubusercontent.com/u/98921340?v=4",

  /* PDF resume linked from the "Download CV" buttons (regenerate it after edits — see README). */
  cv: "cv.pdf",
  site: "https://mehdiyev.dev",

  /* One sentence under the name. */
  headline: "I build production ML for lending — credit scoring, PD models and the pipelines that run them.",

  /* Three facts a recruiter should see first. {experienceSince} = auto-computed time in industry. */
  experienceSince: "Jul 2025",
  facts: [
    { value: "{experienceSince}", label: "in banking ML at Yelo Bank" },
    { value: "19×", label: "faster credit-offer pipeline (14.5 h → 45 min)" },
    { value: "0.762", label: "out-of-time AUC, credit scorecard" },
  ],

  links: {
    github: "https://github.com/Mekhty111",
    linkedin: "https://www.linkedin.com/in/mekhty-mekhtyev/",
    // email: "you@example.com",   // uncomment to show it in the header and the PDF
    // phone: "+994 ...",
    // telegram: "username",
  },

  /* Projects — the main section. The picture links to `demo` if set, otherwise to `url`.
     `image`: screenshot in assets/shots/. `highlights`: 2–4 short lines, results first. */
  projects: [
    {
      id: "home-credit",
      title: "Home Credit Default Risk",
      summary: "Probability-of-default model and live credit scoring service, built the way a retail bank would.",
      highlights: [
        "WoE/IV scorecard with a LightGBM benchmark, trained on 307k applications from 7 tables",
        "Validated out of time on 61,503 applications — stable, PSI 0.0001",
        "Deployed as a FastAPI service with a web UI: decision, PD, risk band and reasons in ~10 ms",
      ],
      metrics: [
        { label: "AUC OOT", value: "0.762" },
        { label: "Gini", value: "0.524" },
        { label: "KS", value: "0.399" },
        { label: "PSI", value: "0.0001" },
      ],
      tags: ["Python", "LightGBM", "Logistic Regression", "WoE / IV", "SHAP", "FastAPI"],
      image: "assets/shots/home-credit.png",
      imageAlt: "Screenshot of the Credence credit scoring demo",
      url: "https://github.com/Mekhty111/Home-Credit-Default-Risk",
      demo: "https://credit.mehdiyev.dev/ui",
      year: "2026",
    },
    {
      id: "tax-rag",
      title: "Tax RAG",
      summary: "Question answering over tax documentation that cites the source it answers from.",
      highlights: [
        "Documents are chunked and embedded; the most relevant passages are retrieved per question",
        "An LLM answers grounded in the retrieved passages instead of from memory",
      ],
      metrics: [],
      tags: ["Python", "LLM", "RAG", "Embeddings", "Vector search"],
      url: "https://github.com/Mekhty111/Tax_RAG",
      year: "2026",
    },
  ],

  skills: [
    { group: "ML", items: ["scikit-learn", "LightGBM", "XGBoost", "CatBoost", "Logistic regression / scorecards", "SHAP", "Optuna", "Clustering", "Anomaly detection"] },
    { group: "Deep learning & LLM", items: ["PyTorch", "TensorFlow", "Keras", "LLMs", "RAG", "Embeddings / vector search"] },
    { group: "Data", items: ["Python", "SQL / PostgreSQL", "Pandas", "NumPy", "Feature engineering", "WoE / IV", "Matplotlib / Plotly"] },
    { group: "Engineering", items: ["FastAPI", "Flask", "Docker", "GitLab CI/CD", "Grafana", "Prometheus", "Python multiprocessing", "Git"] },
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
        "Retail Personalized Offer — model that computes a maximum personalized credit offer per client and predicts whether they can handle it. Rewrote the DB layer, moved to parallel processing with Python multiprocessing (17–20× speedup), added decorator-based logging and automatic result persistence: ==5,000 clients went from 14.5 hours to 45 minutes==.",
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
