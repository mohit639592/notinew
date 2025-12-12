require("dotenv").config();
const app = require("./src/app");
require("./src/database/db"); // This auto-connects both DBs

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`SERVER SUCCESSFULLY CONNECTED ON PORT ${port}`);
});
