# Hybrid-RAG Adaptive Firewall for Recurring Payment Abuse Detection (Phase-III)

## Team

**Team Name:** KILZCODE  
**Team Members:**
- Mr. Simar Singh Rayat
- Mr. Sujal Thapa
- Mr. Prins Kanyal

---

## Problem Statement

![Figure 1](Phase3_images/Venn.png)

Figure 1 shows the 'Adversarial Merchants' are actively evading recurring payment detection by continuously shifting their behavioral patterns, which causes conventional static rule systems to fail. In real payment environments, merchant tactics evolve rapidly, and these frequent pattern shifts break rule-based filters that depend on stable heuristics. Additionally, behavioral clustering becomes unstable due to user drift, where customer payment behavior changes over time and disrupts previously learned groupings. Another major challenge is that recurring transaction streams often contain a low signal-to-noise ratio, meaning malicious indicators are subtle and buried within legitimate recurring payments. As a result, detection is delayed and systems suffer from higher false negatives, allowing suspicious or hidden-charge behavior to persist longer before being flagged.

**Key challenges highlighted:**
- Adversarial merchants bypass recurring payment detection
- Patterns shift frequently, breaking static rules
- Behavioral clustering becomes unstable due to user drift
- Recurring data has low signal-to-noise
- Outcomes include delayed detection and higher false negatives

---

## Core Objective

![Figure 2](Phase3_images/Topology.png)


Recurring payments are rising rapidly, and attacks on subscription and autopay systems are becoming more stealthy and adaptive. Merchant patterns are increasingly designed to evade static detection, and user behavior drift causes clusters to break and become unreliable as a long-term detection strategy. Because of this, the system must not only detect suspicious recurring behaviors but also remain robust against changing conditions in both merchant tactics and user spending behavior. Therefore, the core objective of this project is to develop an adaptive and explainable firewall capable of detecting recurring payment abuse and hidden-charge activity with improved reliability in evolving environments, as shown in Figure 2.

**Objectives of the proposed solution:**
- Support rising recurring payments and modern threat trends
- Detect stealthy and adaptive attacks
- Prevent merchant evasion against static detection
- Handle user behavior drift and cluster instability
- Provide an adaptive and explainable detection firewall

---

## Literature Review

A literature review was conducted to support evaluation design and model benchmarking using widely adopted machine learning evaluation metrics, imbalance learning strategies, and diagnostic plotting approaches. The referenced works provide foundations for ROC analysis, precision-recall curves under imbalanced data, synthetic over-sampling (SMOTE), balanced accuracy, and correlation-based evaluation metrics.

---

## Proposed Methodology (Phase-I)

Phase-I introduces the initial conceptual architecture for the Hybrid-RAG approach. The proposed design frames the problem as a recurring payment abuse detection task that requires both adaptive detection logic and explainability. The system architecture is represented as a Hybrid-RAG framework intended for malicious and hidden script assessment, capturing the need for a structured pipeline that can evolve with merchant strategies and user behavior changes.

### Figure.3. Proposed Hybrid-RAG Architecture (Phase-I)

![Figure A: Proposed Hybrid-RAG Architecture (Phase-I)](Phase3_images/Methodology_I.png)

**Figure A (Detailed Description):**  
This figure represents the Phase-I conceptual architecture of the proposed Hybrid-RAG (Retrieval Augmented Framework Architecture for Malicious and Hidden Script Assessment). It establishes the foundation of the solution, positioning RAG as a key layer for enhanced reasoning and explainability while acknowledging the real-world conditions where static rules fail. The figure reflects the need to build a system that can detect suspicious recurring payment behavior patterns while remaining interpretable and adaptable under adversarial dynamics.

---

## Proposed Methodology (Phase-II)
Phase-II refines and expands the architectural view of the Hybrid-RAG framework. The focus remains on detecting malicious or hidden charge patterns, but the architecture becomes more aligned toward operational integration and structured detection components. The Phase-II representation communicates how the proposed system moves beyond a conceptual approach into a more detailed and modular structure that supports hybrid decision logic.

### Figure B — Proposed Hybrid-RAG Architecture (Phase-II)

![Figure B: Proposed Hybrid-RAG Architecture (Phase-II)](Phase3_images/Methodology_II.png)

**Figure B (Detailed Description):**  
This figure represents the Phase-II refined architecture of the proposed Hybrid-RAG (Retrieval Augmented Framework Architecture for Malicious and Hidden Script Assessment). It strengthens the system-level organization and indicates how the framework is structured to operate under shifting merchant patterns and user drift. The Phase-II methodology emphasizes improved alignment between detection stages and explainability, showing the evolution from Phase-I into a more implementation-ready architecture.

---

