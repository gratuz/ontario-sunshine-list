var dotenv = require('dotenv');
dotenv.load();

const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema.js')

var app = express();

app.use('/salary-stats', graphqlHTTP({
   schema: schema.SalaryStatisticsSchema,
 }));
 
 
app.listen(8080);
console.log("Server listening on 8080");

