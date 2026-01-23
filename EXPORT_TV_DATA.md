# How to Export TradingView Data for Python Optimizer

## Method 1: Using the Data Exporter Indicator (Recommended)

### Step 1: Add the Indicator
1. In TradingView, open Pine Editor (bottom panel)
2. Click "Open" and select `data_exporter.pine` from this folder
   - OR copy/paste the code from `data_exporter.pine`
3. Click "Add to Chart"

### Step 2: Configure and Export
1. Make sure you're on MNQ 5-minute chart
2. Click the indicator settings (gear icon)
3. Set "Bars to Export" to desired amount (2000 is good)
4. Go to **View > Pine Logs** (or press Cmd+Shift+P and type "Pine Logs")
5. You'll see the CSV data in the logs

### Step 3: Save the Data
1. In Pine Logs, click the **copy icon** (top right of the logs panel)
2. Open a text editor (TextEdit, VS Code, etc.)
3. Paste the data
4. Save as `mnq_data.csv` in the trading-breakout-scanner folder

### Step 4: Run the Optimizer
```bash
cd /Users/jermaineragsdale/Documents/jmragsdale/trading-breakout-scanner
source optimizer_env/bin/activate
python displacement_wick_optimizer.py --data mnq_data.csv
```

---

## Method 2: Manual Copy from Data Window

If the indicator approach doesn't work:

1. Press `Alt+D` (or `Option+D` on Mac) to open Data Window
2. Hover over each bar and manually record OHLCV
3. This is tedious but works for small datasets

---

## Method 3: Use a Third-Party Tool

- **TradingView Data Downloader** browser extensions
- **tvDatafeed** Python library: `pip install tvDatafeed`

Example with tvDatafeed:
```python
from tvDatafeed import TvDatafeed, Interval

tv = TvDatafeed()
data = tv.get_hist('MNQ1!', 'CME_MINI', interval=Interval.in_5_minute, n_bars=2000)
data.to_csv('mnq_data.csv')
```

---

## CSV Format Expected

The optimizer expects these columns (case-insensitive):
```
time,open,high,low,close,volume
2024-01-15 09:30,17500.25,17505.50,17498.00,17503.75,1234
2024-01-15 09:35,17503.75,17510.00,17502.00,17508.25,987
```

Column names can be: time/date/datetime, open/o, high/h, low/l, close/c, volume/v
