# ============================================================================
# GCR INFLECTION POINT SCANNER - ThinkScript for thinkorswim
# ============================================================================
# Based on GCR's contrarian trading philosophy:
# - "Most people are wrong at EXTREME situations"  
# - Finding inflection points when narratives peak ("Sell the News")
# - Identifying when price meets resistance while crowd is euphoric
# ============================================================================
# Use as: Custom Study for Charts + Scanner Column
# ============================================================================

# ============================================================================
# INPUT PARAMETERS
# ============================================================================

# RSI Settings
input rsiLength = 14;
input rsiOverbought = 75;
input rsiOversold = 25;

# Stochastic Settings
input stochLength = 14;
input stochOverbought = 80;
input stochOversold = 20;

# Volume Settings
input volumeMALength = 20;
input volumeSpikeMultiplier = 2.0;
input volumeExhaustionMultiplier = 2.5;

# Bollinger Bands Settings
input bbLength = 20;
input bbNumDevUp = 2.0;
input bbNumDevDn = 2.0;

# Moving Average Settings
input fastEMALength = 9;
input slowEMALength = 21;
input trendEMALength = 50;

# Divergence Settings
input divergenceLookback = 30;
input enableDivergence = no;

# Display Settings
input showSignals = yes;
input showLabels = yes;

# ============================================================================
# CALCULATIONS
# ============================================================================

# === RSI ===
def rsi = RSI(rsiLength);
def rsiExtremeHigh = rsi >= rsiOverbought;
def rsiExtremeLow = rsi <= rsiOversold;

# === Stochastic ===
# Disabled to reduce complexity - use RSI instead
def stochK = 0;
def stochExtremeHigh = no;
def stochExtremeLow = no;

# === Volume Analysis ===
def volumeMA = Average(volume, volumeMALength);
def volumeSpike = volume > volumeMA * volumeSpikeMultiplier;
def volumeExhaustion = volume > volumeMA * volumeExhaustionMultiplier;
def relativeVolume = if volumeMA > 0 then volume / volumeMA else 0;

# === Bollinger Bands ===
# Use built-in function - more efficient than manual calculation
def bbUpperBand = BollingerBands(bbLength, bbNumDevUp, bbNumDevDn).UpperBand;
def bbLowerBand = BollingerBands(bbLength, bbNumDevUp, bbNumDevDn).LowerBand;
def priceAtUpper = high >= bbUpperBand;
def priceAtLower = low <= bbLowerBand;

# === EMAs ===
def emaFast = ExpAverage(close, fastEMALength);
def emaSlow = ExpAverage(close, slowEMALength);
def emaTrend = ExpAverage(close, trendEMALength);

# ============================================================================
# DIVERGENCE DETECTION (Disabled to reduce complexity)
# ============================================================================

# Divergence disabled - can be re-enabled later if needed
def bearishDivergence = no;
def bullishDivergence = no;

# ============================================================================
# GCR INFLECTION POINT SIGNALS
# ============================================================================

# === BEARISH INFLECTION (Potential Top / Short Setup) ===
def bearishInflection = (rsiExtremeHigh or stochExtremeHigh) and volumeSpike and priceAtUpper;
def strongBearish = bearishInflection and volumeExhaustion and bearishDivergence;

# === BULLISH INFLECTION (Potential Bottom / Long Setup) ===
def bullishInflection = (rsiExtremeLow or stochExtremeLow) and volumeSpike and priceAtLower;
def strongBullish = bullishInflection and volumeExhaustion and bullishDivergence;

# ============================================================================
# SCORING SYSTEM (-100 to +100)
# ============================================================================

# Simplified scoring
def rsiScore = (50 - rsi) / 2;
def bbScore = if priceAtUpper then -25 else (if priceAtLower then 25 else 0);

def GCRScore = rsiScore + bbScore;

# ============================================================================
# PLOTS AND SIGNALS (Disabled for Scanner - use for Chart Study only)
# ============================================================================
# Scanner columns can only have ONE visible plot
# To use visual signals, copy this code to a Chart Study and uncomment below

# plot BearishSignal = if showSignals and bearishInflection then high * 1.002 else Double.NaN;
# BearishSignal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
# BearishSignal.SetDefaultColor(Color.RED);
# BearishSignal.SetLineWeight(2);

# plot StrongBearishSignal = if showSignals and strongBearish then high * 1.004 else Double.NaN;
# StrongBearishSignal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
# StrongBearishSignal.SetDefaultColor(Color.MAGENTA);
# StrongBearishSignal.SetLineWeight(3);