## Proposed Methodology (Phase-III) — End-to-End Execution
Phase-III defines the complete end-to-end operational workflow for the proposed Hybrid-RAG detection pipeline. This phase represents how recurring subscription and autopay transaction data is ingested, processed, analyzed, and evaluated. Phase-III ensures the system can detect suspicious and hidden-charge activity through a hybrid approach that combines similarity-based signals, monitoring signals, machine learning classification, and retrieval augmentation for reasoning. It also includes the evaluation loop needed to validate performance targets and iteratively tune the pipeline if outcomes are not satisfactory.

### Phase-III Steps (Pipeline Definition)
The Phase-III methodology follows these exact steps:

- **Step 1: Collect recurring autopay transaction data**
  - Includes merchant name conflicts, which is a known practical challenge in real-world recurring payment streams.

- **Step 2: Preprocess and label data**
  - Data is labeled into:
    - **Legit**
    - **Suspicious / Hidden-charge**

- **Step 3: Run the proposed hybrid pipeline**
  - The hybrid pipeline includes:
    - **Similarity**
    - **FMR**
    - **ML**
    - **RAG**

- **Step 4: Compute key performance metrics**
  - Metrics computed include:
    - **F1 Score**
    - **FPR / FNR**
    - **Latency**
    - **Throughput**

- **Step 5: Validate targets**
  - If targets are not met:
    - tune the pipeline parameters
    - repeat evaluation until the system stabilizes

---

## Phase-III Workflow Flowchart
To present the Phase-III pipeline in a clear operational sequence, the following flowchart depicts the complete execution structure from input data to evaluation and tuning.

### Figure 1 — Phase-III Flowchart (Execution Pipeline)

![Figure 1: Phase-III Execution Pipeline Flowchart](Phase3_images/Flowchart.png)

**Figure 1 (Detailed Description):**  
This flowchart illustrates the Phase-III end-to-end workflow for recurring payment abuse detection. It reflects the full operational structure: collecting recurring autopay transactions (including merchant conflicts), preprocessing and labeling transactions into legit versus suspicious/hidden-charge classes, executing the hybrid pipeline (Similarity + FMR + ML + RAG), and then computing key metrics such as F1 score, FPR/FNR, latency, and throughput. The final part of the flowchart highlights the validation loop where performance targets are checked, and the pipeline is tuned and re-evaluated if the detection objectives are not achieved.

---

## Mathematical Abbreviation

This section contains the mathematical abbreviations and metric terminology used throughout the evaluation and discussion of the proposed system. These abbreviations support analysis of classification outcomes and operational performance under real transaction conditions.

---

## Merchant Behaviour Scoring

Merchant behaviour scoring is a core analytical component used to quantify and rank merchant transaction behavior patterns. This scoring helps differentiate stable recurring subscriptions from suspicious or hidden-charge behaviors by capturing signals that indicate abnormal recurrence patterns, merchant inconsistencies, and changes in transaction characteristics across time. The scoring approach is aligned with the project’s objective of developing an adaptive detection firewall that can operate under frequent drift and adversarial modifications.

---

## RAG Based RFMV Equation

The system incorporates an RAG-based RFMV equation approach to combine structured features with retrieval-augmented reasoning. This component supports improved context awareness for recurring payment behaviors by incorporating monitoring-style feature dynamics and applying retrieval augmentation to strengthen confidence and interpretability. The RFMV representation is intended to enhance detection robustness in cases where static detection rules fail and where transaction behavior patterns are subtle or masked.

---

## Results and Discussion

The Results and Discussion section presents outputs of the experimental evaluation of the proposed Hybrid-RAG pipeline. The results demonstrate how the proposed architecture performs under recurring payment monitoring conditions and highlight the detection patterns observed across multiple result outputs.

### Figure 2 — Result Output 1

![Figure 2: Result Output 1](Phase3_images/Result1.png)

**Figure 2 (Detailed Description):**  
This result figure represents the first observed output from the evaluation stage of the proposed pipeline. It contributes to the Results and Discussion section by demonstrating how the system behaves when applied to recurring transaction data labeled into legit versus suspicious/hidden-charge categories. The figure supports analysis of detection trends and provides evidence of performance behavior under the hybrid detection approach.

---

### Figure 3 — Result Output 2
![Figure 3: Result Output 2](Phase3_images/Result2.png)

**Figure 3 (Detailed Description):**  
This figure provides a second experimental output in the Results and Discussion section. It supports the evaluation by presenting another perspective of system performance under the Phase-III hybrid pipeline execution, allowing comparative analysis of detection stability and classification behavior when monitoring recurring payment patterns with adversarial conditions.

---

### Figure 4 — Result Output 3
![Figure 4: Result Output 3](Phase3_images/Result3.png)

**Figure 4 (Detailed Description):**  
This figure represents the third recorded output from the evaluation of the Hybrid-RAG methodology. It contributes to understanding how suspicious or hidden-charge recurring patterns are surfaced by the pipeline and supports qualitative discussion around how the approach improves detection outcomes compared to static systems that struggle under drift and low signal-to-noise recurring transaction conditions.

