const gql = require('graphql');
const data = require('./data.js')



var Statistics = new gql.GraphQLObjectType({
    name: 'statistics',
    fields: function () {
        return {
            id: {
                type: gql.GraphQLID
            },
            min: {
                type: gql.GraphQLFloat
            },
            max: {
                type: gql.GraphQLFloat
            },
            mean: {
                type: gql.GraphQLFloat
            },
            mode: {
                type: gql.GraphQLFloat
            },
            median: {
                type: gql.GraphQLFloat
            },
            variance: {
                type: gql.GraphQLFloat
            },
            sd: {
                type: gql.GraphQLFloat
            },                                                                        
        }
    }    
})

var SalaryStatisticsType = new gql.GraphQLObjectType({
    name: 'salary_stats',
    fields: function () {
        return {
            id: {
                type: gql.GraphQLID
            },
            title: {
                type: gql.GraphQLString
            },
            stats: {
                type: Statistics
            }
        }
    }
});

var SalaryStatisticsQuery = new gql.GraphQLObjectType({
    name: 'SalaryStatisticsQuery',
    fields: function (root,args) {
        return {
            salary_stats: {
                args:{
                    range: {
                        name: 'Number of salaries',
                        type: gql.GraphQLInt
                    }
                },
                type: new gql.GraphQLList(SalaryStatisticsType),
                resolve: function (root,args) {
                    return data.getSalaryData({range:args.range})
                            .then(d=>{
                                return d;
                            });
                }                
            },  
        }
    }
});

var SalaryStatisticsSchema = new gql.GraphQLSchema({
    query: SalaryStatisticsQuery
});

module.exports = {
    SalaryStatisticsSchema: SalaryStatisticsSchema
}
