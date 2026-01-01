# Breakout Scanner - 5000x Trading Strategy

A comprehensive automated scanner for identifying high-momentum stock breakouts based on proven technical analysis criteria.

## 🎯 Strategy Overview

This scanner identifies stocks with explosive breakout potential using 6 key criteria:

1. **Market Leader** - Stocks showing relative strength
2. **First Major Breakout** - Initial break from consolidation
3. **New 6-Month Highs** - Breaking historical resistance
4. **Volume Confirmation** - 2x+ average volume surge
5. **Strong Momentum** - 10%+ daily gains
6. **Trend Confirmation** - Above 200-day moving average

## 📊 Platforms Supported

### TradingView (Recommended)
- ✅ Easy setup with Pine Script
- ✅ Built-in screener functionality
- ✅ Real-time alerts
- ✅ Mobile app support

### ThinkOrSwim
- ✅ Professional-grade scanning
- ✅ ThinkScript implementation
- ✅ Integration with TD Ameritrade
- ✅ Advanced backtesting

## 🚀 Quick Start

Choose your platform:

### Option 1: TradingView Screener (No Code - 3 minutes)
1. Go to https://www.tradingview.com/screener/
2. Add filters:
   - Change %: Min 10
   - 52-Week High %: Max 2
   - Volume: Min 1,000,000
   - Relative Volume: Min 2
   - Price: Min 5
3. Set alerts for new matches

### Option 2: TradingView Pine Script (5 minutes)
1. Open TradingView chart
2. Click "Pine Editor"
3. Copy/paste `breakout_scanner.pine`
4. Click "Add to Chart"
5. Set up alerts

### Option 3: ThinkOrSwim (7 minutes)
1. Open TOS > Scan > Stock Hacker
2. Add Custom Study Filter
3. Paste scan code from `breakout_scanner_thinkscript.txt`
4. Save and run scan

## 📁 Files Included

- `breakout_scanner.pine` - TradingView Pine Script indicator
- `breakout_scanner_thinkscript.txt` - ThinkOrSwim scanner code
- `QUICK_START.md` - 5-minute setup guide
- `SETUP_GUIDE.md` - Comprehensive documentation
- `README.md` - This file

## 🎓 Strategy Criteria Explained

### 1. Market Leader
Stocks showing relative strength vs peers in their sector.

### 2. First Major Breakout
Breaking out from a consolidation base, not an extended move.

### 3. New Highs
Breaking above 6-month or all-time highs with conviction.

### 4. Volume Surge
Trading volume must be 2x or more above 20-day average.

### 5. Strong Momentum
Daily gain must exceed 10% to show buying pressure.

### 6. Above Moving Average
Price must close above 200-day MA to confirm uptrend.

## 📈 Risk Management

**Position Sizing:**
- Max 5% of portfolio per position
- Max 3 concurrent breakout positions
- Use stop losses on every trade

**Entry Rules:**
- ✓ Wait for pullback to breakout level
- ✓ Enter on first 15 minutes of breakout
- ✗ Don't chase if already up >20%
- ✗ Don't enter without catalyst

**Exit Rules:**
- Take 1/3 profit at +10%
- Take 1/3 profit at +20%
- Trail remaining with stop
- Initial stop: -7% from entry
- Hard stop: -10% maximum loss

## 🎯 Expected Performance

**Realistic Metrics:**
- Win Rate: 40-50%
- Reward/Risk: 2:1 target
- Signals per Week: 3-10 (varies by market)
- Holding Period: 2-10 days

## ⚠️ Common Mistakes to Avoid

- ❌ Chasing extended moves (>30% from base)
- ❌ Ignoring volume confirmation
- ❌ Trading without stops
- ❌ Over-trading (quality > quantity)
- ❌ Buying on day 1 only (best entries often day 2-3)
- ❌ Ignoring overall market trend
- ❌ Position sizing too large

## 📚 Learning Resources

**Recommended Reading:**
- "How to Make Money in Stocks" - William O'Neil
- "Trade Like a Stock Market Wizard" - Mark Minervini
- "Momentum Masters" - Mark Ritchie

**Key Concepts:**
- Cup & Handle patterns
- Pivot points
- Relative strength analysis
- Volume analysis
- Base patterns
- Market structure (stages 1-4)

## 🔧 Customization

### Adjust Parameters for Different Styles:

**Conservative (Higher Quality):**
```
Lookback Period: 126 (6 months)
Min Daily Gain: 12%
Volume Multiple: 2.5x
MA Length: 200
```

**Aggressive (More Signals):**
```
Lookback Period: 100 (4 months)
Min Daily Gain: 8%
Volume Multiple: 1.8x
MA Length: 150
```

**Small Cap Focus:**
```
Lookback Period: 150
Min Daily Gain: 15%
Volume Multiple: 3x
Add: Market Cap filter $300M-$2B
```

## 📊 Backtesting Recommended

Before trading live:
1. Paper trade 20+ signals
2. Track results in spreadsheet
3. Calculate win rate and avg win/loss
4. Optimize parameters for your style
5. Only go live after consistent paper profits

## ⚖️ Disclaimer

This scanner is for educational purposes only. Past performance does not guarantee future results. Trading involves substantial risk of loss. Always:
- Do your own research
- Use proper risk management
- Start with small positions
- Never risk more than you can afford to lose
- Consider consulting a financial advisor

## 📝 License

MIT License - Feel free to use, modify, and distribute.

## 🌟 Tags

`trading` `stock-scanner` `momentum` `breakout` `pinescript` `thinkscript` `fintech` `technical-analysis` `day-trading` `swing-trading` `algorithmic-trading` `tradingview` `thinkorswim`

---

**Built with:** TradingView Pine Script v5 | ThinkScript  
**Strategy:** 5000x Breakout Method  
**Author:** Jermaine Ragsdale  
**Last Updated:** December 2025
