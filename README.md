# Software Cost Estimation Framework

A modern, full-stack application designed to estimate software development effort and cost using a hybrid approach. It combines traditional algorithmic models (COCOMO) with advanced Machine Learning Stacking Ensembles to provide highly accurate predictions.

## 🚀 Current Status
- **Backend API:** Fully functional FastAPI service with `/predict` endpoint.
- **ML Models:** Hybrid Stacking Regressor (Random Forest + Gradient Boosting + MLP) trained on the China dataset.
- **Frontend Dashboard:** Premium Next.js interface with real-time comparison graphs and PDF export functionality.
- **Data Integration:** Automatic preprocessing of industry-standard datasets (China, Desharnais).

## 🛠️ Technology Stack

### Backend
- **Language:** Python 3.x
- **Framework:** FastAPI
- **Machine Learning:** Scikit-learn (StackingRegressor, RandomForest, GradientBoosting, MLP)
- **Data Handling:** Pandas, NumPy, Joblib
- **API Server:** Uvicorn

### Frontend
- **Framework:** Next.js 15+ (App Router)
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Visualization:** Recharts
- **Expoting:** jsPDF, html2canvas

## 📁 Project Structure

```text
├── api.py                  # FastAPI Backend Server
├── train_real_model.py     # ML Model Training Script (Stacking Ensemble)
├── data_preprocessing.py   # Data Cleaning and Preparation
├── ml_model_training.py    # Alternative ML training scripts
├── visualize_comparison.py # Model evaluation and visualization
├── china_clean.csv         # Cleaned Training Dataset
├── saved_models/           # Serialized models and scalers
└── frontend/               # Next.js Application
    ├── src/app/page.tsx    # Main Dashboard Logic
    └── src/app/globals.css # Global Styles
```

## ⚙️ Getting Started

### 1. Backend Setup
1. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Train the models (if not already present in `saved_models/`):
   ```bash
   python train_real_model.py
   ```
4. Start the API server:
   ```bash
   uvicorn api:app --reload
   ```

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📊 How It Works

The framework takes five key Function Point Analysis (FPA) parameters:
1. **External Inputs:** Data entering the application.
2. **External Outputs:** Data leaving the application.
3. **External Inquiries:** Interactive user requests.
4. **Internal Logic Files:** Data maintained within the application.
5. **External Interface Files:** Data shared with other systems.

### Estimation Models
- **COCOMO (Organic):** Based on the traditional Constructive Cost Model, converting Function Points to KLOC and then to Person-Months.
- **Smart Hybrid AI:** A meta-model (Ridge) that learns from the predictions of Random Forest, Gradient Boosting, and Neural Network models, providing a more robust estimate based on historical industry data.

## 📜 Recent Updates
- ✅ Refined UI/UX with glassmorphism effects and modern color palettes.
- ✅ Integrated PDF Export feature for quick project reports.
- ✅ Implemented Smart Stacking Ensemble for improved AI prediction accuracy.
- ✅ Added comprehensive comparison dashboards with Recharts.

---
*Created for Software Engineering Course Project*
