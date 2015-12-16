var VIS = VIS || {};
VIS.utils = VIS.utils || {};
VIS.index = VIS.index || {};
VIS.index.quotes = VIS.index.quotes || {};
VIS.globals = VIS.globals || {};
VIS.globals.indexes = {
    '0':'INDEX_GDAXI',
    '1': 'INDEX_GSPC',
    '2': 'INDEX_VIX',
    '3': 'INDEX_N225',
    '4':'INDEX_SSEC',
    '5': 'INDEX_NY',
    '6': 'INDEX_STOXX50E'
};

VIS.utils.calculateVolatility = function(index,period) {
    
    var quotes = VIS.index[index],
        length = quotes.length,
        day,
        mean,
        variance,
        counter = 0;

    for(var i = period ; i < length ; i++){
        day = quotes[i];
        mean = 0;
        variance = 0;
        for(var j = i - period; j < period + counter ; j++){
            var dayAux = quotes[j],
                nextDay = quotes[j+1],
                returnValue = (nextDay[4]/dayAux[4])-1;
                nextDay['return'] = returnValue;
                quotes[j+1] = nextDay;
            mean += returnValue;
        }

        mean = mean/period;

        for(var j = i - period; j < period + counter; j++){
            var dayAux = quotes[j],
                returnValue = dayAux['return'] || 0,
                varianceAux = returnValue * returnValue;
            variance += varianceAux;
        }
        day['volatility'] = Math.sqrt(variance/length);
        counter++;
    }
};

VIS.utils.calculateMovingAverage = function(index,period){
    var quotes = VIS.index[index],
        length = quotes.length,
        day,
        mean,
        counter = 0;
    
    for(var i = period ; i < length; i++){
        day = quotes[i];
        mean = 0;
        for(var j = i - period; j < period + counter ; j++){
            var dayAux = quotes[j];
            mean += dayAux['close'];
        }
        counter++;
        mean = mean/period;
        day['ma'+period] = mean;
    }
};