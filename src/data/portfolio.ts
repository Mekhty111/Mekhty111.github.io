/* =============================================================================
   PORTFOLIO CONTENT — the only file you need to edit to update the site.
   After editing, run:  npm run build      (rebuilds index.html, sitemap.xml)
                        npm run build:cv   (also re-prints cv.pdf)
   Types and field docs: ./types.ts
   ============================================================================= */
import type { Portfolio } from "./types.ts";

const portfolio: Portfolio = {
  site: {
    url: "https://mehdiyev.dev",
    title: "Mehdi Mehdiyev — Data Scientist, credit risk and production ML",
    description:
      "Data Scientist at Yelo Bank in Baku. Credit scoring, PD models and the pipelines that run them in production, plus LLM/RAG. Includes a live credit-scoring demo.",
    ogImage: "assets/og.png",
    cv: "cv.pdf",
  },

  person: {
    name: "Mehdi Mehdiyev",
    role: "Data Scientist",
    company: "Yelo Bank",
    location: "Baku, Azerbaijan",
    statement: "I build production ML for lending: credit scoring, PD models and the pipelines that run them.",
    // Written from your experience entries below. Rewrite in your own words any time.
    intro:
      "I work on the part of machine learning that has to keep running after the notebook: credit models, the data access and parallel inference around them, and the services and dashboards that keep them in production.",
    availability: "Open to conversations about credit risk, production ML and RAG",
    photo: "https://avatars.githubusercontent.com/u/98921340?v=4",
  },

  contact: {
    // PLACEHOLDER: add the address you want public, e.g. "name@domain.com". Until then no email link is shown.
    email: "",
    linkedin: "https://www.linkedin.com/in/mekhty-mekhtyev/",
    github: "https://github.com/Mekhty111",
  },

  /* Set as one sentence under the hero intro, figures inline. Real numbers only. */
  proof: [
    { value: "14.5 h → 45 min", text: "for a 5,000-client personalized credit-offer run at Yelo Bank" },
    { value: "0.762", text: "out-of-time AUC on the PD scorecard you can run live below" },
  ],

  /* About: how you work. Drafted from your projects and experience; edit freely. */
  about: [
    "Most of my work sits where a model meets a lending decision. At Yelo Bank that means personalized credit offers and pre-offers for retail and micro-business clients: the model itself, and just as much the database layer, the rule chains, the parallel inference and the service around it.",
    "I start from the decision the model supports and from how it will be checked. In credit that usually means an interpretable scorecard with a stronger model as a benchmark, out-of-time validation and stability checks, rather than one headline score.",
    "Alongside credit risk I work with LLMs: retrieval-augmented question answering that answers from documents and shows its source.",
  ],

  projects: [
    {
      id: "home-credit",
      title: "Home Credit Default Risk",
      product: "Credence",
      year: "2026",
      layout: "feature",
      summary:
        "A probability-of-default model and a live scoring service, built the way a retail bank would build one.",
      problem:
        "A lender has to decide on every application, price the risk and explain the decision. The model has to rank applicants well, stay stable on new ones, and be readable by risk and compliance teams.",
      approach: [
        "Joined 7 Home Credit tables (307,511 applications plus bureau, previous-loan, installment, card and POS history) into per-applicant features.",
        "Selected features by Information Value, encoded them as Weight of Evidence with optimal monotonic binning and removed correlated pairs, leaving 56.",
        "Fitted a logistic-regression scorecard scaled to points (PDO 20, 600 points at 19:1 odds) and a LightGBM benchmark explained with SHAP.",
        "Validated on 61,503 out-of-time applications never used in training: AUC, KS, Gini, PSI and calibration.",
        "Served it with FastAPI and a server-rendered UI: every application gets a score, PD, risk band, decision and reason codes.",
      ],
      architecture: [
        { title: "Seven source tables", detail: "Applications, bureau, previous loans, installments, POS and card balances" },
        { title: "Feature engineering", detail: "Delinquency, utilization and approval history per applicant" },
        { title: "WoE / IV selection", detail: "IV ≥ 0.02, correlation < 0.85, 56 features" },
        { title: "Scorecard + benchmark", detail: "Logistic regression in points; LightGBM with SHAP" },
        { title: "Out-of-time validation", detail: "61,503 applications: AUC, KS, Gini, PSI" },
        { title: "FastAPI service", detail: "POST /score returns score, PD, band, action, contributions" },
        { title: "Credence UI", detail: "Application form, decision log, model documentation" },
      ],
      features: [
        "Application form with sample profiles and a raw JSON mode",
        "Decision card: PD from both models, risk band and reason codes",
        "Decision log with filters and CSV export, kept only in your browser",
        "Model page: pipeline, validation, score scaling and decision policy",
        "English, Russian and Azerbaijani; light and dark themes",
      ],
      metricColumns: { value: "Scorecard", benchmark: "LightGBM", threshold: "Industry min." },
      metrics: [
        { label: "AUC", value: "0.762", benchmark: "0.772", threshold: "0.65" },
        { label: "Gini", value: "0.524", benchmark: "0.543", threshold: "0.30" },
        { label: "KS", value: "0.399", benchmark: "0.409", threshold: "0.20" },
        { label: "PSI", value: "0.0001", benchmark: "—", threshold: "< 0.10" },
      ],
      metricsSource: "Out-of-time sample of 61,503 applications. The scorecard is the model the live Credence service runs; LightGBM is the benchmark on the same 56 features.",
      table: {
        caption: "Decision policy, with cut-offs calibrated on the out-of-time sample",
        rows: [
          ["Score", "Risk band", "Action", "Default rate", "Share"],
          ["≥ 560", "Very low", "Approve, best rate", "1.4%", "13%"],
          ["540–559", "Low", "Approve", "2.6%", "21%"],
          ["520–539", "Medium", "Conditional approval", "4.9%", "26%"],
          ["500–519", "High", "Manual review", "9.9%", "21%"],
          ["< 500", "Very high", "Reject", "22.3%", "18%"],
        ],
      },
      stack: ["Python", "pandas", "scikit-learn", "OptimalBinning", "LightGBM", "SHAP", "FastAPI", "Jinja2"],
      repo: "https://github.com/Mekhty111/Home-Credit-Default-Risk",
      demo: {
        kind: "fastapi",
        url: "https://credit.mehdiyev.dev",
        // Checked 2026-11-24: the host sends no X-Frame-Options or CSP frame-ancestors, so embedding works.
        embed: true,
        docs: "https://credit.mehdiyev.dev/docs",
        views: [
          { label: "Score an applicant", path: "/ui/score", poster: "assets/shots/credence-score.webp", posterAlt: "Credence scoring a prime applicant: 611 points, very low risk, approve at the best rate, with the factors behind it" },
          { label: "Overview", path: "/ui", poster: "assets/shots/credence-overview.webp", posterAlt: "Credence overview: model in service, validation metrics and the out-of-time score distribution" },
          { label: "Model", path: "/ui/model", poster: "assets/shots/credence-model.webp", posterAlt: "Credence model page: pipeline, validation metrics, model comparison and score scaling" },
        ],
      },
    },
    {
      id: "tax-rag",
      title: "Tax RAG",
      product: "Vergi Köməkçisi",
      year: "2026",
      layout: "feature",
      // Facts below come from the running app's own /about endpoint and "Layihə haqqında" panel (checked 2026-11-24).
      summary:
        "A tax assistant in Azerbaijani that answers from the State Tax Service's official Q&A and cites every answer it draws on.",
      problem:
        "The State Tax Service has published thousands of answers to taxpayers' questions, and the exact wording matters. An LLM answering from memory can sound right and be wrong, so every answer has to come from the official texts and show where it came from.",
      approach: [
        "Took the question-and-answer section of taxes.gov.az and dropped entries without an answer, leaving 3,549 official Q&A pairs.",
        "Kept each question with its answer as one chunk (up to 1,500 characters) and embedded it with gemini-embedding-001 into a 768‑dimensional ChromaDB index.",
        "Embeds each question the same way, retrieves the 5 nearest pairs and drops anything farther than 0.3 cosine distance.",
        "Gemini 2.5 Flash (temperature 0.2) answers only from those passages, numbers its citations and says so when the context holds no answer.",
        "Served with FastAPI: every response carries the sources with similarity and date, plus retrieval and generation times.",
      ],
      architecture: [
        { title: "taxes.gov.az Q&A", detail: "Official answers, unanswered entries removed" },
        { title: "Chunk + embed", detail: "Question + answer, gemini-embedding-001" },
        { title: "ChromaDB index", detail: "3,549 pairs, 768‑d, cosine" },
        { title: "Retrieve", detail: "Top 5, distance ≤ 0.3" },
        { title: "Generate", detail: "Gemini 2.5 Flash, numbered citations" },
        { title: "FastAPI + UI", detail: "Answer, sources, timings, in Azerbaijani" },
      ],
      features: [
        "Answers in Azerbaijani with numbered citations",
        "Each source shown with its similarity score, date and a link to the original",
        "Says plainly when the official answers don't cover the question",
        "Suggested questions on VÖEN, income tax and VAT",
        "Log of recent questions and a project panel describing the pipeline",
      ],
      metricsTitle: "Setup",
      metricColumns: { label: "Part", value: "Configuration" },
      metrics: [
        { label: "Knowledge base", value: "3,549 Q&A pairs" },
        { label: "Embeddings", value: "gemini-embedding-001, 768‑d" },
        { label: "Retrieval", value: "Top 5, cosine ≤ 0.3" },
        { label: "Generation", value: "Gemini 2.5 Flash, temp 0.2" },
      ],
      metricsSource: "Source: taxes.gov.az, Suallar və cavablar.",
      stack: ["Python", "FastAPI", "ChromaDB", "Gemini 2.5 Flash", "gemini-embedding-001", "RAG"],
      // repo: "https://github.com/Mekhty111/Tax_RAG",  // returned 404 on 2026-11-24 (private?). Make it public, then uncomment.
      demo: {
        kind: "fastapi",
        url: "https://tax.mehdiyev.dev",
        // Checked 2026-11-24: no X-Frame-Options or CSP frame-ancestors, so embedding works.
        embed: true,
        timeout: 30,
        views: [
          { label: "Answer with sources", path: "/", poster: "assets/shots/tax-answer.webp", posterAlt: "Vergi Köməkçisi answering what the personal income tax rate is, with numbered citations and the official answers it used as sources" },
        ],
      },
    },
  ],

  /* Smaller projects, one line each. Descriptions follow the GitHub repo descriptions. */
  archive: [
    { title: "Chronolog", description: "Python profiler and logger that turns code execution into a live timeline.", stack: ["Python"], repo: "https://github.com/Mekhty111/Chronolog" },
    { title: "Booking FairScore", description: "Predicting hotel ratings and flagging suspicious Booking.com reviews with NLP and regression.", stack: ["Python", "NLP"], repo: "https://github.com/Mekhty111/booking-fairscore" },
    { title: "NYC Taxi trip duration", description: "Kaggle regression on trip records, time features and weather.", stack: ["Python"], repo: "https://github.com/Mekhty111/NYC-Taxi-TripML" },
    { title: "HH.ru vacancy analysis", description: "SQL analysis and normalization of HH.ru job vacancies in PostgreSQL.", stack: ["SQL", "PostgreSQL"], repo: "https://github.com/Mekhty111/hh-postgres-analyzer" },
    { title: "Bank marketing response", description: "Predicting which bank customers open a term deposit after a campaign.", stack: ["Python"], repo: "https://github.com/Mekhty111/bank-customer-segmentation" },
  ],

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
        "Mentored five teams at the 48-hour National School Hackathon (Ministry of Science and Education × Algorithmics Global): 300 finalists selected from 350,000+ participants.",
        "Three of my teams reached the Top 16; one took 3rd place overall.",
      ],
      stack: ["Mentoring", "Hackathon"],
    },
  ],

  /* Your own skills. Group names and items are free text. */
  skills: [
    { group: "Machine learning", items: ["scikit-learn", "LightGBM", "XGBoost", "CatBoost", "Logistic regression / scorecards", "SHAP", "Optuna", "Clustering", "Anomaly detection"] },
    { group: "Deep learning & LLMs", items: ["PyTorch", "TensorFlow", "Keras", "LLMs", "RAG", "Embeddings / vector search"] },
    { group: "Data", items: ["Python", "SQL / PostgreSQL", "pandas", "NumPy", "Feature engineering", "WoE / IV", "Matplotlib / Plotly"] },
    { group: "Engineering & MLOps", items: ["FastAPI", "Flask", "Docker", "GitLab CI/CD", "Grafana", "Prometheus", "Python multiprocessing", "Git"] },
  ],

  education: [
    {
      period: "2024 — 2026",
      title: "Data Science & ML Engineer program",
      org: "Skillfactory",
      logo: "skillfactory.jpg",
      points: [
        "Applied ML track: classical ML, gradient boosting, neural networks, MLOps basics.",
        "Projects: HH.ru vacancy analysis, Booking.com rating prediction, bank marketing, NYC taxi trip duration.",
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

  certificates: [
    { title: "Machine Learning Specialization", issuer: "DeepLearning.AI, Stanford", date: "Jul 2025", status: "done", url: "https://www.coursera.org/account/accomplishments/specialization/ORCCZ7UI5AJW" },
    { title: "Machine Learning in Production", issuer: "DeepLearning.AI", date: "Jul 2025", status: "done", url: "https://www.coursera.org/account/accomplishments/records/RLCJMS8CFQBI" },
    { title: "OCI 2025 Certified AI Foundations Associate", issuer: "Oracle", date: "Jun 2025", status: "done", url: "https://catalog-education.oracle.com/pls/certview/sharebadge?id=6EC9954F8D8095AED23B275C3B101E8190C109B8C8F61A801A1D8707B828E408" },
    { title: "Advanced Learning Algorithms", issuer: "DeepLearning.AI, Stanford", date: "Jul 2025", status: "done", url: "https://www.coursera.org/account/accomplishments/records/S4DNLIBALI2T" },
    { title: "Supervised Machine Learning: Regression and Classification", issuer: "DeepLearning.AI, Stanford", date: "Jul 2025", status: "done", url: "https://www.coursera.org/account/accomplishments/records/BFMGJAN307ME" },
    { title: "Unsupervised Learning, Recommenders, Reinforcement Learning", issuer: "DeepLearning.AI, Stanford", date: "Jul 2025", status: "done", url: "https://www.coursera.org/account/accomplishments/records/QP86DQJS8U59" },
    { title: "AI & ML — AI Unleashed: From Basics to Neural Brilliance", issuer: "Coursera", date: "Jul 2025", status: "done", url: "https://www.coursera.org/account/accomplishments/badge/Q5PuhtqRSzeT7obakUs3Ag" },
    { title: "Dataiku Core Designer", issuer: "Dataiku", date: "Jul 2025", status: "done", url: "https://verify.skilljar.com/c/onxu99h7vscy" },
    { title: "SQL (Advanced)", issuer: "HackerRank", date: "Jul 2024", status: "done", url: "https://www.hackerrank.com/certificates/2ef8c622fad3" },
    { title: "SQL (Intermediate)", issuer: "HackerRank", date: "Jul 2024", status: "done", url: "https://www.hackerrank.com/certificates/f732fcaea704" },
    { title: "Software Testing, 256 h, 94/100", issuer: "CodeForFuture, Ministry of Science and Education × Algorithmics", status: "done" },
    { title: "Data Science & ML Engineer", issuer: "Skillfactory", date: "2026", status: "progress" },
  ],

  languages: [
    { name: "Russian", level: "Native" },
    { name: "Azerbaijani", level: "Full professional" },
    { name: "English", level: "Advanced" },
  ],

  closing: {
    heading: "Hiring for credit risk, production ML or RAG?",
    text: "I'm happy to talk about a role or a problem you're working on. LinkedIn is the quickest way to reach me, and the CV has the details on two pages.",
  },
};

export default portfolio;
