import os
import math
import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up page configurations
st.set_page_config(
    page_title="Customer Churn Analytics & Prediction Console",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Apply sleek styling custom CSS
st.markdown("""
    <style>
    .main {
        background-color: #0c1015;
        color: #f8fafc;
    }
    div[data-testid="stSidebar"] {
        background-color: #0c1015;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
    div.stButton > button {
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        transition: all 0.3s ease;
    }
    div.stButton > button:hover {
        opacity: 0.9;
        transform: scale(1.02);
    }
    .metric-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 20px;
        border-radius: 16px;
        margin-bottom: 20px;
    }
    </style>
    """, unsafe_allow_name_changes=True, unsafe_allow_html=True)

# Define predictive model
def compute_risk_model(customer):
    log_odds = -1.2
    factors = []

    # Demographics
    if customer.get("SeniorCitizen") == 1:
        log_odds += 0.25
        factors.append({
            "factor": "Senior Citizen Group",
            "weight": 8,
            "description": "Seniors show higher attrition statistically.",
            "type": "increase"
        })

    if customer.get("Partner") == "No":
        log_odds += 0.15
        factors.append({
            "factor": "No Partner on Record",
            "weight": 5,
            "description": "Individual accounts show slightly higher switching tendencies.",
            "type": "increase"
        })

    if customer.get("Dependents") == "Yes":
        log_odds -= 0.2
        factors.append({
            "factor": "Family Dependents Present",
            "weight": -6,
            "description": "Family units are statistically more stable.",
            "type": "decrease"
        })

    # Tenure
    tenure = customer.get("tenure", 1)
    if tenure <= 6:
        log_odds += 1.25
        factors.append({
            "factor": "Critical Onboarding Window (<= 6 mos)",
            "weight": 35,
            "description": "First 6 months represent high transaction volatility.",
            "type": "increase"
        })
    elif tenure <= 12:
        log_odds += 0.6
        factors.append({
            "factor": "Early Lifecycle Phase (6-12 mos)",
            "weight": 18,
            "description": "Early stage accounts undergo secondary evaluation cycles.",
            "type": "increase"
        })
    elif tenure > 48:
        log_odds -= 1.1
        factors.append({
            "factor": "High Customer Loyalty (> 4 yrs)",
            "weight": -30,
            "description": "Long-term relationships heavily insulate against churn.",
            "type": "decrease"
        })
    else:
        log_odds -= 0.3
        factors.append({
            "factor": "Maturing Tenure",
            "weight": -10,
            "description": "Account is maturing past critical early attrition cycles.",
            "type": "decrease"
        })

    # Contract
    contract = customer.get("Contract", "Month-to-month")
    if contract == "Month-to-month":
        log_odds += 1.6
        factors.append({
            "factor": "Flexible Month-to-Month Contract",
            "weight": 42,
            "description": "No lock-in offers high switching convenience.",
            "type": "increase"
        })
    elif contract == "Two year":
        log_odds -= 1.5
        factors.append({
            "factor": "Two-Year Long Term Agreement",
            "weight": -38,
            "description": "Long-term agreement insulates account from competitive outreach.",
            "type": "decrease"
        })
    elif contract == "One year":
        log_odds -= 0.5
        factors.append({
            "factor": "One-Year Contract Guarantee",
            "weight": -15,
            "description": "Intermediate contract duration safeguards stability.",
            "type": "decrease"
        })

    # Internet Service
    internet = customer.get("InternetService", "No")
    if internet == "Fiber optic":
        log_odds += 0.85
        factors.append({
            "factor": "Fiber Optic High Broadband",
            "weight": 24,
            "description": "High-speed line associated with higher prices and sensitivity.",
            "type": "increase"
        })
    elif internet == "No":
        log_odds -= 0.8
        factors.append({
            "factor": "Basic Services Only (No Internet)",
            "weight": -22,
            "description": "Phone-only users exhibit high brand loyalty.",
            "type": "decrease"
        })

    # Add-ons
    if internet != "No":
        if customer.get("OnlineSecurity") == "No":
            log_odds += 0.35
            factors.append({
                "factor": "Lack of Online Security Package",
                "weight": 12,
                "description": "Missing digital protection lowers leaving friction.",
                "type": "increase"
            })
        elif customer.get("OnlineSecurity") == "Yes":
            log_odds -= 0.25
            factors.append({
                "factor": "Online Security Activated",
                "weight": -8,
                "description": "Security package increases service stickiness.",
                "type": "decrease"
            })

        if customer.get("TechSupport") == "No":
            log_odds += 0.4
            factors.append({
                "factor": "No Tech Support Subscription",
                "weight": 15,
                "description": "Lack of support increases frustration points.",
                "type": "increase"
            })
        elif customer.get("TechSupport") == "Yes":
            log_odds -= 0.35
            factors.append({
                "factor": "Dedicated Tech Support Service",
                "weight": -11,
                "description": "Quick support resolutions lower churn.",
                "type": "decrease"
            })

    # Payment
    payment = customer.get("PaymentMethod", "Electronic check")
    if payment == "Electronic check":
        log_odds += 0.55
        factors.append({
            "factor": "Manual Electronic Check Payments",
            "weight": 16,
            "description": "Manual monthly invoices prompt price comparisons.",
            "type": "increase"
        })
    elif payment in ["Bank transfer (automatic)", "Credit card (automatic)"]:
        log_odds -= 0.45
        factors.append({
            "factor": "Automatic Billing Activated",
            "weight": -14,
            "description": "Frictionless auto-billing lowers monthly cost reviews.",
            "type": "decrease"
        })

    # Monthly Charges
    monthly = customer.get("MonthlyCharges", 50.0)
    if monthly > 84.0:
        log_odds += 0.35
        factors.append({
            "factor": "High Billing Tariff Tier",
            "weight": 11,
            "description": "Monthly charge is in the upper tier of the customer base.",
            "type": "increase"
        })
    elif monthly < 25.0:
        log_odds -= 0.4
        factors.append({
            "factor": "Economy Billing Profile",
            "weight": -12,
            "description": "Low costs rarely lead to account cancellations.",
            "type": "decrease"
        })

    prob = 1 / (1 + math.exp(-log_odds))
    prob_pct = int(round(prob * 100))

    if prob_pct >= 55:
        category = "High"
    elif prob_pct >= 25:
        category = "Medium"
    else:
        category = "Low"

    return prob_pct, category, sorted(factors, key=lambda x: abs(x["weight"]), reverse=True)

# ----------------- UI Rendering -----------------

st.title("📊 Customer Churn Analytics & Prediction Console")
st.markdown("An interactive decision-support console for customer retention leveraging heuristic modeling and Google's Gemini Models.")

# Navigation Tabs
tab_sim, tab_bulk = st.tabs(["🎯 Individual Risk Simulator", "📂 Bulk CSV Predictor"])

with tab_sim:
    col_input, col_output = st.columns([2, 3])

    with col_input:
        st.subheader("Simulation Inputs")
        st.write("Adjust customer parameters to see changes in real-time:")
        
        # Demographics
        gender = st.radio("Gender", ["Male", "Female"], horizontal=True)
        senior = st.radio("Senior Citizen", ["Yes", "No"], horizontal=True)
        partner = st.radio("Partner", ["Yes", "No"], index=1, horizontal=True)
        dependents = st.radio("Dependents", ["Yes", "No"], index=1, horizontal=True)
        
        st.markdown("---")
        
        # Agreement
        tenure = st.slider("Account Tenure (Months)", 1, 72, 12)
        monthly_charges = st.slider("Monthly Invoice ($)", 18.0, 122.0, 65.0)
        contract = st.selectbox("Contract Duration Type", ["Month-to-month", "One year", "Two year"])
        payment = st.selectbox("Billing Mode", [
            "Electronic check", 
            "Mailed check", 
            "Bank transfer (automatic)", 
            "Credit card (automatic)"
        ])
        
        st.markdown("---")
        
        # Services
        internet = st.selectbox("Internet Service", ["DSL", "Fiber optic", "No"])
        
        if internet != "No":
            security = st.selectbox("Cyber-Security Add-on", ["Yes", "No"])
            support = st.selectbox("Tech Support Add-on", ["Yes", "No"])
        else:
            security = "No internet service"
            support = "No internet service"

        # Construct customer object
        customer = {
            "gender": gender,
            "SeniorCitizen": 1 if senior == "Yes" else 0,
            "Partner": partner,
            "Dependents": dependents,
            "tenure": tenure,
            "MonthlyCharges": monthly_charges,
            "Contract": contract,
            "PaymentMethod": payment,
            "InternetService": internet,
            "OnlineSecurity": security,
            "TechSupport": support
        }

    with col_output:
        st.subheader("Predictive Analytics Model Output")
        
        # Calculate Risk
        prob, cat, factors = compute_risk_model(customer)
        
        # Colored Indicators
        color_map = {"High": "#EF4444", "Medium": "#FBBF24", "Low": "#10B981"}
        accent_color = color_map[cat]

        # Circular Gauge Chart using Plotly
        fig = go.Figure(go.Indicator(
            mode = "gauge+number",
            value = prob,
            domain = {'x': [0, 1], 'y': [0, 1]},
            title = {'text': f"Risk Category: {cat}", 'font': {'size': 20, 'color': '#ffffff'}},
            gauge = {
                'axis': {'range': [0, 100], 'tickwidth': 1, 'tickcolor': "#ffffff"},
                'bar': {'color': accent_color},
                'bgcolor': "rgba(255,255,255,0.08)",
                'borderwidth': 2,
                'bordercolor': "rgba(255,255,255,0.15)",
                'steps': [
                    {'range': [0, 25], 'color': 'rgba(16,185,129,0.15)'},
                    {'range': [25, 55], 'color': 'rgba(251,191,36,0.15)'},
                    {'range': [55, 100], 'color': 'rgba(239,68,68,0.15)'}
                ],
            }
        ))
        fig.update_layout(
            paper_bgcolor='rgba(0,0,0,0)', 
            plot_bgcolor='rgba(0,0,0,0)',
            font={'color': "#ffffff"},
            height=280,
            margin=dict(t=30, b=0, l=10, r=10)
        )
        st.plotly_chart(fig, use_container_width=True)

        # Triggers list
        st.write("#### Statistical Risk Drivers")
        for f in factors:
            weight_str = f"+{f['weight']}%" if f['type'] == 'increase' else f"{f['weight']}%"
            weight_color = "#EF4444" if f['type'] == 'increase' else "#10B981"
            
            st.markdown(f"""
            <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 10px 15px; border-radius: 10px; margin-bottom: 8px;">
                <span style="color: {weight_color}; font-weight: bold; font-family: monospace; font-size: 14px; margin-right: 10px;">{weight_str}</span>
                <strong style="color: #ffffff;">{f['factor']}</strong>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.5);">{f['description']}</p>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("---")

        # Gemini Section
        st.write("#### 🤖 Gemini Forensic Intelligence Report")
        gemini_key = os.getenv("GEMINI_API_KEY")

        if not gemini_key:
            st.warning("⚠️ GEMINI_API_KEY environment variable not detected. AI generation is running in heuristic fallback mode.")
            
        if st.button("Generate Diagnostic Report", key="run_ai"):
            with st.spinner("Analyzing risk factors..."):
                if gemini_key:
                    try:
                        from google import genai
                        client = genai.Client(api_key=gemini_key)
                        
                        prompt = f"""
                        Analyze this customer profile:
                        {customer}
                        
                        Heuristic analysis:
                        - Churn Probability: {prob}%
                        - Risk Category: {cat}
                        - Modifying Drivers: {factors}
                        
                        Write a brief professional CRM synthesis report indicating customer vulnerabilities and 3 concrete retention strategies. Keep it clear, concise, and structured in Markdown.
                        """
                        response = client.models.generate_content(
                            model='gemini-2.5-flash',
                            contents=prompt
                        )
                        st.markdown(response.text)
                    except Exception as e:
                        st.error(f"Error querying Gemini API: {e}")
                else:
                    # Heuristic fallback mock
                    st.info("💡 **Fallback Action Plan Generated:**")
                    if cat == "High":
                        st.markdown("""
                        * **Vulnerability Analysis**: Month-to-month flexibility combined with no tech support creates immediate exit opportunities.
                        * **Retention Plan**:
                          1. **Contract Transition**: Offer a $10 credit to sign a 1-Year agreement.
                          2. **Secure Add-on**: Offer Online Security free for 6 months.
                          3. **Direct Agent Outreach**: Schedule a support team checkup.
                        """)
                    elif cat == "Medium":
                        st.markdown("""
                        * **Vulnerability Analysis**: Account represents middle-stage tenure with manual paper checks increasing monthly billing friction.
                        * **Retention Plan**:
                          1. **Auto-billing Incentives**: Provide a one-off $5 credit to link a bank account.
                          2. **Support Verification**: Send automated line checkup diagnostics.
                        """)
                    else:
                        st.markdown("""
                        * **Vulnerability Analysis**: High tenure and stable billing show very low risk.
                        * **Retention Plan**:
                          1. **Loyalty Promotion**: Send service anniversary greetings.
                        """)

with tab_bulk:
    st.subheader("Bulk File Upload")
    st.write("Ingest a CSV list of customers matching the standard schema to calculate risks in batches.")
    
    # Template download help
    st.info("👉 Expected CSV headers: `customerID`, `gender`, `SeniorCitizen`, `Partner`, `Dependents`, `tenure`, `MonthlyCharges`, `Contract`, `PaymentMethod`, `InternetService`, `OnlineSecurity`, `TechSupport`")
    
    uploaded_file = st.file_uploader("Upload CSV package", type=["csv"])

    if uploaded_file is not None:
        try:
            df = pd.read_csv(uploaded_file)
            
            # Apply prediction logic
            predictions = []
            categories = []
            
            for idx, row in df.iterrows():
                row_dict = row.to_dict()
                # Ensure fields are present and safe
                prob_row, cat_row, _ = compute_risk_model(row_dict)
                predictions.append(f"{prob_row}%")
                categories.append(cat_row)
            
            df["Calculated Risk"] = predictions
            df["Risk Tier"] = categories
            
            st.success(f"Successfully evaluated {len(df)} customer records!")
            
            # Batch stats
            col_b1, col_b2, col_b3 = st.columns(3)
            col_b1.metric("Total Batched", len(df))
            col_b2.metric("High Risk Count", categories.count("High"))
            col_b3.metric("Medium Risk Count", categories.count("Medium"))
            
            st.write("#### Prediction Results Grid")
            st.dataframe(df, use_container_width=True)
            
        except Exception as e:
            st.error(f"Error parsing file: {e}")
