# Historical research snapshots

This folder documents the single retained historical dataset/result set from the repository before its Pine-only cleanup. The files were moved from the repository root into `snapshots/` without changing their bytes.

| File | SHA-256 |
| --- | --- |
| [best_parameters.txt](snapshots/best_parameters.txt) | `37021ae9e389e8f6ed617076e4ba7cd059e3cd4d333c797df1b263c95775eeee` |
| [mnq_data.csv](snapshots/mnq_data.csv) | `76d27fe283698a8bc3de79b57a5261bf15b3f17bcabe1d44dd4040a152ac856c` |
| [optimized_trades.csv](snapshots/optimized_trades.csv) | `31e28b27216be679e1cee65b1b80d94ee34c56bc0615538c4a5b4285a9862bcd` |

`best_parameters.txt` records a historical optimizer selection with 38 trades, 52.63% win rate, profit factor 3.056 and $721.50 modeled P&L. These are saved, unverified outputs of the separate Python displacement-wick research model. Exact cost treatment, an untouched test period, source/runtime parity and original market-data provenance were not established during this cleanup. They are not results of the breakout or GCR Pine indicators and are not current parameter recommendations.

The optimizer writes new parameter/trade files to its working directory. Run it from ignored `results/` and keep new input exports in ignored `local-data/`; see the [CSV workflow](../EXPORT_TV_DATA.md). Do not duplicate these snapshots into another repository or overwrite them with a new experiment.
