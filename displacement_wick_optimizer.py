"""
Displacement Wick Strategy Optimizer
Uses VectorBT for fast backtesting and Optuna for parameter optimization.

Requirements:
    pip install vectorbt optuna pandas numpy yfinance

Usage:
    # Use exported TradingView data (recommended for accuracy):
    python displacement_wick_optimizer.py --data mnq_data.csv

    # Or download from Yahoo Finance (less accurate):
    python displacement_wick_optimizer.py
"""

import numpy as np
import pandas as pd
import optuna
from datetime import datetime, timedelta
import argparse
import os
import warnings
warnings.filterwarnings('ignore')

# Try to import vectorbt, fall back to simple backtester if not available
try:
    import vectorbt as vbt
    HAS_VBT = True
except ImportError:
    HAS_VBT = False
    print("vectorbt not installed. Using simple backtester.")
    print("For faster optimization, install: pip install vectorbt")


class DisplacementWickStrategy:
    """
    Displacement Wick Reversal Strategy - Python Implementation
    Matches the Pine Script indicator/strategy logic.
    """

    def __init__(self, df, params=None):
        """
        Initialize with OHLCV dataframe and parameters.

        Args:
            df: DataFrame with columns ['open', 'high', 'low', 'close', 'volume']
            params: Dictionary of strategy parameters
        """
        self.df = df.copy()
        self.params = params or self.default_params()

    @staticmethod
    def default_params():
        return {
            # Displacement
            'displacement_length': 100,
            'min_displacement_strength': 1,
            'max_displacement_strength': 4,

            # Wick
            'min_wick_pct': 15.0,
            'min_wick_body_ratio': 0.25,

            # Trend
            'trend_ema_length': 50,

            # Risk Management
            'entry_method': 'zone_touch',  # 'zone_touch' or 'wick_sweep'
            'target_method': 'fixed_rr',   # 'fixed_rr', 'wick_fill', 'body_fill'
            'stop_method': 'atr',          # 'wick_extreme', 'atr', 'fixed_ticks'
            'atr_stop_mult': 1.5,
            'wick_extreme_mult': 1.0,
            'fixed_stop_ticks': 10,
            'target_rr': 2.0,

            # Filters
            'use_max_risk_filter': True,
            'max_risk_ticks': 60,
            'trade_direction': 'auto',  # 'auto', 'long_only', 'short_only', 'both'

            # Zone
            'zone_extend_bars': 50,

            # Tick value for MNQ
            'tick_size': 0.25,
            'tick_value': 0.50,
        }

    def calculate_indicators(self):
        """Calculate all required indicators."""
        df = self.df
        p = self.params

        # Body and range
        df['body'] = abs(df['close'] - df['open'])
        df['range'] = df['high'] - df['low']

        # Wicks
        df['upper_wick'] = df['high'] - df[['open', 'close']].max(axis=1)
        df['lower_wick'] = df[['open', 'close']].min(axis=1) - df['low']
        df['body_top'] = df[['open', 'close']].max(axis=1)
        df['body_bottom'] = df[['open', 'close']].min(axis=1)

        # Wick percentages and ratios
        df['upper_wick_pct'] = np.where(df['range'] > 0, (df['upper_wick'] / df['range']) * 100, 0)
        df['lower_wick_pct'] = np.where(df['range'] > 0, (df['lower_wick'] / df['range']) * 100, 0)
        df['upper_wick_body_ratio'] = np.where(df['body'] > 0, df['upper_wick'] / df['body'], 0)
        df['lower_wick_body_ratio'] = np.where(df['body'] > 0, df['lower_wick'] / df['body'], 0)

        # Displacement (body size relative to std dev)
        df['body_std'] = df['body'].rolling(p['displacement_length']).std()
        df['displacement_strength'] = np.where(
            df['body'] > df['body_std'] * 4, 4,
            np.where(df['body'] > df['body_std'] * 3, 3,
            np.where(df['body'] > df['body_std'] * 2, 2,
            np.where(df['body'] > df['body_std'], 1, 0))))

        # Trend
        df['ema'] = df['close'].ewm(span=p['trend_ema_length'], adjust=False).mean()
        df['is_uptrend'] = df['close'] > df['ema']
        df['is_downtrend'] = df['close'] < df['ema']

        # ATR for stop calculation
        df['atr'] = self._calculate_atr(df, 14)

        # Candle direction
        df['is_bullish'] = df['close'] > df['open']
        df['is_bearish'] = df['close'] < df['open']

        # Significant wicks
        df['has_upper_wick'] = (df['upper_wick_pct'] >= p['min_wick_pct']) & \
                               (df['upper_wick_body_ratio'] >= p['min_wick_body_ratio'])
        df['has_lower_wick'] = (df['lower_wick_pct'] >= p['min_wick_pct']) & \
                               (df['lower_wick_body_ratio'] >= p['min_wick_body_ratio'])

        # Valid displacement
        df['is_valid_displacement'] = (df['displacement_strength'] >= p['min_displacement_strength']) & \
                                       (df['displacement_strength'] <= p['max_displacement_strength'])

        self.df = df
        return df

    def _calculate_atr(self, df, period=14):
        """Calculate Average True Range."""
        high = df['high']
        low = df['low']
        close = df['close'].shift(1)

        tr1 = high - low
        tr2 = abs(high - close)
        tr3 = abs(low - close)

        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        return tr.rolling(period).mean()

    def generate_signals(self):
        """Generate entry signals based on displacement wick criteria."""
        df = self.df
        p = self.params

        # SHORT signal: Bullish displacement with upper wick (reversal short)
        short_base = df['is_valid_displacement'] & df['is_bullish'] & df['has_upper_wick']

        # LONG signal: Bearish displacement with lower wick (reversal long)
        long_base = df['is_valid_displacement'] & df['is_bearish'] & df['has_lower_wick']

        # Apply trend filter based on trade direction
        if p['trade_direction'] == 'auto':
            df['short_signal'] = short_base & df['is_downtrend']
            df['long_signal'] = long_base & df['is_uptrend']
        elif p['trade_direction'] == 'long_only':
            df['short_signal'] = False
            df['long_signal'] = long_base
        elif p['trade_direction'] == 'short_only':
            df['short_signal'] = short_base
            df['long_signal'] = False
        else:  # both
            df['short_signal'] = short_base
            df['long_signal'] = long_base

        self.df = df
        return df

    def calculate_stops_targets(self):
        """Calculate stop loss and take profit levels for each signal."""
        df = self.df
        p = self.params

        # Initialize columns
        df['stop_price'] = np.nan
        df['target_price'] = np.nan
        df['risk'] = np.nan

        # Calculate stop distance based on method
        if p['stop_method'] == 'atr':
            stop_distance = df['atr'] * p['atr_stop_mult']
        elif p['stop_method'] == 'fixed_ticks':
            # Fixed ticks - create a Series with constant value
            stop_distance = pd.Series(p['fixed_stop_ticks'] * p['tick_size'], index=df.index)
        else:
            stop_distance = pd.Series(0, index=df.index)  # Will use wick extreme

        # SHORT setups
        short_mask = df['short_signal']
        if short_mask.any():
            if p['stop_method'] == 'wick_extreme':
                df.loc[short_mask, 'stop_price'] = df.loc[short_mask, 'high'] + \
                    (df.loc[short_mask, 'upper_wick'] * p['wick_extreme_mult'])
            else:
                df.loc[short_mask, 'stop_price'] = df.loc[short_mask, 'high'] + stop_distance.loc[short_mask]

            # Entry at zone (candle high for shorts)
            entry = df.loc[short_mask, 'high']
            risk = df.loc[short_mask, 'stop_price'] - entry
            df.loc[short_mask, 'risk'] = risk

            if p['target_method'] == 'fixed_rr':
                df.loc[short_mask, 'target_price'] = entry - (risk * p['target_rr'])
            elif p['target_method'] == 'wick_fill':
                df.loc[short_mask, 'target_price'] = df.loc[short_mask, 'body_top']
            elif p['target_method'] == 'entire_candle':
                df.loc[short_mask, 'target_price'] = df.loc[short_mask, 'low']  # SHORT target = candle low
            else:  # body_fill
                df.loc[short_mask, 'target_price'] = df.loc[short_mask, 'body_bottom']

        # LONG setups
        long_mask = df['long_signal']
        if long_mask.any():
            if p['stop_method'] == 'wick_extreme':
                df.loc[long_mask, 'stop_price'] = df.loc[long_mask, 'low'] - \
                    (df.loc[long_mask, 'lower_wick'] * p['wick_extreme_mult'])
            else:
                df.loc[long_mask, 'stop_price'] = df.loc[long_mask, 'low'] - stop_distance.loc[long_mask]

            # Entry at zone (candle low for longs)
            entry = df.loc[long_mask, 'low']
            risk = entry - df.loc[long_mask, 'stop_price']
            df.loc[long_mask, 'risk'] = risk

            if p['target_method'] == 'fixed_rr':
                df.loc[long_mask, 'target_price'] = entry + (risk * p['target_rr'])
            elif p['target_method'] == 'wick_fill':
                df.loc[long_mask, 'target_price'] = df.loc[long_mask, 'body_bottom']
            elif p['target_method'] == 'entire_candle':
                df.loc[long_mask, 'target_price'] = df.loc[long_mask, 'high']  # LONG target = candle high
            else:  # body_fill
                df.loc[long_mask, 'target_price'] = df.loc[long_mask, 'body_top']

        # Apply max risk filter
        if p['use_max_risk_filter']:
            max_risk = p['max_risk_ticks'] * p['tick_size']
            df.loc[df['risk'] > max_risk, 'short_signal'] = False
            df.loc[df['risk'] > max_risk, 'long_signal'] = False

        self.df = df
        return df

    def backtest(self):
        """
        Run backtest and return performance metrics.
        Simple implementation that simulates trade execution.
        """
        df = self.df.copy()
        p = self.params

        trades = []
        position = None

        for i in range(len(df) - 1):
            row = df.iloc[i]
            next_row = df.iloc[i + 1]

            # Check for exit if in position
            if position is not None:
                exit_price = None
                exit_reason = None

                if position['direction'] == 'long':
                    # Check stop
                    if next_row['low'] <= position['stop']:
                        exit_price = position['stop']
                        exit_reason = 'stop'
                    # Check target
                    elif next_row['high'] >= position['target']:
                        exit_price = position['target']
                        exit_reason = 'target'
                else:  # short
                    # Check stop
                    if next_row['high'] >= position['stop']:
                        exit_price = position['stop']
                        exit_reason = 'stop'
                    # Check target
                    elif next_row['low'] <= position['target']:
                        exit_price = position['target']
                        exit_reason = 'target'

                if exit_price is not None:
                    pnl = (exit_price - position['entry']) if position['direction'] == 'long' \
                          else (position['entry'] - exit_price)
                    pnl_ticks = pnl / p['tick_size']
                    pnl_dollars = pnl_ticks * p['tick_value']

                    trades.append({
                        'entry_time': position['entry_time'],
                        'exit_time': df.index[i + 1],
                        'direction': position['direction'],
                        'entry': position['entry'],
                        'exit': exit_price,
                        'stop': position['stop'],
                        'target': position['target'],
                        'pnl_points': pnl,
                        'pnl_ticks': pnl_ticks,
                        'pnl_dollars': pnl_dollars,
                        'exit_reason': exit_reason,
                        'risk': position['risk'],
                        'r_multiple': pnl / position['risk'] if position['risk'] > 0 else 0
                    })
                    position = None

            # Check for new entry (only if not in position)
            if position is None:
                # Entry at next bar's open (simulating real execution)
                if row['short_signal'] and not pd.isna(row['stop_price']):
                    entry_price = next_row['open']
                    risk = row['risk']
                    position = {
                        'direction': 'short',
                        'entry': entry_price,
                        'entry_time': df.index[i + 1],
                        'stop': entry_price + risk,  # Stop above entry for short
                        'target': entry_price - (risk * p['target_rr']),
                        'risk': risk
                    }
                elif row['long_signal'] and not pd.isna(row['stop_price']):
                    entry_price = next_row['open']
                    risk = row['risk']
                    position = {
                        'direction': 'long',
                        'entry': entry_price,
                        'entry_time': df.index[i + 1],
                        'stop': entry_price - risk,  # Stop below entry for long
                        'target': entry_price + (risk * p['target_rr']),
                        'risk': risk
                    }

        return self.calculate_metrics(trades)

    def calculate_metrics(self, trades):
        """Calculate performance metrics from trade list."""
        if not trades:
            return {
                'total_trades': 0,
                'win_rate': 0,
                'profit_factor': 0,
                'total_pnl': 0,
                'avg_winner': 0,
                'avg_loser': 0,
                'max_drawdown': 0,
                'sharpe': 0,
                'avg_r': 0,
            }

        trades_df = pd.DataFrame(trades)

        winners = trades_df[trades_df['pnl_dollars'] > 0]
        losers = trades_df[trades_df['pnl_dollars'] <= 0]

        gross_profit = winners['pnl_dollars'].sum() if len(winners) > 0 else 0
        gross_loss = abs(losers['pnl_dollars'].sum()) if len(losers) > 0 else 0

        # Calculate drawdown
        cumulative = trades_df['pnl_dollars'].cumsum()
        rolling_max = cumulative.cummax()
        drawdown = rolling_max - cumulative
        max_drawdown = drawdown.max()

        return {
            'total_trades': len(trades),
            'win_rate': len(winners) / len(trades) * 100 if len(trades) > 0 else 0,
            'profit_factor': gross_profit / gross_loss if gross_loss > 0 else float('inf'),
            'total_pnl': trades_df['pnl_dollars'].sum(),
            'avg_winner': winners['pnl_dollars'].mean() if len(winners) > 0 else 0,
            'avg_loser': losers['pnl_dollars'].mean() if len(losers) > 0 else 0,
            'max_drawdown': max_drawdown,
            'sharpe': trades_df['pnl_dollars'].mean() / trades_df['pnl_dollars'].std() \
                      if trades_df['pnl_dollars'].std() > 0 else 0,
            'avg_r': trades_df['r_multiple'].mean(),
            'trades': trades_df
        }

    def run(self):
        """Run full strategy pipeline."""
        self.calculate_indicators()
        self.generate_signals()
        self.calculate_stops_targets()
        return self.backtest()


