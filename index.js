const express = require("express");
const app = express();
const port = 4000;

const userRoute = require("./router/user/router");
const eventRoute = require("./router/event/router");
const ticketRoute = require("./router/ticket/router");

app.use(require("cors")());
app.use(require("body-parser").json());
app.use("/user", userRoute);
app.use("/event", eventRoute);
app.use("/ticket", ticketRoute);

app.listen(port, () => console.log(`TicketSwap API running on port ${port}!`));
