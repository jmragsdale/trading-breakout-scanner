# Chart CSV input for local research

Use [data_exporter.pine](data_exporter.pine) to produce chart OHLCV rows through Pine Logs. Review the chart symbol, timeframe and loaded history before export. This utility exports chart bars; it does not establish a complete or licensed historical dataset, a continuous futures roll policy or a trading result.

## Save a new export

1. Compile the exporter on the chart you intend to research.
2. Review `Bars to Export` and `Include CSV Header`.
3. Copy the CSV rows from Pine Logs, excluding log timestamps, prefixes and unrelated messages.
4. Save them as `local-data/mnq_data.csv` inside your checkout. `local-data/` is ignored by Git. Do not replace the retained historical snapshot under `research/snapshots/`.

The standard export fields are `time,open,high,low,close,volume`. The existing loader requires OHLC fields, accepts time/date/datetime/timestamp and OHLCV aliases, and parses time when present; inspect `load_csv_data` in [the optimizer source](displacement_wick_optimizer.py) for exact parsing behavior. Check timestamps, duplicates, gaps and numeric values before a run. Export source timezone and any futures contract/roll treatment must be recorded separately; the CSV alone does not establish those facts.

## Run the existing Python tool

From the repository root, the existing setup helper creates an environment and installs its listed packages:

```bash
bash setup_optimizer.sh
source optimizer_env/bin/activate
mkdir -p local-data results
cd results
python ../displacement_wick_optimizer.py --data ../local-data/mnq_data.csv
```

Running from `results/` keeps generated `best_parameters.txt` and `optimized_trades.csv` in one ignored output location. Give separate research runs their own subfolder if retaining multiple experiments. The historical tracked snapshots remain unchanged.

The script's no-`--data` branch downloads data through its existing Yahoo Finance path. This cleanup did not run either data acquisition or optimization. Parameter-search results from this separate displacement-wick model do not validate the Pine breakout/GCR indicators, another platform or future trading performance.