# plot BullishSignal = if showSignals and bullishInflection then low * 0.998 else Double.NaN;
# BullishSignal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
# BullishSignal.SetDefaultColor(Color.GREEN);
# BullishSignal.SetLineWeight(2);

# plot StrongBullishSignal = if showSignals and strongBullish then low * 0.996 else Double.NaN;
# StrongBullishSignal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
# StrongBullishSignal.SetDefaultColor(Color.CYAN);
# StrongBullishSignal.SetLineWeight(3);

# plot BearishDivMarker = if showSignals and bearishDivergence and !bearishInflection then high * 1.001 else Double.NaN;
# BearishDivMarker.SetPaintingStrategy(PaintingStrategy.TRIANGLES);
# BearishDivMarker.SetDefaultColor(Color.DARK_RED);

# plot BullishDivMarker = if showSignals and bullishDivergence and !bullishInflection then low * 0.999 else Double.NaN;
# BullishDivMarker.SetPaintingStrategy(PaintingStrategy.TRIANGLES);
# BullishDivMarker.SetDefaultColor(Color.DARK_GREEN);

# plot FastEMA = emaFast;
# FastEMA.SetDefaultColor(Color.BLUE);
# FastEMA.SetLineWeight(1);

# plot SlowEMA = emaSlow;
# SlowEMA.SetDefaultColor(Color.ORANGE);
# SlowEMA.SetLineWeight(1);

# plot TrendEMA = emaTrend;
# TrendEMA.SetDefaultColor(Color.WHITE);
# TrendEMA.SetLineWeight(2);

# plot BBUpper = bbUpperBand;
# BBUpper.SetDefaultColor(Color.RED);
# BBUpper.SetStyle(Curve.SHORT_DASH);

# plot BBLower = bbLowerBand;
# BBLower.SetDefaultColor(Color.GREEN);
# BBLower.SetStyle(Curve.SHORT_DASH);

# ============================================================================
# LABELS (Disabled for Scanner Compatibility)
# ============================================================================
# Labels are only supported in Chart Studies, not in Scanner Columns
# To use labels, copy this code to a Chart Study instead

# AddLabel(showLabels, "RSI: " + Round(rsi, 1),
#          if rsi > rsiOverbought then Color.RED
#          else if rsi < rsiOversold then Color.GREEN
#          else Color.GRAY);

# AddLabel(showLabels, "RelVol: " + Round(relativeVolume, 2) + "x",
#          if relativeVolume > volumeSpikeMultiplier then Color.YELLOW
#          else Color.GRAY);

# AddLabel(showLabels, "Score: " + Round(GCRScore, 0),
#          if GCRScore > 30 then Color.GREEN
#          else if GCRScore < -30 then Color.RED
#          else Color.GRAY);

# AddLabel(showLabels and strongBearish, "GCR SELL SIGNAL", Color.RED);
# AddLabel(showLabels and strongBullish, "GCR BUY SIGNAL", Color.GREEN);
# AddLabel(showLabels and bearishInflection and !strongBearish, "Bearish Setup", Color.ORANGE);
# AddLabel(showLabels and bullishInflection and !strongBullish, "Bullish Setup", Color.CYAN);

# ============================================================================
# ALERTS
# ============================================================================

Alert(strongBearish, "GCR STRONG BEARISH: Extreme overbought + Volume exhaustion + Divergence", Alert.BAR, Sound.Ding);
Alert(strongBullish, "GCR STRONG BULLISH: Extreme oversold + Capitulation volume + Divergence", Alert.BAR, Sound.Ding);
Alert(bearishInflection and !strongBearish, "GCR Bearish Setup: Watch for reversal", Alert.BAR, Sound.NoSound);
Alert(bullishInflection and !strongBullish, "GCR Bullish Setup: Watch for reversal", Alert.BAR, Sound.NoSound);

# ============================================================================
# SCANNER COLUMNS (Use these in thinkorswim Scanner)
# ============================================================================

# ============================================================================
# SCANNER OUTPUT - Single visible plot required for scanner columns
# ============================================================================
# Values: -2 = Strong Bearish, -1 = Bearish, 0 = Neutral, 1 = Bullish, 2 = Strong Bullish

plot GCRSignal = if strongBearish then -2
                 else if bearishInflection then -1
                 else if strongBullish then 2
                 else if bullishInflection then 1
                 else 0;
