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
input enableDivergence = yes;

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
def stochK = StochasticFull("k period" = stochLength).FullK;
def stochD = StochasticFull("k period" = stochLength).FullD;
def stochExtremeHigh = stochK >= stochOverbought and stochD >= stochOverbought;
def stochExtremeLow = stochK <= stochOversold and stochD <= stochOversold;

# === Volume Analysis ===
def volumeMA = Average(volume, volumeMALength);
def volumeSpike = volume > volumeMA * volumeSpikeMultiplier;
def volumeExhaustion = volume > volumeMA * volumeExhaustionMultiplier;
def relativeVolume = if volumeMA > 0 then volume / volumeMA else 0;

# === Bollinger Bands ===
def bbUpper = BollingerBands(bbLength, bbNumDevUp, bbNumDevDn).UpperBand;
def bbLower = BollingerBands(bbLength, bbNumDevUp, bbNumDevDn).LowerBand;
def bbMid = BollingerBands(bbLength, bbNumDevUp, bbNumDevDn).MidLine;
def priceAtUpper = high >= bbUpper;
def priceAtLower = low <= bbLower;

# === EMAs ===
def emaFast = ExpAverage(close, fastEMALength);
def emaSlow = ExpAverage(close, slowEMALength);
def emaTrend = ExpAverage(close, trendEMALength);

# === Trend Direction ===
def trendUp = emaFast > emaSlow and close > emaTrend;
def trendDown = emaFast < emaSlow and close < emaTrend;

# ============================================================================
# DIVERGENCE DETECTION
# ============================================================================

# Find swing highs and lows
def swingHigh = high == Highest(high, divergenceLookback);
def swingLow = low == Lowest(low, divergenceLookback);

# Track price and RSI at swing points
def priceAtSwingHigh = if swingHigh then high else priceAtSwingHigh[1];
def rsiAtSwingHigh = if swingHigh then rsi else rsiAtSwingHigh[1];
def prevPriceHigh = priceAtSwingHigh[divergenceLookback/2];
def prevRsiHigh = rsiAtSwingHigh[divergenceLookback/2];

def priceAtSwingLow = if swingLow then low else priceAtSwingLow[1];
def rsiAtSwingLow = if swingLow then rsi else rsiAtSwingLow[1];
def prevPriceLow = priceAtSwingLow[divergenceLookback/2];
def prevRsiLow = rsiAtSwingLow[divergenceLookback/2];

# Bearish divergence: Higher high in price, lower high in RSI
def bearishDivergence = enableDivergence and 
                        high > prevPriceHigh and 
                        rsi < prevRsiHigh and 
                        rsi > 60;

# Bullish divergence: Lower low in price, higher low in RSI
def bullishDivergence = enableDivergence and 
                        low < prevPriceLow and 
                        rsi > prevRsiLow and 
                        rsi < 40;

# ============================================================================
# GCR INFLECTION POINT SIGNALS
# ============================================================================

# === BEARISH INFLECTION (Potential Top / Short Setup) ===
def bearishSentiment = rsiExtremeHigh or stochExtremeHigh;
def bearishVolumeSignal = volumeExhaustion and close < open;
def bearishPriceSignal = priceAtUpper;

# Full bearish inflection signal
def bearishInflection = bearishSentiment and 
                        volumeSpike and 
                        bearishPriceSignal;

# Strong bearish (multiple confirmations)
def strongBearish = bearishInflection and bearishDivergence and volumeExhaustion;

# === BULLISH INFLECTION (Potential Bottom / Long Setup) ===
def bullishSentiment = rsiExtremeLow or stochExtremeLow;
def bullishVolumeSignal = volumeExhaustion and close > open;
def bullishPriceSignal = priceAtLower;

# Full bullish inflection signal
def bullishInflection = bullishSentiment and 
                        volumeSpike and 
                        bullishPriceSignal;

# Strong bullish (multiple confirmations)
def strongBullish = bullishInflection and bullishDivergence and volumeExhaustion;

# ============================================================================
# SCORING SYSTEM (-100 to +100)
# ============================================================================

def rsiScore = (50 - rsi) / 2;
def stochScore = (50 - stochK) * 0.3;
def volScore = if volumeSpike then (if close > open then 10 else -10) else 0;
def divScore = if bearishDivergence then -25 else if bullishDivergence then 25 else 0;
def bbScore = if priceAtUpper then -25 else if priceAtLower then 25 else 0;

def GCRScore = rsiScore + stochScore + volScore + divScore + bbScore;

# ============================================================================
# PLOTS AND SIGNALS
# ============================================================================

# Main signal plot
plot BearishSignal = if showSignals and bearishInflection then high * 1.002 else Double.NaN;
BearishSignal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
BearishSignal.SetDefaultColor(Color.RED);
BearishSignal.SetLineWeight(2);

