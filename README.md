 LCS Tool — Longest Common Subsequence Analyzer
A visually stunning, browser-based tool to compare two texts using the Longest Common Subsequence (LCS) dynamic programming algorithm — featuring a live DP matrix, similarity scoring, and plagiarism-style highlighting.

LCS Tool Vanilla No Dependencies

 Overview
The LCS Tool is an interactive web-based application that compares two input texts and identifies their Longest Common Subsequence (LCS). It visually demonstrates how dynamic programming works by displaying the DP matrix and highlighting matching sequences.

 Objective
The objective of this project is to implement and visualize the Longest Common Subsequence algorithm using dynamic programming. It helps users understand string similarity and sequence matching through an intuitive and interactive interface.

 Applications
Plagiarism detection systems
DNA sequence analysis in bioinformatics
Version control diff tools (like Git)
Text comparison and document similarity analysis
 Technologies Used
HTML5
CSS3 (Glassmorphism UI)
JavaScript (Vanilla JS)
Concepts Used
Dynamic Programming
String Matching Algorithms
Time & Space Complexity Analysis
Frontend Development (UI/UX)
 Features
Feature	Description
 Dual Text Editor	Paste text, type, or upload .txt files
 Char / Word Mode	Toggle between character-level and word-level comparison
 Case Sensitivity	Optional case-sensitive matching
Similarity Score	Percentage score with animated meter
 LCS Highlighting	Highlights matching tokens
 DP Matrix Viewer	Full dynamic programming table
 Matrix Animation	Step-by-step DP table filling
 About Section	Explanation of algorithm
 System Architecture
The system is a client-side web application:

Frontend Layer → HTML, CSS (UI Design)
Logic Layer → JavaScript (LCS Algorithm using Dynamic Programming)
Visualization Layer → DP Matrix rendering & highlighting
Flow:
User Input → Algorithm Processing → DP Matrix → Result Visualization

 Project Structure
lcs-tool/
├── index.html   # Main UI
├── style.css    # Styling and animations
├── app.js       # LCS logic and visualization
└── README.md    # Documentation
 Getting Started
No installation required.

git clone https://github.com/your-username/lcs-tool.git
cd lcs-tool
Open in browser:

start index.html
Or simply double-click index.html.

 Algorithm Explanation
Recurrence Relation
If A[i] == B[j]:
    dp[i][j] = dp[i-1][j-1] + 1

Else:
    dp[i][j] = max(dp[i-1][j], dp[i][j-1])
Traceback
↖ Diagonal → Match
↑ Up → Skip from A
← Left → Skip from B
 Complexity Analysis
Metric	Value
Time Complexity	O(m × n)
Space Complexity	O(m × n)
Similarity Formula	LCS / max(lenA, lenB) × 100
 Design
Theme: Dark Glassmorphism
Primary Colors: Purple (#7c6bff), Cyan (#00d4ff)
Fonts: Inter, JetBrains Mono
Fully responsive design
 Usage Tips
Use Word Mode for large text comparison
Use Character Mode for precise matching
DP Matrix display is limited for performance
Upload .txt files directly
 Conclusion
This project successfully demonstrates the implementation of the Longest Common Subsequence algorithm using dynamic programming. The visualization makes it easier to understand complex algorithmic behavior and improves learning through interaction.

 Future Scope
Optimize for very large inputs
Add Levenshtein Distance comparison
Export results as PDF
Backend integration for saving comparisons
AI-based similarity enhancements
 License
MIT License — free to use, modify, and distribute.