def load_csv_data(filepath):
    """
    Load data from a CSV file exported from TradingView.
    Handles various TradingView export formats.
    """
    print(f"Loading data from: {filepath}")

    if not os.path.exists(filepath):
        print(f"ERROR: File not found: {filepath}")
        return None

    # Try reading CSV with different parsing options
    try:
        df = pd.read_csv(filepath)
    except Exception as e:
        print(f"ERROR reading CSV: {e}")
        return None

    # Standardize column names (lowercase)
    df.columns = [c.lower().strip() for c in df.columns]

    # Handle various TradingView column name formats
    column_mapping = {
        'time': 'time', 'date': 'time', 'datetime': 'time', 'timestamp': 'time',
        'o': 'open', 'h': 'high', 'l': 'low', 'c': 'close', 'v': 'volume',
    }

    for old_name, new_name in column_mapping.items():
        if old_name in df.columns and new_name not in df.columns:
            df.rename(columns={old_name: new_name}, inplace=True)

    # Verify required columns exist
    required = ['open', 'high', 'low', 'close']
    missing = [col for col in required if col not in df.columns]
    if missing:
        print(f"ERROR: Missing required columns: {missing}")
        print(f"Available columns: {list(df.columns)}")
        return None

    # Parse time column if present
    if 'time' in df.columns:
        try:
            df['time'] = pd.to_datetime(df['time'])
            df.set_index('time', inplace=True)
        except Exception as e:
            print(f"Warning: Could not parse time column: {e}")

    # Sort by index (time) if it's a datetime index
    if isinstance(df.index, pd.DatetimeIndex):
        df.sort_index(inplace=True)

    # Remove any rows with NaN in OHLC
    df.dropna(subset=['open', 'high', 'low', 'close'], inplace=True)

    print(f"Loaded {len(df)} bars from CSV")
    if len(df) > 0:
        print(f"Date range: {df.index[0]} to {df.index[-1]}")

    return df


