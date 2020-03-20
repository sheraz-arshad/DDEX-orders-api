const express = require("express");
const bodyParser = require("body-parser");
const wrapETH = require("./controllers/wrapETH");
const enableTrading = require("./controllers/enableTrading");
const trade = require("./controllers/trade");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

let limitOrders = [];
require("./cron/cron")(limitOrders);

app.post("/wrapETH", async (req, res) => {
    const { privKey, amount } = req.body;

    try {
        const hash = await wrapETH(privKey, amount);
        res.status(200).json(hash);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
})

app.post("/enableTrading", async (req, res) => {
    const { privKey, token } = req.body;

    try {
        const hash = await enableTrading(privKey, token);
        res.status(200).json(hash);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
})

app.post("/trade", async (req, res) => {
    const { privKey, amount, side, orderType, marketId } = req.body;

    try {
        const order = await trade(privKey, amount, side, orderType, marketId, limitOrders);
        res.status(200).json(order);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
})


const PORT = process.env.PORT || 8888;

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})
