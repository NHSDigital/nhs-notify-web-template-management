import polars as pl

# Define pass/fail thresholds
MAX_AVERAGE_RESPONSE_TIME_MS = 500  # e.g., 500 ms
MAX_FAILURES = 10  # Max allowed failures
MAX_95 = 1000  # Max value for 95%ile for tasks

# Load CSV data with Polars
results_df = pl.read_csv("../results_stats.csv")

# Filter to select TASKS only
task_results_df = results_df.filter(pl.col("Type")=="TASK")
print(task_results_df)

# Calculate average response time and total failures
response_95_time = task_results_df.select(pl.col("95%").max()).item()
avg_response_time = results_df.select(pl.col("Average Response Time").mean()).item()
total_failures = results_df.select(pl.col("Failures/s").sum()).item()

# Check if test meets pass/fail criteria
if (
    avg_response_time > MAX_AVERAGE_RESPONSE_TIME_MS
    or total_failures > MAX_FAILURES
    or response_95_time > MAX_95
):
    print("Test Failed: Thresholds exceeded")
    print("Average response time = ", avg_response_time)
    print("Total failures = ", total_failures)
    print("Max 95th percentile = ", response_95_time)
    exit(1)  # Non-zero exit code for CI/CD to mark test as failed
else:
    print("Test Passed: Within thresholds")
    exit(0)  # Zero exit code for successful test
