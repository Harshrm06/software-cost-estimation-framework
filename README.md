# Software Cost Estimation Framework

A modern, full-stack application designed to estimate software development effort and cost using a hybrid approach. It combines traditional algorithmic models (COCOMO) with advanced Machine Learning Stacking Ensembles to provide highly accurate predictions.

## 🚀 Key Features
- **Smart Hybrid AI Estimation:** Combines Random Forest, Gradient Boosting, and MLP via a Stacking Regressor.
- **COCOMO Benchmarking:** Real-time comparison with traditional organic COCOMO models.
- **Automated Demo Notifications:** Integrated lead capture with automated email notifications using Nodemailer and Gmail.
- **Dynamic Project Tiers:** Support for Prototype MVP, Growth MVP, and Commercial Platforms.
- **PDF Export:** Generate professional project cost reports instantly.
- **Lead Capture:** Automated "Book a Demo" workflow for enterprise project planning.

## 🛠️ Technology Stack

### Backend
- **Language:** Python 3.x
- **Framework:** FastAPI
- **Machine Learning:** Scikit-learn (StackingRegressor, RandomForest, GradientBoosting, MLP)
- **Data Handling:** Pandas, NumPy, Joblib
- **API Server:** Uvicorn

### Frontend
- **Framework:** Next.js 15+ (App Router)
- **Email Service:** Nodemailer (Gmail SMTP)
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Visualization:** Recharts

## 📁 Project Structure

```text
├── api.py                  # FastAPI Backend Server
├── train_real_model.py     # ML Model Training Script (Stacking Ensemble)
├── data_preprocessing.py   # Data Cleaning and Preparation
├── ml_model_training.py    # Alternative ML training scripts
├── saved_models/           # Serialized models and scalers
└── frontend/               # Next.js Application
    ├── src/app/api/        # Server-side API Routes (Demo Requests)
    ├── src/app/page.tsx    # Main Dashboard Logic
    └── .env.local          # Environment Configuration
```

## ⚙️ Getting Started

### 1. Backend Setup
1. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```
2. Install dependencies: `pip install -r requirements.txt`
3. Train the models: `python train_real_model.py`
4. Start the API: `uvicorn api:app --reload`

### 2. Frontend Setup
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Configure environment: Create `.env.local`
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   GMAIL_USER=your-email@gmail.com
   GMAIL_PASS=your-app-password
   ADMIN_EMAIL=admin@example.com
   ```
4. Start the dev server: `npm run dev`

## 📊 Estimation Models
- **COCOMO (Organic):** Traditional effort model based on KLOC.
- **Smart Hybrid AI:** A meta-model (Ridge) that learns from the predictions of multiple base learners trained on industry datasets (China/Desharnais).

## 📜 Recent Updates
- ✅ **Automated Email Routing:** Implemented dual-email flow (User Confirmation + Admin Alert) using Nodemailer.
- ✅ **Refined Project Selection:** Added specific project tiers (MVP vs Commercial) and integration needs.
- ✅ **Enhanced Validation:** Strict email validation and submission loading states.
- ✅ **UI Polishing:** Improved modal UX, glassmorphism effects, and success messaging.

---
*Created for Software Engineering Course Project*