def load_data(symbol='MNQ=F', start_date=None, end_date=None, interval='5m'):
    """
    Load data from Yahoo Finance.
    Note: Yahoo only provides ~60 days of intraday data.
    """
    try:
        import yfinance as yf
    except ImportError:
        print("yfinance not installed. Install with: pip install yfinance")
        return None

    if end_date is None:
        end_date = datetime.now()
    if start_date is None:
        start_date = end_date - timedelta(days=59)  # Yahoo limit

    print(f"Downloading {symbol} data from {start_date.date()} to {end_date.date()}...")

    ticker = yf.Ticker(symbol)
    df = ticker.history(start=start_date, end=end_date, interval=interval)

    if df.empty:
        print("No data returned. Try a different symbol or date range.")
        return None

    # Standardize column names
    df.columns = [c.lower() for c in df.columns]

    print(f"Loaded {len(df)} bars")
    return df


def objective(trial, df):
    """
    Optuna objective function for hyperparameter optimization.
    """
    params = {
        # Displacement
        'displacement_length': trial.suggest_int('displacement_length', 50, 200),
        'min_displacement_strength': trial.suggest_int('min_displacement_strength', 1, 3),
        'max_displacement_strength': trial.suggest_int('max_displacement_strength', 2, 4),

        # Wick
        'min_wick_pct': trial.suggest_float('min_wick_pct', 10.0, 30.0, step=5.0),
        'min_wick_body_ratio': trial.suggest_float('min_wick_body_ratio', 0.15, 0.50, step=0.05),

        # Trend
        'trend_ema_length': trial.suggest_int('trend_ema_length', 20, 100),

        # Risk Management
        'entry_method': trial.suggest_categorical('entry_method', ['zone_touch', 'wick_sweep']),
        'target_method': trial.suggest_categorical('target_method', ['fixed_rr', 'wick_fill', 'body_fill', 'entire_candle']),
        'stop_method': trial.suggest_categorical('stop_method', ['wick_extreme', 'atr', 'fixed_ticks']),
        'atr_stop_mult': trial.suggest_float('atr_stop_mult', 1.0, 3.0, step=0.25),
        'wick_extreme_mult': trial.suggest_float('wick_extreme_mult', 0.5, 2.0, step=0.25),
        'fixed_stop_ticks': trial.suggest_int('fixed_stop_ticks', 8, 40),
        'target_rr': trial.suggest_float('target_rr', 1.0, 3.0, step=0.25),

        # Filters
        'use_max_risk_filter': True,
        'max_risk_ticks': trial.suggest_int('max_risk_ticks', 30, 100),
        'trade_direction': trial.suggest_categorical('trade_direction', ['auto', 'both']),

        # Zone
        'zone_extend_bars': trial.suggest_int('zone_extend_bars', 20, 100),

        # Tick value for MNQ
        'tick_size': 0.25,
        'tick_value': 0.50,
    }

    # Ensure max >= min for displacement strength
    if params['max_displacement_strength'] < params['min_displacement_strength']:
        params['max_displacement_strength'] = params['min_displacement_strength']

    strategy = DisplacementWickStrategy(df, params)
    results = strategy.run()

    # Objective: maximize profit factor while maintaining minimum trade count
    if results['total_trades'] < 20:
        return -1000  # Penalize too few trades

    # Composite score: profit factor + win rate bonus - drawdown penalty
    score = results['profit_factor'] + (results['win_rate'] / 100) - (results['max_drawdown'] / 1000)

    return score


