# UrgentLyfe Machine Learning & AI Notebooks

This folder contains data science workflows, model exploration, and feature engineering scripts for the UrgentLyfe platform.

## 📊 Notebook Catalog

### 1. `MODAL_TRAIN.ipynb`
- **Objective**: Random Forest & Gradient Boosted Classification for Service Failure & Anomaly Detection.
- **Frameworks**: `scikit-learn`, `pandas`, `numpy`, `matplotlib`, `seaborn`.
- **Target Metrics**: 95%+ Precision on Urgent Emergency vs Regular maintenance routing.
- **Export Target**: Converted into TypeScript real-time inference engines under `ml_models/pricing/` and `ml_models/matching/`.

---

## 🛠️ TypeScript Inference Engines
All trained decision logic and dynamic curves have been translated into zero-dependency, ultra-low-latency TypeScript engines located in `ml_models/`:
- **`PricingEngine`** (`ml_models/pricing/pricingEngine.ts`) — Real-time price elasticity, surge pricing & GST calculator.
- **`PartnerMatcher`** (`ml_models/matching/partnerMatcher.ts`) — Multi-objective partner ranking & urban ETA predictor.
- **`AnomalyDetector`** (`ml_models/anomaly_detector/anomalyDetector.ts`) — Velocity fraud shield & high-risk payment classifier.
- **`IntentClassifier`** (`ml_models/nlp/intentClassifier.ts`) — NLP search parser & emergency detector.
- **`SentimentScorer`** (`ml_models/sentiment/sentimentScorer.ts`) — Customer review polarity & satisfaction analyzer.
