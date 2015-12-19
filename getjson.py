import json
import h5py
import numpy
import datetime
from urllib.request import urlopen


market_data = {}
timeframe = ['weekly',
             'annual',
             'day',
             'monthly']

indexes = ['INDEX_GDAXI',
           'INDEX_GSPC',
           'INDEX_VIX',
           'INDEX_N225',
           'INDEX_SSEC',
           'INDEX_NY',
           'INDEX_STOXX50E']


def getDataFromURL():
    for time in timeframe:
        for index in indexes:
            url = ('https://www.quandl.com/api/v3/datasets/YAHOO/' + index + '.json'
                   '?auth_token=sHWotNFa5Mp9tci_Ee23&order=asc&&start_date=2006-01-01')
            print('Getting data from ' + index + ' timeframe ' + time)
            if time != 'day':
                url += '&collapse=' + time

            file_handle = urlopen(url)
            file_result = file_handle.read()
            data = json.loads(file_result.decode('utf-8'))
            daily_data = data.get('dataset').get('data')
            with open('./datasets/' + index + '-' +  time + '.json', 'w') as f:
                json.dump(daily_data,f)
            market_data[index] = daily_data

def getDataFromFile():
    max_size = 0
    table = {}
    for index in indexes:
        with open(index + '.json', 'r') as f:
            data = json.load(f)
        
        market_data[index] = data

        if len(data) >= max_size:
            max_size = len(data)

    for counter in range(0,max_size):
        line = []
        ind = 0
        for index in indexes:
            data = market_data[index]
            if len(data) > counter:
                line.append(data[counter])
            else:
                line.append([])
            ind = ind + 1
        
        table[counter] = line

    with open('result.json', 'w') as f:
        json.dump(table,f,indent=4)

def calculateMeanValue(data):
    mean = 0
    counter = 0

    for day in data:
        mean += day[4]
        counter += 1

    return (mean/counter)


def calculateCorrelation():
    table_index = []
    table_vix = []
    index = {}
    vix = {}
    final = {}
    counter = 0

    for index_x in indexes:  
        with open('./datasets/' + index_x +'-day.json', 'r') as f:
            vix = json.load(f)

        # for index_y in indexes:  
        with open('./datasets/INDEX_VIX-day.json', 'r') as f:
            index = json.load(f)

        mean_index = calculateMeanValue(index)
        mean_vix = calculateMeanValue(vix)
        key = index_x
        print(key)
        for day in reversed(index):
            if datetime.datetime.strptime(day[0],'%Y-%m-%d').year >= 2007:
                table_index.append([float(day[4]),day[0]])

        for day in reversed(vix):
            if datetime.datetime.strptime(day[0],'%Y-%m-%d').year >= 2007:
                table_vix.append([float(day[4]),day[0]])

        vix_len = len(table_vix)
        index_len = len(table_index)

        if vix_len > index_len:
            diff = vix_len - index_len
            for c in range(diff):
                table_index.append(mean_index)
                diff = diff -1

        elif vix_len < index_len:
            diff = index_len - vix_len
            for c in range(diff):
                table_vix.append(mean_vix)
        
        counter = 0

        for i in range(10,vix_len):
            index = table_index[i]
            vix = table_vix[i]
            print(index)
            # for j in range(i - 10, counter + 10):
                # print(vix,index)
            counter += 1
        

        # array_x = numpy.array(table_vix)        
        # array_y = numpy.array(table_index)
        # print(len([array_x,array_y]))

        # a = numpy.corrcoef([array_x,array_y])
        # final[key] = a.tolist()
        # print(a)

    with open('corr.json', 'w') as f:
        json.dump(final,f,indent=4)

#calculateCorrelation()
getDataFromURL()
# getDataFromFile()