def run_optimization(df, n_trials=100):
    """
    Run Optuna optimization to find best parameters.
    """
    print(f"\nStarting optimization with {n_trials} trials...")
    print("This may take a few minutes...\n")

    study = optuna.create_study(direction='maximize')
    study.optimize(lambda trial: objective(trial, df), n_trials=n_trials, show_progress_bar=True)

    print("\n" + "="*60)
    print("OPTIMIZATION COMPLETE")
    print("="*60)
    print(f"\nBest Score: {study.best_value:.4f}")
    print("\nBest Parameters:")
    for key, value in study.best_params.items():
        print(f"  {key}: {value}")

    # Run backtest with best params
    best_params = DisplacementWickStrategy.default_params()
    best_params.update(study.best_params)

    # Fix displacement strength
    if best_params['max_displacement_strength'] < best_params['min_displacement_strength']:
        best_params['max_displacement_strength'] = best_params['min_displacement_strength']

    strategy = DisplacementWickStrategy(df, best_params)
    results = strategy.run()

    print("\nBacktest Results with Best Parameters:")
    print(f"  Total Trades: {results['total_trades']}")
    print(f"  Win Rate: {results['win_rate']:.2f}%")
    print(f"  Profit Factor: {results['profit_factor']:.3f}")
    print(f"  Total P&L: ${results['total_pnl']:.2f}")
    print(f"  Average R: {results['avg_r']:.2f}")
    print(f"  Max Drawdown: ${results['max_drawdown']:.2f}")

    return study, best_params, results


