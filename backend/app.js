'use strict';

const express = require("express");
const bodyParser = require("body-parser");
const uniqid = require('uniqid');
const csv = require("fast-csv");
const app = express();

let savedOrders = []
let symbols = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

const openForBusiness = () => {
  app.post("/api/posts", (req, res, next) => {
    const post = req.body;
    console.log(post);
    res.status(201).json({
      message: 'Filter applied added successfully'
    });
  });

  app.get("/api/posts/symbols", (req, res, next) => {
    const symbolId =  +req.query.symbolId;
    console.log(`posts/symbols symbolId: ${symbolId} symbols length: ${symbols.length}`);

    res.status(200).json({
      message: "symbols fetched successfully!",
      symbols: symbols
    })
  });

  app.get("/api/posts", (req, res, next) => {
    const symbolId =  +req.query.symbolId
    const pageSize = +req.query.pagesize;
    const currentPage = +req.query.page;
    console.log(`posts symbols length: ${symbols.length} pageSize: ${pageSize} currentPage: ${currentPage} symbol id ${symbolId}`);

    let posts = [...savedOrders];
    let maxCount = savedOrders.length;

    if (symbolId > 0) {
      const selectedSymbol = symbols.find( symbol => symbol.id === symbolId );
      posts =  [... posts.filter( order => order.symbol === selectedSymbol.symbol)];
    }

    maxCount = posts.length;

    const strtIndex = pageSize && currentPage ? pageSize * (currentPage - 1): 0;
    const endIndex = pageSize ? pageSize + strtIndex : 1;
    console.log(`strtIndex ${strtIndex} endIndex: ${endIndex}`);

    posts = posts.slice(strtIndex, endIndex);
    console.log(`posts ${posts.length}`);

    res.status(200).json({
      message: "Posts fetched successfully!",
      posts: posts,
      maxPosts: maxCount
    })
  });
}

const loadSymbols = () => {
  const map = new Map();
  let counter = 0;
  symbols = [];
  if (savedOrders > 1) {
    console.log(`loadSymbols savedOrders issue ${savedOrders.length}`);
  }
  savedOrders.forEach((order) => {
    if (!map.has(order.symbol)) {
        map.set(order.symbol, true);    // set any value to Map
        symbols.push({
          id: ++counter,
          symbol: order.symbol,
          count: 1,
          bidQuantity: order.bidQuantity,
          askQuantity: order.askQuantity
         });
    }
    else {
       const value = symbols.find( instrument => instrument.symbol === order.symbol );
       const _bidQuantity = parseFloat(value.bidQuantity) + parseFloat(order.bidQuantity);
       const _askQuantity = parseFloat(value.askQuantity) + parseFloat(order.askQuantity);
       const updatedValue = {
          id: value.id,
          symbol: value.symbol,
          count: ++value.count,
          bidQuantity: _bidQuantity.toString(),
          askQuantity: _askQuantity.toString()
        };
       symbols.pop(value);
       symbols.push(updatedValue);
    }
  });

  console.log(`loadSymbols symbols ${symbols.length}`);
  openForBusiness();
}

let index = 0;

csv.fromPath(".\\backend\\data\\adata.csv")
.on("data", (order) =>{
   if (order[0].length < 6) {
     return;
   }

   let newOrder = {
        id: ++index, //uniqid(),
        symbol: order[0],
        timeStamp: order[1],
        lp: order[2],
        bidPrice: order[3],
        bidQuantity: order[4],
        askPrice: order[5],
        askQuantity: order[6]
    }
    savedOrders.push(newOrder);
})
.on("end", function(){
    console.log(`done orders ${savedOrders.length}`);

  loadSymbols();
});

module.exports = app;

