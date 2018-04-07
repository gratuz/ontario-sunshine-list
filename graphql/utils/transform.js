//data transformations

const request = require('request');
const stats = require('./salary_stats.js');


const MongoClient = require('mongodb').MongoClient;
const MongoURI = process.env.MONGOURI;
const DBNAME = process.env.DBNAME;
var MongoDB = {};

//util
const dicToArray = function (dic) {
  let keys = Object.keys(dic);
  let result = [];
  result = keys.map((k) => {
    return dic[k];
  });

  return result;
}


MongoClient.connect(MongoURI, {poolSize: 10},function(err, con) {
    if(!err){
      MongoDB = con.db(DBNAME);
      console.log('connected...\n')
      start();
    }
  }
);



const buildJobDataObject = function (title) {
  let j = {};
  j.title = title;
  j.employers = {};
  j.salaries = [];
  return j;
}

const buildEmployerByJobTitleObject = function (name) {
  let e = {};
  e.name = name;
  e.salaries = [];
  return e;
}

const populateJobDataObject = function (ref,job_title,employer_name,salary) {

  if(!ref){
    ref = buildJobDataObject(job_title);
  }

  ref.salaries.push(salary);
  if(ref.employers[employer_name]){
    ref.employers[employer_name].salaries.push(salary);
  }else{
    ref.employers[employer_name] = buildEmployerByJobTitleObject(employer_name)
  }
  return ref;
}

const buildSalariesByJobTitleDocument = function (data) {
  let salary_by_job_title = {};

  data.forEach(d => {

    var job_title = d['Job Title'];
    var employer_name = d['Employer'];
    var salary = Number(d['Salary Paid'].replace('$','').replace(',',''));

    salary_by_job_title[job_title] = populateJobDataObject(salary_by_job_title[job_title],job_title,employer_name,salary);
  });

  return salary_by_job_title;
}


const buildSalariesByJobRoleDocument = function (data) {

  let salary_by_role = {};

  data.forEach(d => {
    var groups = ['Manager','President', 'Senior Vice President', 'Vice President','Executive Director', 'Director', , 'Chair', 'Dean', 'Professor', 'System Administrator', 'Registrar','Senior Systems Analyst','Quality Assurance Lead','Senior Financial Analyst','Senior Consult','Senior Integration Analyst','Senior Consultant', 'Consultant','Chief Executive Officer','Chief Engineer','Engineer','Head','Ombudsperson','Executive Lead','Senior Lead','Team Lead','Lead','Network Administrator','Chief Information Officer','Controller','Nurse Practitioner','Supervisor','Chief Human Resources Officer','Senior Financial Advisor','Chief Financial Officer','Senior Programmer','Senior Research Advisor','Research Advisor','Assistant Deputy Minister','Deputy Minister','Coordinator','Regional Veterinarian','Advisor','Comptroller','Assistant Deputy Attorney General','Deputy Attorney General','Attorney General','Special Counsel','Policy Analyst','Business Analyst'];
    var job_title = d['Job Title'].split('-').join(' ');
    job_title = job_title.replace('VP','Vice President');
    var role = job_title;
    groups.some(g=>{
      if(job_title.indexOf(g) > -1){
        role = g;
        return true;
      }
    });
    var employer_name = d['Employer'];
    var salary = Number(d['Salary Paid'].replace('$','').replace(',',''));
    salary_by_role[role] = populateJobDataObject(salary_by_role[role],role,employer_name,salary);
  });

  return salary_by_role;
}



// returns an array of documents
// use this if the full set of documents is small in size
// and you need to work with all of it
const getCollectionData = function ({collection,db,predicate={}}) {
  let p = new Promise((resolve,reject) => {
    db.collection(collection).find(predicate).toArray()
    .then((data) => {
      resolve(data);
    })
    .catch((error) => {
      reject(error);
    })
  })

  return p;
}

//We want to grab salary data for a job title
//These are good for job titles that are generic like Professor
const on_sunshine_by_jobtitle = function() {
  getCollectionData({collection:'ontario_salaries',db:MongoDB})
  .then((data) => {
    MongoDB.collection('on_sunshine_by_jobtitle').insert(dicToArray(buildSalariesByJobTitleDocument(data)))
    .then((result)=>{
      done(result);
    })
  })
}

const calc_stats_on_sunshine_by_jobtitle = function() {
  
  var mapped = {};

  getCollectionData({collection:'on_sunshine_by_jobtitle',db:MongoDB,predicate:{'salaries.2':{$exists:true}}})
  .then((data) => {
    mapped = data.map(d => {
      d.stats = stats.build_salary_stats(d.salaries);
      return d;
    });

    return MongoDB.collection('on_sunshine_by_jobtitle').drop();
  })
  .then((result)=>{
    return MongoDB.collection('on_sunshine_by_jobtitle').insert(mapped);
  })
  .then((result)=>{
    done(result);
  })

}


//This is a work in progress: we are trying to group similar job titles into the same bucket despite 
//slight variations in spelling: VP, Finance - VP, Sales: both are VP leadership roles.
const on_sunshine_by_role = function() {
  getCollectionData({collection:'ontario_salaries',db:MongoDB})
  .then((data) => {
    MongoDB.collection('on_sunshine_by_role').insert(dicToArray(buildSalariesByJobRoleDocument(data)))
    .then((result)=>{
      done(result);
    })
  })
}

const start = () => {
  calc_stats_on_sunshine_by_jobtitle();
}

const done = (result) => {
  console.log(result);
  process.exit();
}
