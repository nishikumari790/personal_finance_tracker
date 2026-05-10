# FinFlow — Personal Finance Tracker
### Expense & Budget Manager Web Application

> Built with HTML5 · CSS3 · JavaScript ES6+ · Chart.js

---

## Project Overview

FinFlow is a fully responsive, browser-based Personal Finance Tracker that helps users manage daily expenses, set monthly budgets, and visualise spending patterns through interactive charts. Built with vanilla HTML5, CSS3, and JavaScript ES6+, it requires no backend or build tools and runs entirely in the browser with data persisted via LocalStorage.

| Field          | Details                                      |
|----------------|----------------------------------------------|
| Project Name   | FinFlow — Personal Finance Tracker           |
| Internship     | Frontend Web Development Internship Task     |
| Duration       | 15 Days                                      |
| Version        | 1.0.0                                        |
| License        | MIT                                          |

---

## Features

### Core Features
- Add, edit, and delete expenses (Title, Amount, Category, Date)
- Set a monthly budget and track remaining balance in real time
- Colour-coded budget progress bar (green → yellow → red)
- Summary dashboard — Total Spent, Budget Left, Transaction Count, Daily Average
- Search expenses by name or category
- Filter expense list by category dropdown
- Data persistence via LocalStorage (survives page refresh)

### Data Visualisation
- Doughnut chart — spending distribution by category
- Bar chart — daily spending for the last 7 days

### Bonus Features
- Dark / Light mode toggle
- Export all expenses as CSV
- Smooth CSS animations and micro-interactions
- Fully responsive for mobile, tablet, and desktop

---

## Technologies Used

| Technology      | Purpose                                             |
|-----------------|-----------------------------------------------------|
| HTML5           | Page structure and semantic markup                  |
| CSS3            | Styling, animations, CSS variables, responsive design|
| JavaScript ES6+ | App logic, DOM manipulation, event handling         |
| Chart.js 4.4    | Doughnut and bar chart visualisations               |
| LocalStorage    | Client-side data persistence                        |
| Google Fonts    | Syne (headings) + DM Mono (body) typefaces          |

---

## Project File Structure

```
finflow/
├── index.html     # HTML structure
├── style.css      # All styles and responsive rules
├── script.js      # JavaScript logic
└── README.md      # Project documentation
```

---

## Setup & Installation

### Option 1 — Open Locally (Easiest)
1. Download or clone this repository
2. Open the project folder
3. Double-click `index.html` to open it in your browser
4. No build step, server, or install required

### Option 2 — Clone via Git
```bash
git clone https://github.com/your-username/finflow.git
cd finflow
open index.html     # macOS
start index.html    # Windows
```

### Option 3 — Deploy to GitHub Pages
1. Push all files to a GitHub repository
2. Go to **Settings → Pages**
3. Set Source to `main` branch, root folder
4. Click **Save** — your app is live at `https://username.github.io/finflow`

---

## How to Use

### 1. Set Your Monthly Budget
Enter a budget amount in the Monthly Budget panel and click **Set →**. The Budget Left card and progress bar update immediately.

### 2. Add an Expense
Fill in Title, Amount, Date, and Category fields, then click **+ Add Expense**. The transaction appears in the list instantly and all summary cards update.

### 3. Edit or Delete an Expense
Click the **✎** icon to open the edit modal. Click **✕** to delete an entry.

### 4. Search & Filter
Use the search box to find expenses by title or category. Use the category dropdown to show only a specific category.

### 5. Read the Charts
- **Doughnut chart** — spending split by category; hover for amounts
- **Bar chart** — daily spending for the last 7 days; today is highlighted

### 6. Export Data
Click the **⬇** button in the header to download all expenses as a `.csv` file.

---

## Evaluation Criteria

| Criterion                      | Weight |
|--------------------------------|--------|
| UI/UX & Design                 | 25%    |
| Functionality                  | 30%    |
| Code Quality                   | 20%    |
| Data Handling (LocalStorage)   | 15%    |
| GitHub & Presentation          | 10%    |

---

## Future Enhancements
- Multi-month view with month selector
- Income tracking and net savings calculation
- Recurring expense support
- Budget per category
- PWA (offline use + home-screen install)
- Import CSV / bank statement parsing
- Cloud sync via Firebase

---

## Author

Built as part of a 15-day Frontend Web Development Internship task.

- GitHub: https://github.com/your-username
- Live Demo: https://your-username.github.io/finflow

---

*Made with ♥ using HTML5, CSS3, and JavaScript*  
*FinFlow © 2025 — MIT License*