def main():
    """Main entry point."""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Displacement Wick Strategy Optimizer')
    parser.add_argument('--data', '-d', type=str, help='Path to CSV file with OHLCV data (exported from TradingView)')
    parser.add_argument('--trials', '-t', type=int, default=100, help='Number of optimization trials (default: 100)')
    parser.add_argument('--symbol', '-s', type=str, default='MNQ=F', help='Yahoo Finance symbol if not using CSV (default: MNQ=F)')
    args = parser.parse_args()

    print("="*60)
    print("DISPLACEMENT WICK STRATEGY OPTIMIZER")
    print("="*60)

    df = None

    # Load data from CSV if provided (recommended for accuracy)
    if args.data:
        print("\n[Using TradingView exported data - RECOMMENDED]")
        df = load_csv_data(args.data)
        if df is None:
            print("\nFailed to load CSV. See EXPORT_TV_DATA.md for instructions.")
            return
    else:
        # Fall back to Yahoo Finance data
        print("\n[Using Yahoo Finance data - results may differ from TradingView]")
        print("TIP: Export data from TradingView for more accurate results.")
        print("     Run: python displacement_wick_optimizer.py --data your_data.csv\n")

        df = load_data(args.symbol, interval='5m')
        if df is None or len(df) < 100:
            print("Trying NQ=F instead...")
            df = load_data('NQ=F', interval='5m')

        if df is None or len(df) < 100:
            print("\nCould not load futures data. Using SPY as fallback for demonstration.")
            df = load_data('SPY', interval='5m')
            if df is not None:
                print("Note: Using SPY with $0.01 tick size for demonstration")

    if df is None or len(df) < 100:
        print("ERROR: Could not load sufficient data for backtesting.")
        print("Please ensure you have internet connection and yfinance installed,")
        print("or provide a CSV file with --data option.")
        return

    # Run optimization
    study, best_params, results = run_optimization(df, n_trials=args.trials)

    # Save results
    print("\n" + "="*60)
    print("Saving results...")

    # Save best parameters to file
    params_file = 'best_parameters.txt'
    with open(params_file, 'w') as f:
        f.write("BEST PARAMETERS FOR DISPLACEMENT WICK STRATEGY\n")
        f.write("="*50 + "\n\n")
        f.write("Copy these settings to your TradingView strategy:\n\n")

        for key, value in best_params.items():
            f.write(f"{key}: {value}\n")

        f.write("\n\nBACKTEST RESULTS:\n")
        f.write(f"Total Trades: {results['total_trades']}\n")
        f.write(f"Win Rate: {results['win_rate']:.2f}%\n")
        f.write(f"Profit Factor: {results['profit_factor']:.3f}\n")
        f.write(f"Total P&L: ${results['total_pnl']:.2f}\n")

    print(f"Best parameters saved to: {params_file}")

    # Save trades to CSV
    if 'trades' in results and len(results['trades']) > 0:
        trades_file = 'optimized_trades.csv'
        results['trades'].to_csv(trades_file, index=False)
        print(f"Trade history saved to: {trades_file}")

    print("\nDone! Apply the best parameters to your TradingView strategy.")


if __name__ == '__main__':
    main()