---

### Figure 5 — Result Output 4
![Figure 5: Result Output 4](Phase3_images/Result4.png)

**Figure 5 (Detailed Description):**  
This figure represents an additional experimental outcome used in the Results and Discussion section. It supports performance reporting by illustrating detection behavior under real-world complexities, including merchant inconsistency and evolving recurring patterns. The output helps reinforce the value of using a hybrid approach that integrates similarity scoring, monitoring signals, machine learning, and retrieval augmentation.

---

### Figure 6 — Result Output 5
![Figure 6: Result Output 5](Phase3_images/Result5.png)

**Figure 6 (Detailed Description):**  
This result figure represents the fifth output included in the experimental results. It is included to strengthen the Results and Discussion section by providing broader output coverage of detection performance under Phase-III. This figure contributes additional evidence for system performance patterns and reinforces the need for adaptive, explainable detection when recurring data contains subtle malicious indicators.

---

## Comparative Performance Analysis

The Comparative Performance Analysis section evaluates and positions the proposed approach against alternative detection perspectives. The objective is to highlight how the Hybrid-RAG strategy improves detection reliability in environments where:
- merchant patterns evolve frequently,
- user behavior drifts over time,
- static rules break,
- and signal quality is low.

This section focuses on performance comparison using classification metrics and operational constraints, emphasizing the improvement and stability gained through the hybrid pipeline framework.

---


## References
The following references support evaluation design, metric selection, imbalance learning, and classifier benchmarking:

1. Fawcett, T. (2006). An introduction to ROC analysis. Pattern Recognition Letters, 27(8), 861–874.  
2. Powers, D. M. W. (2011). Evaluation: From precision, recall and F-measure to ROC, informedness, markedness & correlation. Journal of Machine Learning Technologies, 2(1), 37–63.  
3. Saito, T., & Rehmsmeier, M. (2015). The Precision-Recall plot is more informative than the ROC plot when evaluating binary classifiers on imbalanced datasets. PLOS ONE, 10(3), e0118432.  
4. Chawla, N. V., Bowyer, K. W., Hall, L. O., & Kegelmeyer, W. P. (2002). SMOTE: Synthetic Minority Over-sampling Technique. Journal of Artificial Intelligence Research, 16, 321–357.  
5. He, H., & Garcia, E. A. (2009). Learning from imbalanced data. IEEE Transactions on Knowledge and Data Engineering, 21(9), 1263–1284.  
6. Japkowicz, N., & Stephen, S. (2002). The class imbalance problem: A systematic study. Intelligent Data Analysis, 6(5), 429–449.  
7. Van Hulse, J., Khoshgoftaar, T. M., & Napolitano, A. (2007). Experimental perspectives on learning from imbalanced data. Proceedings of ICML.  
8. Batista, G. E. A. P. A., Prati, R. C., & Monard, M. C. (2004). A study of the behavior of several methods for balancing machine learning training data. SIGKDD Explorations, 6(1), 20–29.  
9. Davis, J., & Goadrich, M. (2006). The relationship between Precision-Recall and ROC curves. Proceedings of ICML.  
10. Hand, D. J., & Till, R. J. (2001). A simple generalisation of the area under the ROC curve for multiple class classification problems. Machine Learning, 45, 171–186.  
11. Brodersen, K. H., Ong, C. S., Stephan, K. E., & Buhmann, J. M. (2010). The balanced accuracy and its posterior distribution. Proceedings of ICPR.  
12. Boughorbel, S., Jarray, F., & El-Anbari, M. (2017). Optimal classifier for imbalanced data using Matthews correlation coefficient metric. PLOS ONE, 12(6), e0177678.  
13. Chicco, D., & Jurman, G. (2020). The advantages of the Matthews correlation coefficient (MCC) over F1 score and accuracy in binary classification evaluation. BMC Genomics, 21, 6.  
14. Kuhn, M., & Johnson, K. (2013). Applied Predictive Modeling. Springer.  
15. Hastie, T., Tibshirani, R., & Friedman, J. (2009). The Elements of Statistical Learning. Springer.  
16. Bishop, C. M. (2006). Pattern Recognition and Machine Learning. Springer.  
17. Murphy, K. P. (2012). Machine Learning: A Probabilistic Perspective. MIT Press.  
18. Pedregosa, F., et al. (2011). Scikit-learn: Machine learning in Python. Journal of Machine Learning Research, 12, 2825–2830.  
19. King, G., & Zeng, L. (2001). Logistic regression in rare events data. Political Analysis, 9(2), 137–163.  
20. Brank, J., Grobelnik, M., & Mladenić, D. (2002). A survey of ontology evaluation techniques. Proceedings of the Conference on Data Mining and Data Warehouses (SiKDD).  

---

## Thank You
Thank you for reviewing our proposed Hybrid-RAG framework and Phase-III execution pipeline.
