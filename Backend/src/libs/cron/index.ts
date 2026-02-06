import cron from "node-cron";
import {keepAwake} from "#src/services/shared/utils/fetch.js";

// Send GET request every 10 minutes
cron.schedule("*/10 * * * *", async () => {
  await keepAwake();
});
