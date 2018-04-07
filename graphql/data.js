const MongoClient = require('mongodb').MongoClient;
const MongoURI = process.env.MONGOURI;
const DBNAME = process.env.DBNAME;
var MongoDB = null;

const getConnection = function(){
    let p = new Promise((resolve,reject)=>{
        if(MongoDB === null){
            MongoClient.connect(MongoURI, {poolSize: 10},function(err, con) {
                if(!err){
                    MongoDB = con.db(DBNAME);
                    resolve(MongoDB);
                }
              }
            );
        }else{
            resolve(MongoDB);
        }
    });

    return p;
}

const getSalaryData = function({range=10}){
    
    let q = {};
    q['salaries.'+range] = {$exists:true};
    let f = {fields:{_id:0,title:1, stats: 1}};

    return getConnection()
    .then((db)=>{
        return db.collection('on_sunshine_by_jobtitle').find(q,f).toArray()
    })
}

module.exports = {
    getSalaryData: getSalaryData
}

