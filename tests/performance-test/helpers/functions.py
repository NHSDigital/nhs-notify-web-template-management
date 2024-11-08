import asyncio
import logging
import time
from locust_plugins.users.playwright import event
from playwright.async_api import TimeoutError

# Configure logging to capture Playwright errors
logging.basicConfig(level=logging.ERROR)
playwright_logger = logging.getLogger(__name__)

async def run_async(coro):
    if not asyncio.iscoroutine(coro):
        raise TypeError("run_async received a non-coroutine function.")
    return await coro
    # return asyncio.get_event_loop().run_until_complete(coro)

async def log_and_handle_error(self, event_name, coro):
    if not asyncio.iscoroutine(coro):
        raise TypeError(f"Expected coroutine in '{event_name}', got {type(coro).__name__}")

    for attempt in range(1, 3):
        async def inner(self):
            async with event(self, event_name):  # log the specific event
                try:
                    await coro
                    return True
                except TimeoutError as te:
                    playwright_logger.error(f"TimeoutError in '{event_name}': {te}")
                    return False
                except AssertionError as ae:
                    playwright_logger.error(f"AssertionError in '{event_name}': {ae}")
                    return False
                except Exception as e:
                    playwright_logger.error(f"Exception in '{event_name}': {e}")
                    return False

        success =  await inner(self)
        if success:
            return

        if attempt < 3:
            playwright_logger.info(f"Retrying '{event_name}' after {1} seconds...")
            await asyncio.sleep(2)
            # time.sleep(2)  # Delay before the next retry attempt

    # After exhausting retries, log and fail
    playwright_logger.error(f"Failed '{event_name}' after {1} attempts.")
    raise Exception(f"Failed '{event_name}' after {1} attempts.")
