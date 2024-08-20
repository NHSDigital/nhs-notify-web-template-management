from locust import events
import logging

@events.init_command_line_parser.add_listener
def _(parser):
    parser.add_argument('--user-name', default='', help='Enter username')
    parser.add_argument('--password', default='', help='Enter password')

@events.test_stop.add_listener
def _(environment, **kw):
    if environment.stats.total.fail_ratio > 0.05:
        logging.error("Test failed due to failure ratio > 5%")
        environment.process_exit_code = 1
    elif environment.stats.total.avg_response_time > 200:
        logging.error("Test failed due to average response time ratio > 200 ms")
        environment.process_exit_code = 1
    elif environment.stats.total.get_response_time_percentile(0.95) > 800:
        logging.error("Test failed due to 95th percentile response time > 800 ms")
        environment.process_exit_code = 1
    else:
        environment.process_exit_code = 0
