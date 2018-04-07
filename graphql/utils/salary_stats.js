const ss = require('simple-statistics');

const build_salary_stats = function( salaries ){

    let stats = {};
    stats.min = ss.min(salaries);
    stats.max = ss.max(salaries);
    stats.mean = ss.mean(salaries);
    stats.mode = ss.mode(salaries);
    stats.median = ss.median(salaries);
    stats.variance = ss.variance(salaries);
    stats.sd = ss.standardDeviation(salaries);

    return stats;
}

module.exports = {
    build_salary_stats: build_salary_stats
}