# Trading Strategy Scanners

A comprehensive collection of automated scanners for identifying high-probability trading setups using technical analysis.

## 📊 Scanners Included

### 1. Breakout Scanner - 5000x Trading Strategy
Identifies stocks with explosive breakout potential using 6 key criteria:
- Market Leader (relative strength)
- First Major Breakout (initial break from consolidation)
- New 6-Month Highs (breaking historical resistance)
- Volume Confirmation (2x+ average volume surge)
- Strong Momentum (10%+ daily gains)
- Trend Confirmation (above 200-day MA)

### 2. GCR Inflection Point Scanner *(NEW)*
Contrarian trading strategy based on GCR's philosophy: **"Most people are wrong at EXTREME situations"**

Key signals:
- **Sentiment Extremes** - RSI/Stochastic overbought/oversold
- **Volume Exhaustion** - Climactic volume at tops/bottoms
- **Price Extremes** - Bollinger Band touches
- **Divergence Detection** - Price vs momentum disagreement
- **"Sell the News"** - Identifies when narratives peak

---

## 📁 Files Included

### Breakout Scanner
- `breakout_scanner.pine` - TradingView Pine Script indicator
- `breakout_scanner_thinkscript.txt` - ThinkOrSwim scanner code

### GCR Inflection Scanner
- `GCR_Strategy_Scanner_TradingView.pine` - TradingView Pine Script indicator
- `GCR_Strategy_Scanner_ThinkScript.ts` - ThinkOrSwim scanner code
- `GCR_ThinkScript_Scanner_Queries.txt` - Ready-to-use scanner queries

---

## 📊 Platforms Supported

### TradingView (Recommended for Crypto)
- ✅ Easy setup with Pine Script
- ✅ Built-in screener functionality
- ✅ Real-time alerts
- ✅ Mobile app support

### ThinkOrSwim (Recommended for Stocks)
- ✅ Professional-grade scanning
- ✅ ThinkScript implementation
- ✅ Integration with TD Ameritrade/Schwab
- ✅ Advanced backtesting

---

## 🚀 Quick Start

### TradingView Setup
1. Open TradingView chart
2. Click "Pine Editor"
3. Copy/paste desired `.pine` file
4. Click "Add to Chart"
5. Set up alerts

### ThinkOrSwim Setup
1. Open TOS > Scan > Stock Hacker
2. Add Custom Study Filter
3. Paste scan code from `.txt` or `.ts` file
4. Save and run scan

---

## 🎯 GCR Strategy Overview

Based on GCR's legendary contrarian trades (shorting DOGE at SNL appearance, LUNA before collapse):

### Core Philosophy
1. **Reflexivity** - Sentiment affects fundamentals, creating feedback loops
2. **Contrarian at Extremes** - When crowd is euphoric → sell; when fearful → buy
3. **"Sell the News"** - Catalyst → Frenzy → Inflection Point

### Signal Definitions

| Signal | Conditions |
|--------|------------|
| **Bearish Inflection** | RSI ≥ 75 + Volume spike + Price at upper BB |
| **Bullish Inflection** | RSI ≤ 25 + Volume spike + Price at lower BB |
| **Strong Signal** | Above + Divergence + Volume exhaustion |

### GCR Score Interpretation
| Score | Interpretation |
|-------|----------------|
| +50 to +100 | Strong bullish (extreme oversold) |
| -50 to -100 | Strong bearish (extreme overbought) |
| -25 to +25 | Neutral |

---

## 📈 Risk Management

**Position Sizing:**
- Max 5% of portfolio per position
- Max 3 concurrent positions
- Use stop losses on every trade

**Entry Rules:**
- ✓ Wait for confirmation candle
- ✓ Enter on pullback to key level
- ✗ Don't chase extended moves
- ✗ Don't enter without volume

**Exit Rules:**
- Take partial profits at targets
- Trail remaining with stop
- Hard stop: -7% to -10% maximum loss

---

## ⚠️ Disclaimer

These scanners are for educational purposes only. Past performance does not guarantee future results. Trading involves substantial risk of loss. Always:
- Do your own research
- Use proper risk management
- Start with small positions
- Never risk more than you can afford to lose

---

## 📝 License

MIT License - Feel free to use, modify, and distribute.

## 🌟 Tags

`trading` `stock-scanner` `crypto-scanner` `momentum` `breakout` `contrarian` `pinescript` `thinkscript` `fintech` `technical-analysis` `day-trading` `swing-trading` `tradingview` `thinkorswim`

---

**Built with:** TradingView Pine Script v5 | ThinkScript  
**Strategies:** 5000x Breakout Method | GCR Inflection Point  
**Author:** Jermaine Ragsdale  
**Last Updated:** January 2025
