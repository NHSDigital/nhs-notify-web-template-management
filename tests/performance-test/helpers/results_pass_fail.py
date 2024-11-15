import polars as pl

# Configure Polars to display more rows
pl.Config.set_tbl_rows(100)  # Set this to the maximum number of rows you want to display
pl.Config.set_tbl_cols(100)  # Set this to the maximum number of columns you want to display

# Define pass/fail thresholds
MIN_TOTAL_TPS = 1          # Minimum total TPS across all events
MAX_95_PERCENTILE_MS = 5000  # Max value for 95th percentile response time for any event (in ms)
MAX_TOTAL_FAILURES = 0       # Max allowed failures across all events

# Load CSV data with Polars, filtering out rows to only include events
results_df = pl.read_csv("results_stats.csv")
event_results_df = results_df.filter(pl.col("Type") == "event")

# Select only the specified columns
selected_columns = [
    "Type", "Name", "Request Count", "Requests/s", "Failure Count",
    "Average Response Time", "Min Response Time", "Max Response Time",
    "95%", "99%"
]
event_results_df = event_results_df.select(selected_columns)
all_results_df = results_df.select(selected_columns)

print(all_results_df)

# Calculate the metrics for pass/fail criteria
total_tps = event_results_df.select(pl.col("Requests/s").sum()).item()
max_95_percentile = event_results_df.select(pl.col("95%").max()).item()
total_failures = event_results_df.select(pl.col("Failure Count").sum()).item()

# Check if test meets pass/fail criteria
if (
    total_tps < MIN_TOTAL_TPS
    or max_95_percentile > MAX_95_PERCENTILE_MS
    or total_failures > MAX_TOTAL_FAILURES
):
    print("Test Failed: Thresholds exceeded")
    print(f"Total TPS = {total_tps}")
    print(f"Max 95th percentile response time = {max_95_percentile} ms")
    print(f"Total failures = {total_failures}")
    exit(1)  # Non-zero exit code for CI/CD to mark test as failed
else:
    print("Test Passed: Within thresholds")
    exit(0)  # Zero exit code for successful test