plot StrongBearishSignal = if showSignals and strongBearish then high * 1.004 else Double.NaN;
StrongBearishSignal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
StrongBearishSignal.SetDefaultColor(Color.MAGENTA);
StrongBearishSignal.SetLineWeight(3);

plot BullishSignal = if showSignals and bullishInflection then low * 0.998 else Double.NaN;
BullishSignal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
BullishSignal.SetDefaultColor(Color.GREEN);
BullishSignal.SetLineWeight(2);

plot StrongBullishSignal = if showSignals and strongBullish then low * 0.996 else Double.NaN;
StrongBullishSignal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
StrongBullishSignal.SetDefaultColor(Color.CYAN);
StrongBullishSignal.SetLineWeight(3);

# Plot divergences
plot BearishDivMarker = if showSignals and bearishDivergence and !bearishInflection then high * 1.001 else Double.NaN;
BearishDivMarker.SetPaintingStrategy(PaintingStrategy.TRIANGLES);
BearishDivMarker.SetDefaultColor(Color.DARK_RED);

plot BullishDivMarker = if showSignals and bullishDivergence and !bullishInflection then low * 0.999 else Double.NaN;
BullishDivMarker.SetPaintingStrategy(PaintingStrategy.TRIANGLES);
BullishDivMarker.SetDefaultColor(Color.DARK_GREEN);

# EMAs for reference
plot FastEMA = emaFast;
FastEMA.SetDefaultColor(Color.BLUE);
FastEMA.SetLineWeight(1);

plot SlowEMA = emaSlow;
SlowEMA.SetDefaultColor(Color.ORANGE);
SlowEMA.SetLineWeight(1);

plot TrendEMA = emaTrend;
TrendEMA.SetDefaultColor(Color.WHITE);
TrendEMA.SetLineWeight(2);

# Bollinger Bands
plot BBUpper = bbUpper;
BBUpper.SetDefaultColor(Color.RED);
BBUpper.SetStyle(Curve.SHORT_DASH);

plot BBLower = bbLower;
BBLower.SetDefaultColor(Color.GREEN);
BBLower.SetStyle(Curve.SHORT_DASH);

# ============================================================================
# LABELS
# ============================================================================

AddLabel(showLabels, "RSI: " + Round(rsi, 1), 
         if rsi > rsiOverbought then Color.RED 
         else if rsi < rsiOversold then Color.GREEN 
         else Color.GRAY);

AddLabel(showLabels, "Stoch: " + Round(stochK, 1), 
         if stochK > stochOverbought then Color.RED 
         else if stochK < stochOversold then Color.GREEN 
         else Color.GRAY);

AddLabel(showLabels, "RelVol: " + Round(relativeVolume, 2) + "x", 
         if relativeVolume > volumeSpikeMultiplier then Color.YELLOW 
         else Color.GRAY);

AddLabel(showLabels, "Score: " + Round(GCRScore, 0), 
         if GCRScore > 30 then Color.GREEN 
         else if GCRScore < -30 then Color.RED 
         else Color.GRAY);

AddLabel(showLabels and strongBearish, "⚠️ GCR SELL SIGNAL", Color.RED);
AddLabel(showLabels and strongBullish, "✅ GCR BUY SIGNAL", Color.GREEN);
AddLabel(showLabels and bearishInflection and !strongBearish, "🔻 Bearish Setup", Color.ORANGE);
AddLabel(showLabels and bullishInflection and !strongBullish, "🔺 Bullish Setup", Color.CYAN);

AddLabel(showLabels and bearishDivergence, "Bearish Div", Color.DARK_RED);
AddLabel(showLabels and bullishDivergence, "Bullish Div", Color.DARK_GREEN);

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

# For scanner - main signal
plot ScanSignal = if strongBearish then -2 
                  else if bearishInflection then -1 
                  else if strongBullish then 2 
                  else if bullishInflection then 1 
                  else 0;
ScanSignal.Hide();

# For scanner - score
plot ScanScore = GCRScore;
ScanScore.Hide();

# For scanner - RSI extreme
plot ScanRSIExtreme = if rsiExtremeHigh then 1 else if rsiExtremeLow then -1 else 0;
ScanRSIExtreme.Hide();

# For scanner - volume spike
plot ScanVolumeSpike = if volumeExhaustion then 2 else if volumeSpike then 1 else 0;
ScanVolumeSpike.Hide();

# For scanner - at Bollinger Band extreme
plot ScanBBExtreme = if priceAtUpper then 1 else if priceAtLower then -1 else 0;
ScanBBExtreme.Hide();

# For scanner - has divergence
plot ScanDivergence = if bearishDivergence then -1 else if bullishDivergence then 1 else 0;
ScanDivergence.Hide();
