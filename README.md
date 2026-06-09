# 📊 Customer Churn Analytics & Prediction Console (Streamlit Version)

An interactive, Python-powered customer success dashboard and churn risk simulator. Built on the **IBM Telco Churn dataset**, this application pairs a fast client-side logistic heuristic predictor with deep forensic intelligence powered by Google's Gemini Models.

---

## 🌟 Key Features

### 1. Individual Risk Simulator
* **Interactive Parameters**: Adjust demographics (Senior Citizen, Partner, Dependents), account tenure, monthly charges, contract duration, payment method, internet tier, and add-ons (Cyber-Security, Tech Support).
* **Speedometer Risk Gauge**: Real-time interactive speedometer gauge tracking churn probability (Low, Medium, High risk thresholds) using Plotly.
* **Statistical Drivers**: Modifiers break down individual parameters indicating positive or negative weight impacts relative to statistical benchmarks.
* **Gemini Forensic Intelligence**: Generates bespoke behavioral synthesis briefs and prioritized, deployable retention interventions directly within the console.

### 2. Bulk Ingestion Predictor
* **CSV Bulk Loader**: Batch ingest custom client lists parsed directly inside the dashboard using Pandas.
* **Aggregate Metrics**: Summary panels show Batched Total, High Risk Counts, Medium Threat groups, and average batch risk.
* **Interactive Data Table**: View, page, and search the final risk-scored customer list.

---

## 🛠️ Tech Stack & Architecture

This application employs a lightweight, single-script Python dashboard architecture:

* **UI Framework**: Streamlit (Python web dashboard tool)
* **Mathematical Graphics**: Plotly (circular risk gauges)
* **Data Processing**: Pandas (CSV file parsing and dataframe operations)
* **Cognitive Engine**: Google Gemini API via the new `google-genai` Python SDK
* **Credentials Manager**: Python Dotenv (environment variables management)

---

## ⚙️ Configuration & Setup

### Prerequisites
* **Python**: `3.9` or higher
* **pip**: package installer

### 1. Environment Configuration
Create a `.env` file in the project's root directory:

```env
# Gemini API Key (Required for Gemini forensic reports)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Dependency Installation
Install the required packages using pip:
```bash
pip install -r requirements.txt
```

### 3. Running the Application
Launch the Streamlit app locally:
```bash
streamlit run app_streamlit.py
```
This will open the dashboard in your default browser at `http://localhost:8501`.

---

## ☁️ Deployment

### 🟢 Streamlit Community Cloud (Free Hosting)
1. Push your repository files (`app_streamlit.py`, `requirements.txt`, etc.) to GitHub.
2. Sign up on [Streamlit Community Cloud](https://share.streamlit.io/).
3. Connect your repository and select `app_streamlit.py` as the main entry point.
4. Click **Advanced Settings** and add your environment variable under Secrets:
   ```toml
   GEMINI_API_KEY = "AIzaSy..."
   ```
5. Click **Deploy!**
